import type { DeliverableStatus, InvoiceStatus } from "./types";

export class InvalidStateTransitionError extends Error {
  readonly domain: "deliverable" | "invoice";
  readonly from: string;
  readonly to: string;

  constructor(domain: "deliverable" | "invoice", from: string, to: string) {
    super(`Cannot transition ${domain} from "${from}" to "${to}".`);
    this.name = "InvalidStateTransitionError";
    this.domain = domain;
    this.from = from;
    this.to = to;
  }
}

const DELIVERABLE_TRANSITIONS: Record<DeliverableStatus, readonly DeliverableStatus[]> = {
  draft: ["in_review"],
  in_review: ["approved", "changes_requested"],
  changes_requested: ["in_review"],
  approved: [],
};

const INVOICE_TRANSITIONS: Record<InvoiceStatus, readonly InvoiceStatus[]> = {
  draft: ["sent", "void"],
  sent: ["paid", "overdue", "void"],
  overdue: ["paid", "void"],
  paid: [],
  void: [],
};

export function canTransitionDeliverable(
  from: DeliverableStatus,
  to: DeliverableStatus
): boolean {
  return DELIVERABLE_TRANSITIONS[from].includes(to);
}

export function assertDeliverableTransition(
  from: DeliverableStatus,
  to: DeliverableStatus
): DeliverableStatus {
  if (!canTransitionDeliverable(from, to)) {
    throw new InvalidStateTransitionError("deliverable", from, to);
  }
  return to;
}

export function canTransitionInvoice(
  from: InvoiceStatus,
  to: InvoiceStatus
): boolean {
  return INVOICE_TRANSITIONS[from].includes(to);
}

export function assertInvoiceTransition(
  from: InvoiceStatus,
  to: InvoiceStatus
): InvoiceStatus {
  if (!canTransitionInvoice(from, to)) {
    throw new InvalidStateTransitionError("invoice", from, to);
  }
  return to;
}
