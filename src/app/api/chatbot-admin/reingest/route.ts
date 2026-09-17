import { requireAdminToken } from "@/lib/chatbot/admin-auth";
import { reingestSiteKb } from "@/lib/chatbot/indexer";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/chatbot-admin/reingest — site korpusunu (hizmetler + firma genel)
 * sıfırdan indeksler. Eğitim Q&A chunk'larına dokunmaz.
 */
export async function POST(req: Request) {
  const denied = requireAdminToken(req);
  if (denied) return denied;

  try {
    const result = await reingestSiteKb();
    return Response.json({ ok: true, ...result });
  } catch (e) {
    console.error("[chatbot-admin] reingest:", e);
    return Response.json(
      { error: e instanceof Error ? e.message : "Reingest başarısız" },
      { status: 500 },
    );
  }
}
