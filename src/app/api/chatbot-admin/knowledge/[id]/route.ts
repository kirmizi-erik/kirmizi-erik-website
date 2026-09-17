import { requireAdminToken } from "@/lib/chatbot/admin-auth";
import { chatbotDb } from "@/lib/chatbot/db";
import { indexAdminEntry, removeAdminEntryChunks } from "@/lib/chatbot/indexer";
import { knowledgeInputSchema } from "@/lib/validations/chatbot-admin";

export const dynamic = "force-dynamic";

/** PUT /api/chatbot-admin/knowledge/:id — güncelle + yeniden indeksle */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdminToken(req);
  if (denied) return denied;

  const { id } = await params;
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
    .update({
      question_tr: parsed.data.question_tr,
      answer_tr: parsed.data.answer_tr,
      question_en: parsed.data.question_en || null,
      answer_en: parsed.data.answer_en || null,
      source_url: parsed.data.source_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return Response.json({ error: "Kayıt bulunamadı" }, { status: 404 });

  try {
    await indexAdminEntry(data);
  } catch (e) {
    console.error("[chatbot-admin] yeniden indeksleme:", e);
    return Response.json({
      entry: data,
      warning: "Güncellendi ama indeksleme başarısız",
    });
  }
  return Response.json({ entry: data });
}

/** DELETE /api/chatbot-admin/knowledge/:id — kayıt + chunk'ları sil */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdminToken(req);
  if (denied) return denied;

  const { id } = await params;
  const db = chatbotDb();

  await removeAdminEntryChunks(id);
  const { error } = await db.from("admin_knowledge").delete().eq("id", id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
