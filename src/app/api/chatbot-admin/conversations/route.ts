import { requireAdminToken } from "@/lib/chatbot/admin-auth";
import { chatbotDb } from "@/lib/chatbot/db";

export const dynamic = "force-dynamic";

/** GET /api/chatbot-admin/conversations?q=&unanswered=1&limit=100 */
export async function GET(req: Request) {
  const denied = requireAdminToken(req);
  if (denied) return denied;

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.slice(0, 200) ?? null;
  const onlyUnanswered = url.searchParams.get("unanswered") === "1";
  const limit = Math.min(Number(url.searchParams.get("limit")) || 100, 500);

  const db = chatbotDb();
  const { data, error } = await db.rpc("chat_admin_conversations", {
    p_q: q,
    p_only_unanswered: onlyUnanswered,
    p_limit: limit,
  });

  if (error) {
    console.error("[chatbot-admin] conversations:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ conversations: data ?? [] });
}
