import { describe, expect, it } from "vitest";
import { SandboxPortalRepository } from "@/infrastructure/repositories/sandbox-repository";

describe("Invoice Settlement & Financial State Machine", () => {
  it("transitions an open invoice to paid and updates audit metadata", async () => {
    const repo = new SandboxPortalRepository();
    const studio = await repo.getStudioForOwner();
    const projects = await repo.listProjects(studio.id);
    const project = projects[0]!;

    // Create a fresh sent invoice to test deterministic transition to paid
    const testInvoice = await repo.createInvoice({
      projectId: project.id,
      title: "Design Retainer Settlement",
      currency: "USD",
      taxBps: 0,
      lineItems: [
        {
          id: "li-settle-1",
          description: "Design sprint retainer",
          quantity: 1,
          unitAmountCents: 250_000,
        },
      ],
      notes: "Payment due upon receipt",
      dueDate: "2026-12-15",
      status: "sent",
    });

    const settled = await repo.updateInvoiceStatus(testInvoice.id, "paid", {
      paymentMethodNote: "Card via Client Portal Hub",
    });

    expect(settled.status).toBe("paid");
    expect(settled.paymentMethodNote).toBe("Card via Client Portal Hub");
    expect(settled.paidAt).toBeDefined();

    // Verify retrieval reflects settled status
    const ctx = await repo.getInvoiceWithContext(testInvoice.id);
    expect(ctx?.invoice.status).toBe("paid");
  });

  it("supports issuing a draft invoice to sent status", async () => {
    const repo = new SandboxPortalRepository();
    const studio = await repo.getStudioForOwner();
    const projects = await repo.listProjects(studio.id);
    const project = projects[0]!;

    // Create a draft invoice
    const draft = await repo.createInvoice({
      projectId: project.id,
      title: "Discovery Phase & Wireframes",
      currency: "USD",
      taxBps: 0,
      lineItems: [
        {
          id: "li-test-1",
          description: "UX wireframes & research",
          quantity: 1,
          unitAmountCents: 120000,
        },
      ],
      notes: "Payment due within 14 days",
      dueDate: "2026-12-01",
      status: "draft",
      stripeInvoiceId: null,
      stripeHostedUrl: null,
      stripePdfUrl: null,
    });

    expect(draft.status).toBe("draft");

    // Advance to sent
    const issued = await repo.updateInvoiceStatus(draft.id, "sent");
    expect(issued.status).toBe("sent");

    // Void the invoice
    const voided = await repo.updateInvoiceStatus(draft.id, "void");
    expect(voided.status).toBe("void");
  });
});
