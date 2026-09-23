import "server-only";

import { google, type Auth } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/webmasters.readonly",
];

let _client: Auth.OAuth2Client | Auth.GoogleAuth | null = null;

/**
 * Service account (GOOGLE_SERVICE_ACCOUNT_B64) varsa onu kullanır — süresi dolmaz.
 * Yoksa OAuth refresh token'a düşer; "Testing" modundaki OAuth uygulamalarında
 * Google bu token'ı 7 günde iptal eder (invalid_grant).
 */
export function getOAuthClient(): Auth.OAuth2Client | Auth.GoogleAuth {
  if (_client) return _client;

  const saB64 = process.env.GOOGLE_SERVICE_ACCOUNT_B64;
  if (saB64) {
    const credentials = JSON.parse(Buffer.from(saB64, "base64").toString("utf8"));
    _client = new google.auth.GoogleAuth({ credentials, scopes: SCOPES });
    return _client;
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  const missing: string[] = [];
  if (!clientId) missing.push("GOOGLE_OAUTH_CLIENT_ID");
  if (!clientSecret) missing.push("GOOGLE_OAUTH_CLIENT_SECRET");
  if (!refreshToken) missing.push("GOOGLE_OAUTH_REFRESH_TOKEN");
  if (missing.length) {
    const lengths = `lengths: id=${clientId?.length ?? 0}, secret=${clientSecret?.length ?? 0}, refresh=${refreshToken?.length ?? 0}`;
    throw new Error(
      `Google kimliği yok: GOOGLE_SERVICE_ACCOUNT_B64 veya ${missing.join(", ")} (${lengths})`,
    );
  }

  const client = new google.auth.OAuth2(clientId, clientSecret);
  client.setCredentials({ refresh_token: refreshToken });

  _client = client;
  return client;
}
