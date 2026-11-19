import { describe, expect, it } from "vitest";
import { sendTransactionalEmail } from "@/infrastructure/notifications/email";

describe("transactional email notification adapter", () => {
  it("falls back cleanly to dry_run mode when RESEND_API_KEY is absent", async () => {
    const original = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;
    try {
      const result = await sendTransactionalEmail({
        to: "client@example.com",
        subject: "Portal Ready",
        text: "Your deliverables are ready to review.",
      });
      expect(result).toEqual({
        sent: false,
        mode: "dry_run",
        messageId: null,
      });
    } finally {
      if (original !== undefined) {
        process.env.RESEND_API_KEY = original;
      }
    }
  });
});
