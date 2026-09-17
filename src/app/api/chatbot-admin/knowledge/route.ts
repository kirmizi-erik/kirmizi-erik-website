import { requireAdminToken } from "@/lib/chatbot/admin-auth";
import { chatbotDb } from "@/lib/chatbot/db";
import { indexAdminEntry } from "@/lib/chatbot/indexer";
import { knowledgeInputSchema } from "@/lib/validations/chatbot-admin";

export const dynamic = "force-dynamic";

/** GET /api/chatbot-admin/knowledge — tüm eğitim Q&A kayıtları */
export async function GET(req: Request) {
  const denied = requireAdminToken(req);
  if (denied) return denied;

  const db = chatbotDb();
  const { data, error } = await db
    .from("admin_knowledge")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ entries: data ?? [] });
}

/** POST /api/chatbot-admin/knowledge — yeni Q&A ekle + anında indeksle */
export async function POST(req: Request) {
  const denied = requireAdminToken(req);
  if (denied) return denied;

  const parsed = knowledgeInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.errors[0]?.message ?? "Geçersiz veri" },
      { status: 400 },
    );
  }

  const db = chatbotDb();
  const { data, error } = await db
    .from("admin_knowledge")
    .insert({
      question_tr: parsed.data.question_tr,
      answer_tr: parsed.data.answer_tr,
      question_en: parsed.data.question_en || null,
      answer_en: parsed.data.answer_en || null,
      source_url: parsed.data.source_url || null,
    })
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  try {
    await indexAdminEntry(data);
  } catch (e) {
    console.error("[chatbot-admin] indeksleme:", e);
    return Response.json(
      { entry: data, warning: "Kayıt eklendi ama indeksleme başarısız" },
      { status: 201 },
    );
  }
  return Response.json({ entry: data }, { status: 201 });
}
