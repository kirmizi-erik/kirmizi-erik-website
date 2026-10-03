import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

type LimiterName = "chat" | "lead" | "scan";

const config: Record<
  LimiterName,
  { tokens: number; window: `${number} ${"s" | "m" | "h" | "d"}` }
> = {
  chat: { tokens: 15, window: "1 m" },
  lead: { tokens: 3, window: "10 m" },
  scan: { tokens: 3, window: "1 d" },
};

let _redis: Redis | null = null;
function getRedis(): Redis | null {
  if (_redis) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
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

/**
 * Redis yoksa devreye giren yedek sınırlayıcı.
 * Sunucu örneği (instance) başına çalışır; birden fazla örnek varsa toplam sınır
 * örnek sayısı kadar katlanır. Yani Upstash'in yerini tutmaz — tek bir kaynaktan
 * gelen seri isteği durdurur, dağıtık kötüye kullanımı durdurmaz.
 * Upstash bağlandığında bu yol hiç çalışmaz.
 */
const _bellek = new Map<string, number[]>();

function pencereMs(name: LimiterName): number {
  const [sayi, birim] = config[name].window.split(" ") as [string, "s" | "m" | "h" | "d"];
  const carpan = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[birim];
  return Number(sayi) * carpan;
}

function bellekSinirla(name: LimiterName, id: string): RateLimitResult {
  const simdi = Date.now();
  const pencere = pencereMs(name);
  const anahtar = `${name}:${id}`;
  const gecmis = (_bellek.get(anahtar) ?? []).filter((t) => simdi - t < pencere);

  if (gecmis.length >= config[name].tokens) {
    const enEski = gecmis[0]!;
    _bellek.set(anahtar, gecmis);
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((enEski + pencere - simdi) / 1000)),
    };
  }

  gecmis.push(simdi);
  _bellek.set(anahtar, gecmis);

  // Sızıntıyı önlemek için ara ara süresi geçmiş anahtarları temizle
  if (_bellek.size > 5000) {
    for (const [k, v] of _bellek) {
      const kalan = v.filter((t) => simdi - t < pencere);
      if (kalan.length === 0) _bellek.delete(k);
      else _bellek.set(k, kalan);
    }
  }

  return { ok: true, remaining: config[name].tokens - gecmis.length };
}

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSeconds: number };

export async function checkRateLimit(name: LimiterName): Promise<RateLimitResult> {
  const id = await getClientId();
  const limiter = getLimiter(name);

  if (!limiter) {
    if (process.env.NODE_ENV === "production") {
      console.warn(`[rate-limit] ${name}: Redis yok, bellek içi yedek sınırlayıcı devrede`);
    }
    return bellekSinirla(name, id);
  }

  const result = await limiter.limit(id);
  if (result.success) return { ok: true, remaining: result.remaining };

  const retryAfterSeconds = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
  return { ok: false, retryAfterSeconds };
}
