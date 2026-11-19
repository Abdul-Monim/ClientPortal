import { createHmac, timingSafeEqual } from "crypto";
import { getPortalSessionSecret } from "@/infrastructure/config/env";

export const PORTAL_SESSION_COOKIE_PREFIX = "cp_portal_";
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface PortalSessionPayload {
  projectId: string;
  studioSlug: string;
  passcodeVersion: number;
  exp: number;
}

export function getPortalCookieName(projectId: string): string {
  const safeId = projectId.replace(/[^a-zA-Z0-9_-]/g, "");
  return `${PORTAL_SESSION_COOKIE_PREFIX}${safeId}`;
}

function signSegment(encodedPayload: string, secret: string): string {
  return createHmac("sha256", secret).update(encodedPayload).digest("base64url");
}

export function createPortalSessionToken(
  input: Omit<PortalSessionPayload, "exp">,
  ttlSeconds = DEFAULT_TTL_SECONDS,
  secretOverride?: string
): string {
  const payload: PortalSessionPayload = {
    ...input,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = signSegment(encoded, secretOverride ?? getPortalSessionSecret());
  return `${encoded}.${signature}`;
}

export function verifyPortalSessionToken(
  token: string | undefined | null,
  expectedProjectId: string,
  expectedPasscodeVersion: number,
  secretOverride?: string
): PortalSessionPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encoded, providedSig] = parts;
  if (!encoded || !providedSig) return null;

  const expectedSig = signSegment(encoded, secretOverride ?? getPortalSessionSecret());
  const providedBuf = Buffer.from(providedSig, "utf8");
  const expectedBuf = Buffer.from(expectedSig, "utf8");
  if (
    providedBuf.length !== expectedBuf.length ||
    !timingSafeEqual(providedBuf, expectedBuf)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as PortalSessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (
      parsed.projectId !== expectedProjectId ||
      parsed.passcodeVersion !== expectedPasscodeVersion ||
      typeof parsed.exp !== "number" ||
      parsed.exp <= now
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
