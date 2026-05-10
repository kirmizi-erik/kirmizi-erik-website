import "server-only";

type ServiceAccountCredentials = {
  client_email: string;
  private_key: string;
  project_id?: string;
};

let cached: ServiceAccountCredentials | null = null;

export function getGoogleCredentials(): ServiceAccountCredentials {
  if (cached) return cached;

  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON env değişkeni eksik");
  }

  let parsed: ServiceAccountCredentials;
  try {
    const text = raw.trim().startsWith("{")
      ? raw
      : Buffer.from(raw, "base64").toString("utf-8");
    parsed = JSON.parse(text);
  } catch (e) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON çözümlenemedi (geçerli JSON veya base64 olmalı): " +
        (e instanceof Error ? e.message : String(e)),
    );
  }

  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("Service account JSON eksik alanlar içeriyor");
  }

  parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  cached = parsed;
  return parsed;
}
