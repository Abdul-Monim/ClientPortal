import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const KEY_LENGTH = 64;

export interface HashedPasscode {
  hash: string;
  salt: string;
}

export function hashPasscode(plainPasscode: string): HashedPasscode {
  const normalized = plainPasscode.trim();
  if (normalized.length < 4) {
    throw new RangeError("Passcode must be at least 4 characters.");
  }
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(normalized, salt, KEY_LENGTH).toString("hex");
  return { hash: derived, salt };
}

export function verifyPasscode(
  plainPasscode: string,
  expectedHash: string,
  salt: string
): boolean {
  const normalized = plainPasscode.trim();
  if (!normalized || !expectedHash || !salt) {
    return false;
  }
  try {
    const candidateBuf = scryptSync(normalized, salt, KEY_LENGTH);
    const expectedBuf = Buffer.from(expectedHash, "hex");
    if (candidateBuf.length !== expectedBuf.length) {
      return false;
    }
    return timingSafeEqual(candidateBuf, expectedBuf);
  } catch {
    return false;
  }
}
