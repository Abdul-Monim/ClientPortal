import { describe, expect, it } from "vitest";
import { SandboxPortalRepository } from "@/infrastructure/repositories/sandbox-repository";
import { hashPasscode, verifyPasscode } from "@/infrastructure/security/passcode";

describe("sandbox portal repository end-to-end lifecycle", () => {
  it("supports project creation, passcode rotation, deliverable revisions, approvals, comments, and invoices", async () => {
    const repo = new SandboxPortalRepository(":memory:");
    const studio = await repo.getStudioForOwner();
    expect(studio.slug).toBe("atelier-vance");

    const pass1 = hashPasscode("alpha2026");
    const project = await repo.createProject(studio.id, {
      title: "Orbit Mobile Launch",
      slug: "orbit-mobile-launch",
      summary: "Launch kit for Orbit.",
      clientName: "Samira Khan",
      clientCompany: "Orbit Mobility",
      clientEmail: "samira@orbit.io",
      passcodeHash: pass1.hash,
      passcodeSalt: pass1.salt,
      passcodeHint: "Orbit + year",
      targetLaunchDate: "2026-12-30",
    });

    expect(verifyPasscode("alpha2026", project.passcodeHash, project.passcodeSalt)).toBe(true);

    // Rotate password and confirm version increments
    const pass2 = hashPasscode("orbit9999");
    const rotated = await repo.rotateProjectPasscode(
      project.id,
      pass2.hash,
      pass2.salt,
      "Updated hint"
    );
    expect(rotated.passcodeVersion).toBe(2);
    expect(verifyPasscode("orbit9999", rotated.passcodeHash, rotated.passcodeSalt)).toBe(true);

    // Milestone + Deliverable + Revision Request + v2 + Formal Approval
    const milestone = await repo.createMilestone({
      projectId: project.id,
      title: "Prototype",
      description: "Interactive mobile flows",
      weightPct: 100,
      dueDate: "2026-12-15",
    });

    const del = await repo.createDeliverable({
      projectId: project.id,
      milestoneId: milestone.id,
      title: "Figma Flow Deck",
      summary: "Onboarding screens",
      kind: "figma",
      assetUrl: null,
      assetPublicId: null,
      externalUrl: "https://figma.com/design/orbit-v1",
      releaseNotes: "First draft",
      fileSizeBytes: null,
    });

    const requested = await repo.submitDeliverableDecision({
      projectId: project.id,
      deliverableId: del.id,
      deliverableVersionId: del.versions[0]!.id,
      decision: "changes_requested",
      reviewerName: "Samira Khan",
      reviewerEmail: "samira@orbit.io",
      feedbackNote: "Please increase button contrast on screen 2.",
    });
    expect(requested.status).toBe("changes_requested");

    const revised = await repo.publishDeliverableVersion({
      projectId: project.id,
      deliverableId: del.id,
      assetUrl: null,
      assetPublicId: null,
      externalUrl: "https://figma.com/design/orbit-v2",
      releaseNotes: "Contrast raised to WCAG AA.",
      fileSizeBytes: null,
    });
    expect(revised.currentVersion).toBe(2);
    expect(revised.status).toBe("in_review");

    const approved = await repo.submitDeliverableDecision({
      projectId: project.id,
      deliverableId: del.id,
      deliverableVersionId: revised.versions[1]!.id,
      decision: "approved",
      reviewerName: "Samira Khan",
      reviewerEmail: "samira@orbit.io",
      feedbackNote: "Approved for handoff.",
    });
    expect(approved.status).toBe("approved");
    expect(approved.approvals).toHaveLength(2);

    const comment = await repo.addDeliverableComment({
      projectId: project.id,
      deliverableId: del.id,
      authorRole: "client",
      authorName: "Samira Khan",
      body: "Looks sharp!",
    });
    expect(comment.body).toBe("Looks sharp!");

    // Create & settle invoice
    const invoice = await repo.createInvoice({
      projectId: project.id,
      title: "Milestone 1 Settlement",
      currency: "USD",
      taxBps: 500,
      lineItems: [{ description: "Prototype Sprint", quantity: 1, unitAmountCents: 200_000 }],
      notes: "Net 14",
      dueDate: "2026-12-20",
      status: "sent",
    });
    expect(invoice.totalCents).toBe(210_000);

    const settled = await repo.updateInvoiceStatus(invoice.id, "paid", {
      paymentMethodNote: "Bank transfer",
    });
    expect(settled.status).toBe("paid");
    expect(settled.paidAt).toBeTruthy();
  });
});
