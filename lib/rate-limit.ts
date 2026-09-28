import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiting for public form endpoints (Cybersecurity Framework AL-SEC-001,
 * which mandates it but names no store — Upstash is our choice, recorded in
 * docs/adr/0008-rate-limiting-store.md).
 *
 * FAIL-OPEN, DELIBERATELY. If Upstash is unreachable or unconfigured, requests
 * are allowed and a warning is logged. The alternative — failing closed — means
 * an Upstash outage takes down the contact form of a company whose entire
 * current funnel is that form. Spam is recoverable; a silently dead lead
 * pipeline is not. This is a real trade-off, not an oversight.
 */

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

let warned = false;
function warnOnce() {
  if (warned) return;
  warned = true;
  const msg =
    "[rate-limit] Upstash is not configured — public forms are UNPROTECTED. " +
    "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.";
  if (process.env.NODE_ENV === "production") console.error(msg);
  else console.warn(msg);
}

function limiter(tokens: number, window: `${number} ${"s" | "m" | "h"}`) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, window),
    analytics: true,
    prefix: "agni:rl",
  });
}

/**
 * Tuned per form. Contact and partnership submissions are deliberate, low-volume
 * acts; the newsletter gets a little more headroom because a genuine user may
 * retype a mistyped address.
 */
const LIMITERS = {
  contact: limiter(3, "10 m"),
  newsletter: limiter(5, "10 m"),
  partnership: limiter(3, "10 m"),
  verify: limiter(30, "1 m"),
  auth: limiter(5, "10 m"),
} as const;

export type LimitKey = keyof typeof LIMITERS;

export interface RateLimitResult {
  success: boolean;
  /** Seconds until the caller may retry. Only meaningful when success is false. */
  retryAfter: number;
}

export async function checkRateLimit(
  key: LimitKey,
  identifier: string,
): Promise<RateLimitResult> {
  const rl = LIMITERS[key];
  if (!rl) {
    warnOnce();
    return { success: true, retryAfter: 0 };
  }

  try {
    const { success, reset } = await rl.limit(`${key}:${identifier}`);
    return {
      success,
      retryAfter: Math.max(0, Math.ceil((reset - Date.now()) / 1000)),
    };
  } catch (error) {
    console.error("[rate-limit] check failed, allowing request:", error);
    return { success: true, retryAfter: 0 };
  }
}

/**
 * Best-effort client IP behind Vercel's proxy.
 *
 * `x-forwarded-for` is client-controllable in general, but on Vercel the
 * platform overwrites it, so the LEFTMOST entry is the real client. Do not
 * reuse this helper on a self-hosted deployment without re-checking that.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}
