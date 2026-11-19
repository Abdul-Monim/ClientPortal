import { describe, expect, it } from "vitest";
import { SandboxPortalRepository } from "@/infrastructure/repositories/sandbox-repository";

describe("Invoice Settlement & Financial State Machine", () => {
  it("transitions an open invoice to paid and updates audit metadata", async () => {
    const repo = new SandboxPortalRepository();
    const studio = await repo.getStudioForOwner();
    const projects = await repo.listProjects(studio.id);
    const project = projects[0]!;

    const bundle = await repo.getProjectBundleById(project.id);
    const invoices = bundle?.invoices || [];
    const openInvoice = invoices.find((i) => i.status === "sent" || i.status === "overdue") || invoices[0]!;

    const settled = await repo.updateInvoiceStatus(openInvoice.id, "paid", {
      paymentMethodNote: "Card via Client Portal Hub",
    });

    expect(settled.status).toBe("paid");
    expect(settled.paymentMethodNote).toBe("Card via Client Portal Hub");
    expect(settled.paidAt).toBeDefined();

    // Verify retrieval reflects settled status
    const ctx = await repo.getInvoiceWithContext(openInvoice.id);
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
