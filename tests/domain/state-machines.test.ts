import { describe, expect, it } from "vitest";
import {
  assertDeliverableTransition,
  assertInvoiceTransition,
  canTransitionDeliverable,
  canTransitionInvoice,
  InvalidStateTransitionError,
} from "@/domain/state-machines";

describe("deliverable & invoice finite state machines", () => {
  it("allows valid deliverable lifecycle transitions", () => {
    expect(assertDeliverableTransition("draft", "in_review")).toBe("in_review");
    expect(assertDeliverableTransition("in_review", "changes_requested")).toBe(
      "changes_requested"
    );
    expect(assertDeliverableTransition("changes_requested", "in_review")).toBe(
      "in_review"
    );
    expect(assertDeliverableTransition("in_review", "approved")).toBe("approved");
  });

  it("blocks illegal deliverable jumps and locks approved versions", () => {
    expect(canTransitionDeliverable("draft", "approved")).toBe(false);
    expect(canTransitionDeliverable("approved", "changes_requested")).toBe(false);
    expect(() => assertDeliverableTransition("approved", "in_review")).toThrow(
      InvalidStateTransitionError
    );
  });

  it("enforces invoice lifecycle transitions", () => {
    expect(assertInvoiceTransition("draft", "sent")).toBe("sent");
    expect(assertInvoiceTransition("sent", "paid")).toBe("paid");
    expect(assertInvoiceTransition("sent", "overdue")).toBe("overdue");
    expect(assertInvoiceTransition("overdue", "paid")).toBe("paid");
    expect(canTransitionInvoice("paid", "void")).toBe(false);
    expect(() => assertInvoiceTransition("void", "sent")).toThrow(
      InvalidStateTransitionError
    );
  });
});
