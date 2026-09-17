import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Panel → website admin API auth: `x-admin-token` header'ı CHATBOT_ADMIN_TOKEN
 * env ile karşılaştırılır. Env tanımsızsa endpoint yok gibi davranır (404) —
 * Novawood'daki "token yoksa router kaybolur" deseni.
 * Dönüş: null = yetkili; Response = hata cevabı (çağıran direkt return eder).
 */
export function requireAdminToken(req: Request): Response | null {
  const expected = process.env.CHATBOT_ADMIN_TOKEN;
  if (!expected) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  const provided = req.headers.get("x-admin-token") ?? "";
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  if (!timingSafeEqual(a, b)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
