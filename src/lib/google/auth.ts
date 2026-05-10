import "server-only";

import { google, type Auth } from "googleapis";

let _oauth2: Auth.OAuth2Client | null = null;

export function getOAuthClient(): Auth.OAuth2Client {
  if (_oauth2) return _oauth2;

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
      `Google OAuth env eksik: ${missing.join(", ")} (${lengths})`,
    );
  }

  const client = new google.auth.OAuth2(clientId, clientSecret);
  client.setCredentials({ refresh_token: refreshToken });

  _oauth2 = client;
  return client;
}
