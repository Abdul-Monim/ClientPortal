export interface RateLimitDecision {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

interface BucketEntry {
  timestamps: number[];
}

export class SlidingWindowRateLimiter {
  private readonly buckets = new Map<string, BucketEntry>();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts = 8, windowMs = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  check(key: string, nowMs = Date.now()): RateLimitDecision {
    const cutoff = nowMs - this.windowMs;
    const entry = this.buckets.get(key) ?? { timestamps: [] };
    entry.timestamps = entry.timestamps.filter((ts) => ts > cutoff);

    if (entry.timestamps.length >= this.maxAttempts) {
      const oldest = entry.timestamps[0] ?? nowMs;
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((oldest + this.windowMs - nowMs) / 1000)
      );
      this.buckets.set(key, entry);
      return { allowed: false, remaining: 0, retryAfterSeconds };
    }

    return {
      allowed: true,
      remaining: this.maxAttempts - entry.timestamps.length,
      retryAfterSeconds: 0,
    };
  }

  recordFailure(key: string, nowMs = Date.now()): RateLimitDecision {
    const cutoff = nowMs - this.windowMs;
    const entry = this.buckets.get(key) ?? { timestamps: [] };
    entry.timestamps = entry.timestamps.filter((ts) => ts > cutoff);
    entry.timestamps.push(nowMs);
    this.buckets.set(key, entry);

    const remaining = Math.max(0, this.maxAttempts - entry.timestamps.length);
    const oldest = entry.timestamps[0] ?? nowMs;
    const retryAfterSeconds =
      remaining === 0 ? Math.max(1, Math.ceil((oldest + this.windowMs - nowMs) / 1000)) : 0;

    return {
      allowed: remaining > 0,
      remaining,
      retryAfterSeconds,
    };
  }

  reset(key: string): void {
    this.buckets.delete(key);
  }
}

export const portalPasscodeRateLimiter = new SlidingWindowRateLimiter(8, 15 * 60 * 1000);
