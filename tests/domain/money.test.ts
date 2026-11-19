import { describe, expect, it } from "vitest";
import {
  calculateInvoiceTotals,
  calculateLineItemCents,
  dollarsToCents,
  formatCurrencyCents,
  summarizeAccountsReceivable,
  taxPercentToBps,
} from "@/domain/money";

describe("money domain invariants", () => {
  it("converts dollars and tax percentages into exact integers", () => {
    expect(dollarsToCents(19.99)).toBe(1999);
    expect(dollarsToCents(0)).toBe(0);
    expect(taxPercentToBps(8.25)).toBe(825);
    expect(taxPercentToBps(0)).toBe(0);
  });

  it("rejects negative or invalid inputs", () => {
    expect(() => dollarsToCents(-1)).toThrow(RangeError);
    expect(() => taxPercentToBps(120)).toThrow(RangeError);
    expect(() => calculateLineItemCents(0, 1000)).toThrow(RangeError);
    expect(() => calculateLineItemCents(2, -50)).toThrow(RangeError);
  });

  it("calculates itemized subtotal, basis-point tax, and total without floating-point drift", () => {
    const totals = calculateInvoiceTotals(
      [
        { description: "UI Design System", quantity: 1, unitAmountCents: 240_000 },
        { description: "QA Pass", quantity: 3, unitAmountCents: 15_555 },
      ],
      825
    );

    expect(totals.subtotalCents).toBe(286_665);
    expect(totals.taxCents).toBe(23_650);
    expect(totals.totalCents).toBe(310_315);
    expect(formatCurrencyCents(totals.totalCents, "USD")).toBe("$3,103.15");
  });

  it("rejects empty invoice drafts and out-of-range basis points", () => {
    expect(() => calculateInvoiceTotals([], 0)).toThrow(RangeError);
    expect(() =>
      calculateInvoiceTotals(
        [{ description: "Item", quantity: 1, unitAmountCents: 100 }],
        10_001
      )
    ).toThrow(RangeError);
  });

  it("summarizes accounts receivable ignoring draft and void invoices", () => {
    const ar = summarizeAccountsReceivable([
      { status: "paid", totalCents: 400_000 },
      { status: "sent", totalCents: 150_000 },
      { status: "overdue", totalCents: 50_000 },
      { status: "draft", totalCents: 900_000 },
      { status: "void", totalCents: 300_000 },
    ]);

    expect(ar.totalBilledCents).toBe(600_000);
    expect(ar.totalPaidCents).toBe(400_000);
    expect(ar.totalOutstandingCents).toBe(200_000);
    expect(ar.totalOverdueCents).toBe(50_000);
    expect(ar.paidCount).toBe(1);
    expect(ar.openCount).toBe(2);
    expect(ar.overdueCount).toBe(1);
  });
});
