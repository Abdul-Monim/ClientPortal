import { describe, expect, it } from "vitest";
import {
  clientPasscodeAuthSchema,
  createDeliverableSchema,
  createInvoiceSchema,
  createProjectSchema,
  deliverableDecisionSchema,
  publishDeliverableVersionSchema,
  updateStudioSchema,
} from "@/domain/schemas";

describe("canonical SDD Zod validation schemas", () => {
  it("validates studio branding updates including optional custom domains", () => {
    const valid = updateStudioSchema.safeParse({
      studioName: "Atelier Vance",
      slug: "atelier-vance",
      customDomain: "client.ateliervance.com",
      tagline: "Brand & Product Studio",
      logoUrl: "https://res.cloudinary.com/demo/image/upload/logo.png",
      accentHex: "#2F5D50",
      welcomeMessage: "Welcome to your private workspace.",
      contactEmail: "hello@ateliervance.com",
      billingAddress: "180 Mercer St",
    });
    expect(valid.success).toBe(true);

    const badDomain = updateStudioSchema.safeParse({
      studioName: "Atelier",
      slug: "atelier",
      customDomain: "not a domain",
      accentHex: "#2F5D50",
      welcomeMessage: "Welcome!",
      contactEmail: "hello@atelier.com",
    });
    expect(badDomain.success).toBe(false);
  });

  it("enforces attachment requirements on deliverables and version updates", () => {
    const missingUrl = createDeliverableSchema.safeParse({
      projectId: "p1",
      title: "Mockup",
      kind: "figma",
      externalUrl: "",
      assetUrl: "",
    });
    expect(missingUrl.success).toBe(false);

    const validVersion = publishDeliverableVersionSchema.safeParse({
      projectId: "p1",
      deliverableId: "d1",
      externalUrl: "https://figma.com/design/v2",
      releaseNotes: "Refined spacing.",
    });
    expect(validVersion.success).toBe(true);
  });

  it("requires descriptive notes when clients request changes", () => {
    const missingReason = deliverableDecisionSchema.safeParse({
      deliverableVersionId: "v1",
      decision: "changes_requested",
      reviewerName: "Elena",
      feedbackNote: "",
    });
    expect(missingReason.success).toBe(false);

    const validApproval = deliverableDecisionSchema.safeParse({
      deliverableVersionId: "v1",
      decision: "approved",
      reviewerName: "Elena Rostova",
      reviewerEmail: "elena@meridian.io",
      feedbackNote: "",
    });
    expect(validApproval.success).toBe(true);
  });

  it("validates project creation, passcode auth, and itemized invoices", () => {
    expect(
      createProjectSchema.safeParse({
        title: "Meridian",
        slug: "meridian",
        clientName: "Elena",
        clientCompany: "Meridian Labs",
        clientEmail: "elena@meridian.io",
        passcode: "meridian2026",
      }).success
    ).toBe(true);

    expect(
      clientPasscodeAuthSchema.safeParse({
        studioSlug: "atelier-vance",
        projectSlug: "meridian-rebrand",
        passcode: "meridian2026",
      }).success
    ).toBe(true);

    expect(
      createInvoiceSchema.safeParse({
        projectId: "proj-1",
        title: "Milestone 1",
        currency: "USD",
        taxPercent: 5,
        dueDate: "2026-12-01",
        lineItems: [{ description: "Sprint", quantity: 1, unitAmountDollars: 1500 }],
      }).success
    ).toBe(true);
  });
});
