import { describe, expect, it } from "vitest";
import { hashPasscode, verifyPasscode } from "@/infrastructure/security/passcode";
import { SlidingWindowRateLimiter } from "@/infrastructure/security/rate-limit";
import {
  createPortalSessionToken,
  getPortalCookieName,
  verifyPortalSessionToken,
} from "@/infrastructure/security/session-cookie";

describe("client portal security primitives", () => {
  it("hashes and verifies passcodes with scrypt and rejects mismatches", () => {
    const { hash, salt } = hashPasscode("meridian2026");
    expect(verifyPasscode("meridian2026", hash, salt)).toBe(true);
    expect(verifyPasscode("wrong-pass", hash, salt)).toBe(false);
    expect(verifyPasscode("", hash, salt)).toBe(false);
    expect(() => hashPasscode("abc")).toThrow(RangeError);
  });

  it("signs portal cookies and immediately invalidates old versions on rotation", () => {
    const secret = "unit-test-secret-key-0123456789";
    const token = createPortalSessionToken(
      { projectId: "proj-1", studioSlug: "atelier", passcodeVersion: 1 },
      3600,
      secret
    );

    expect(getPortalCookieName("proj-1")).toBe("cp_portal_proj-1");
    expect(verifyPortalSessionToken(token, "proj-1", 1, secret)?.projectId).toBe("proj-1");
    // Rotated passcode version must reject older cookie
    expect(verifyPortalSessionToken(token, "proj-1", 2, secret)).toBeNull();
    // Different project scope must reject
    expect(verifyPortalSessionToken(token, "proj-2", 1, secret)).toBeNull();
    // Tampered token must reject
    expect(verifyPortalSessionToken(`${token}tamper`, "proj-1", 1, secret)).toBeNull();
  });

  it("enforces brute-force sliding window lockout and resets cleanly", () => {
    const limiter = new SlidingWindowRateLimiter(3, 60_000);
    const t0 = 1_000_000;

    expect(limiter.check("ip:proj", t0).allowed).toBe(true);
    expect(limiter.recordFailure("ip:proj", t0 + 1000).remaining).toBe(2);
    expect(limiter.recordFailure("ip:proj", t0 + 2000).remaining).toBe(1);
    expect(limiter.recordFailure("ip:proj", t0 + 3000).allowed).toBe(false);
    expect(limiter.check("ip:proj", t0 + 4000).allowed).toBe(false);

    // After sliding window expires
    expect(limiter.check("ip:proj", t0 + 65_000).allowed).toBe(true);

    limiter.reset("ip:proj");
    expect(limiter.check("ip:proj", t0 + 4000).remaining).toBe(3);
  });
});
