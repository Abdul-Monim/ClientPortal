import { describe, expect, it } from "vitest";
import { freelancerLoginSchema, freelancerSignupSchema } from "@/domain/schemas";
import {
  getCurrentFreelancer,
  loginFreelancer,
  logoutFreelancer,
  signupFreelancer,
} from "@/services/auth-service";

describe("Freelancer Auth Module & Schemas", () => {
  it("validates compliant login inputs", () => {
    const valid = freelancerLoginSchema.safeParse({
      email: "atelier@vance.design",
      password: "secure-studio-pass-123",
    });
    expect(valid.success).toBe(true);
  });

  it("rejects malformed email and short password on login", () => {
    const invalidEmail = freelancerLoginSchema.safeParse({
      email: "not-an-email",
      password: "pass",
    });
    expect(invalidEmail.success).toBe(false);
    if (!invalidEmail.success) {
      expect(invalidEmail.error.issues.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("validates compliant signup input with custom studio slug", () => {
    const valid = freelancerSignupSchema.safeParse({
      email: "owner@studio-aurora.com",
      password: "strong-password-99",
      studioName: "Studio Aurora",
      studioSlug: "studio-aurora",
    });
    expect(valid.success).toBe(true);
  });

  it("rejects signup with illegal slug characters", () => {
    const invalid = freelancerSignupSchema.safeParse({
      email: "owner@studio-aurora.com",
      password: "strong-password-99",
      studioName: "Studio Aurora",
      studioSlug: "INVALID_SLUG!!",
    });
    expect(invalid.success).toBe(false);
  });

  it("executes login in test/sandbox environment deterministically", async () => {
    const res = await loginFreelancer({
      email: "hello@ateliervance.studio",
      password: "studio-password-123",
    });
    expect(res.ok).toBe(true);
    expect(res.user?.email).toBe("hello@ateliervance.studio");
    expect(res.user?.studioName).toBeDefined();
  });

  it("executes signup in test/sandbox environment deterministically", async () => {
    const res = await signupFreelancer({
      email: "designer@monim-creative.com",
      password: "super-safe-pass",
      studioName: "Monim Creative",
      studioSlug: "monim-creative",
    });
    expect(res.ok).toBe(true);
    expect(res.user?.studioSlug).toBe("monim-creative");
  });

  it("retrieves current authenticated freelancer session", async () => {
    const session = await getCurrentFreelancer();
    expect(session).not.toBeNull();
    expect(session?.studioSlug).toBeDefined();
  });

  it("clears session on logout", async () => {
    const res = await logoutFreelancer();
    expect(res.ok).toBe(true);
  });
});
