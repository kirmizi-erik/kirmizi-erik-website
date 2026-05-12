import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

type LimiterName = "chat" | "lead";

const config: Record<LimiterName, { tokens: number; window: `${number} ${"s" | "m" | "h" | "d"}` }> = {
  chat: { tokens: 15, window: "1 m" },
  lead: { tokens: 3, window: "10 m" },
};

let _redis: Redis | null = null;
function getRedis(): Redis | null {
  if (_redis) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  _redis = new Redis({ url, token });
  return _redis;
}

const _limiters = new Map<LimiterName, Ratelimit>();
function getLimiter(name: LimiterName): Ratelimit | null {
  const cached = _limiters.get(name);
  if (cached) return cached;

  const redis = getRedis();
  if (!redis) return null;

  const { tokens, window } = config[name];
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, window),
    analytics: true,
    prefix: `rl:${name}`,
  });
  _limiters.set(name, limiter);
  return limiter;
}

async function getClientId(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "anonymous";
}

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSeconds: number };

export async function checkRateLimit(
  name: LimiterName,
): Promise<RateLimitResult> {
  const limiter = getLimiter(name);
  if (!limiter) {
    if (process.env.NODE_ENV === "production") {
      console.warn(`[rate-limit] ${name}: Redis not configured, fail-open`);
    }
    return { ok: true, remaining: Infinity };
  }

  const id = await getClientId();
  const result = await limiter.limit(id);
  if (result.success) return { ok: true, remaining: result.remaining };

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((result.reset - Date.now()) / 1000),
  );
  return { ok: false, retryAfterSeconds };
}
