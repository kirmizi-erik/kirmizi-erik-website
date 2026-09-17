import { requireAdminToken } from "@/lib/chatbot/admin-auth";
import { chatbotDb } from "@/lib/chatbot/db";

export const dynamic = "force-dynamic";

/** GET /api/chatbot-admin/conversations/:id — konuşma + tüm mesajlar */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdminToken(req);
  if (denied) return denied;

  const { id } = await params;
  const db = chatbotDb();

  const [convRes, msgRes] = await Promise.all([
    db.from("chat_conversations").select("*").eq("id", id).single(),
    db
      .from("chat_messages")
      .select("id, role, content, latency_ms, unanswered, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (convRes.error) {
    return Response.json({ error: "Konuşma bulunamadı" }, { status: 404 });
  }
  if (msgRes.error) {
    return Response.json({ error: msgRes.error.message }, { status: 500 });
  }
  return Response.json({
    conversation: convRes.data,
    messages: msgRes.data ?? [],
  });
}
