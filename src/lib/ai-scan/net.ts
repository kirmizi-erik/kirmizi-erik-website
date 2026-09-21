import "server-only";

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const MAX_REDIRECTS = 3;
const FETCH_TIMEOUT_MS = 10_000;

export class ScanUrlError extends Error {}

function isPrivateIp(ip: string): boolean {
  if (ip.includes(":")) {
    const v6 = ip.toLowerCase();
    // IPv4-mapped adresleri v4 kurallarıyla değerlendir
    const mapped = v6.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateIp(mapped[1]!);
    return (
      v6 === "::1" ||
      v6 === "::" ||
      v6.startsWith("fe80:") ||
      v6.startsWith("fc") ||
      v6.startsWith("fd")
    );
  }
  const parts = ip.split(".").map(Number);
  const [a, b] = [parts[0]!, parts[1]!];
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  );
}

/**
 * Kullanıcıdan gelen adresi doğrular (SSRF koruması):
 * sadece http(s) + varsayılan port, public IP'ye çözümlenen gerçek hostname.
 */
export async function validateScanUrl(input: string): Promise<URL> {
  let url: URL;
  try {
    const withScheme = /^https?:\/\//i.test(input.trim())
      ? input.trim()
      : `https://${input.trim()}`;
    url = new URL(withScheme);
  } catch {
    throw new ScanUrlError("Geçerli bir site adresi girin (örn. firmaniz.com)");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:")
    throw new ScanUrlError("Sadece http/https adresler taranabilir");
  if (url.port && url.port !== "80" && url.port !== "443")
    throw new ScanUrlError("Özel portlar taranamaz");
  if (url.username || url.password) throw new ScanUrlError("Adres kullanıcı bilgisi içeremez");

  const host = url.hostname.toLowerCase();
  if (!host.includes(".") || host.endsWith(".local") || host.endsWith(".internal"))
    throw new ScanUrlError("Bu adres taranamaz");
  if (isIP(host)) {
    if (isPrivateIp(host)) throw new ScanUrlError("Bu adres taranamaz");
    return url;
  }

  try {
    const addrs = await lookup(host, { all: true });
    if (addrs.length === 0 || addrs.some((a) => isPrivateIp(a.address)))
      throw new ScanUrlError("Bu adres taranamaz");
  } catch (e) {
    if (e instanceof ScanUrlError) throw e;
    throw new ScanUrlError("Alan adı çözümlenemedi — adresi kontrol edin");
  }

  return url;
}

export type FetchOutcome = {
  status: number | null;
  finalUrl: string;
  redirects: number;
  ttfbMs: number;
  bytes: number;
  truncated: boolean;
  body: string | null;
  headers: Record<string, string>;
  error: string | null;
};

/**
 * Redirect'leri elle izleyen (her adımda SSRF doğrulamalı), boyut sınırlı fetch.
 * body=false ise gövde okunmaz (varlık kontrolü için).
 */
export async function safeFetch(
  target: URL,
  opts: { userAgent: string; readBody?: boolean; maxBytes?: number },
): Promise<FetchOutcome> {
  const readBody = opts.readBody ?? true;
  const maxBytes = opts.maxBytes ?? MAX_BYTES;
  let current = target;
  let redirects = 0;
  const started = Date.now();

  try {
    for (;;) {
      const res = await fetch(current, {
        headers: {
          "user-agent": opts.userAgent,
          accept: "text/html,application/xhtml+xml,text/plain,*/*;q=0.8",
          "accept-language": "tr,en;q=0.8",
        },
        redirect: "manual",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      const ttfbMs = Date.now() - started;

      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get("location");
        res.body?.cancel().catch(() => {});
        if (!loc || redirects >= MAX_REDIRECTS) {
          return {
            status: res.status,
            finalUrl: current.href,
            redirects,
            ttfbMs,
            bytes: 0,
            truncated: false,
            body: null,
            headers: headerMap(res),
            error: redirects >= MAX_REDIRECTS ? "Çok fazla yönlendirme" : null,
          };
        }
        current = await validateScanUrl(new URL(loc, current).href);
        redirects += 1;
        continue;
      }

      let body: string | null = null;
      let bytes = 0;
      let truncated = false;
      if (readBody && res.body) {
        const reader = res.body.getReader();
        const chunks: Uint8Array[] = [];
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          bytes += value.byteLength;
          if (bytes > maxBytes) {
            truncated = true;
            reader.cancel().catch(() => {});
            break;
          }
          chunks.push(value);
        }
        body = Buffer.concat(chunks).toString("utf8");
      } else {
        res.body?.cancel().catch(() => {});
      }

      return {
        status: res.status,
        finalUrl: current.href,
        redirects,
        ttfbMs,
        bytes,
        truncated,
        body,
        headers: headerMap(res),
        error: null,
      };
    }
  } catch (e) {
    return {
      status: null,
      finalUrl: current.href,
      redirects,
      ttfbMs: Date.now() - started,
      bytes: 0,
      truncated: false,
      body: null,
      headers: {},
      error:
        e instanceof ScanUrlError
          ? e.message
          : e instanceof Error && e.name === "TimeoutError"
            ? "Zaman aşımı"
            : "Bağlantı hatası",
    };
  }
}

function headerMap(res: Response): Record<string, string> {
  const keys = [
    "content-encoding",
    "content-type",
    "server",
    "x-powered-by",
    "content-security-policy",
    "strict-transport-security",
    "x-vercel-id",
    "cf-ray",
  ];
  const out: Record<string, string> = {};
  for (const k of keys) {
    const v = res.headers.get(k);
    if (v) out[k] = v;
  }
  return out;
}
