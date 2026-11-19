import { describe, expect, it } from "vitest";
import { generateBrandedInvoicePdf } from "@/infrastructure/billing/pdf-invoice";
import { createInitialSandboxState } from "@/infrastructure/repositories/seed-data";

describe("white-label PDF invoice engine", () => {
  it("generates a valid branded PDF binary stream for both open and settled invoices", async () => {
    const seed = createInitialSandboxState();
    const project = seed.projects[0]!;
    const paidInvoice = seed.invoices[0]!;
    const openInvoice = seed.invoices[1]!;

    const paidPdf = await generateBrandedInvoicePdf({
      studio: seed.studio,
      project,
      invoice: paidInvoice,
    });
    const openPdf = await generateBrandedInvoicePdf({
      studio: seed.studio,
      project,
      invoice: openInvoice,
    });

    expect(Buffer.from(paidPdf.slice(0, 5)).toString("ascii")).toBe("%PDF-");
    expect(paidPdf.byteLength).toBeGreaterThan(1000);
    expect(Buffer.from(openPdf.slice(0, 5)).toString("ascii")).toBe("%PDF-");
    expect(openPdf.byteLength).toBeGreaterThan(1000);
  });
});
