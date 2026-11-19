import type { Invoice, InvoiceLineItem } from "./types";

export interface LineItemDraft {
  id?: string;
  description: string;
  quantity: number;
  unitAmountCents: number;
}

export interface InvoiceTotals {
  lineItems: InvoiceLineItem[];
  subtotalCents: number;
  taxBps: number;
  taxCents: number;
  totalCents: number;
}

export interface AccountsReceivableSummary {
  totalBilledCents: number;
  totalPaidCents: number;
  totalOutstandingCents: number;
  totalOverdueCents: number;
  paidCount: number;
  openCount: number;
  overdueCount: number;
}

/**
 * Converts a decimal dollar figure into exact integer cents using half-up rounding.
 */
export function dollarsToCents(dollars: number): number {
  if (!Number.isFinite(dollars) || dollars < 0) {
    throw new RangeError("Dollar amount must be a finite non-negative number.");
  }
  return Math.round(dollars * 100);
}

/**
 * Converts a tax percentage (e.g. 8.25%) into integer basis points (825 bps).
 */
export function taxPercentToBps(taxPercent: number): number {
  if (!Number.isFinite(taxPercent) || taxPercent < 0 || taxPercent > 100) {
    throw new RangeError("Tax percentage must be between 0 and 100.");
  }
  return Math.round(taxPercent * 100);
}

export function calculateLineItemCents(quantity: number, unitAmountCents: number): number {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new RangeError("Line item quantity must be a positive integer.");
  }
  if (!Number.isInteger(unitAmountCents) || unitAmountCents < 0) {
    throw new RangeError("Unit amount must be a non-negative integer in cents.");
  }
  return quantity * unitAmountCents;
}

export function calculateInvoiceTotals(
  drafts: LineItemDraft[],
  taxBps: number
): InvoiceTotals {
  if (drafts.length === 0) {
    throw new RangeError("An invoice requires at least one line item.");
  }
  if (!Number.isInteger(taxBps) || taxBps < 0 || taxBps > 10_000) {
    throw new RangeError("Tax basis points must be an integer between 0 and 10000.");
  }

  const lineItems: InvoiceLineItem[] = drafts.map((item, idx) => {
    const amountCents = calculateLineItemCents(item.quantity, item.unitAmountCents);
    return {
      id: item.id ?? `li-${idx + 1}`,
      description: item.description.trim(),
      quantity: item.quantity,
      unitAmountCents: item.unitAmountCents,
      amountCents,
    };
  });

  const subtotalCents = lineItems.reduce((acc, item) => acc + item.amountCents, 0);
  const taxCents = Math.round((subtotalCents * taxBps) / 10_000);
  const totalCents = subtotalCents + taxCents;

  return {
    lineItems,
    subtotalCents,
    taxBps,
    taxCents,
    totalCents,
  };
}

export function formatCurrencyCents(cents: number, currency = "USD"): string {
  const safeCents = Number.isFinite(cents) ? cents : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeCents / 100);
}

export function summarizeAccountsReceivable(
  invoices: Pick<Invoice, "status" | "totalCents">[]
): AccountsReceivableSummary {
  const summary: AccountsReceivableSummary = {
    totalBilledCents: 0,
    totalPaidCents: 0,
    totalOutstandingCents: 0,
    totalOverdueCents: 0,
    paidCount: 0,
    openCount: 0,
    overdueCount: 0,
  };

  for (const inv of invoices) {
    if (inv.status === "void" || inv.status === "draft") {
      continue;
    }

    summary.totalBilledCents += inv.totalCents;

    if (inv.status === "paid") {
      summary.totalPaidCents += inv.totalCents;
      summary.paidCount += 1;
    } else if (inv.status === "overdue") {
      summary.totalOutstandingCents += inv.totalCents;
      summary.totalOverdueCents += inv.totalCents;
      summary.openCount += 1;
      summary.overdueCount += 1;
    } else if (inv.status === "sent") {
      summary.totalOutstandingCents += inv.totalCents;
      summary.openCount += 1;
    }
  }

  return summary;
}
