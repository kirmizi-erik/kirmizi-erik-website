"use server";

import { revalidatePath } from "next/cache";

import { chatbotDb } from "@/lib/chatbot/db";
import { indexAdminEntry, reingestSiteKb, removeAdminEntryChunks } from "@/lib/chatbot/indexer";
import { createClient } from "@/lib/supabase/server";
import { knowledgeInputSchema } from "@/lib/validations/chatbot-admin";

export type KbActionResult = { ok: true; message: string } | { ok: false; error: string };

// chatbot tabloları service-role ile yazıldığı için oturum kontrolü action içinde şart
async function requireAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return !!user;
}

function parseForm(formData: FormData) {
  return knowledgeInputSchema.safeParse({
    question_tr: String(formData.get("question_tr") ?? "").trim(),
    answer_tr: String(formData.get("answer_tr") ?? "").trim(),
    question_en: String(formData.get("question_en") ?? "").trim() || null,
    answer_en: String(formData.get("answer_en") ?? "").trim() || null,
    source_url: String(formData.get("source_url") ?? "").trim() || null,
  });
}

export async function createKnowledgeAction(formData: FormData): Promise<KbActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Oturum bulunamadı" };

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Geçersiz form" };
  }

  const db = chatbotDb();
  const { data, error } = await db.from("admin_knowledge").insert(parsed.data).select("*").single();
  if (error) return { ok: false, error: error.message };

  try {
    await indexAdminEntry(data);
  } catch (e) {
    console.error("[bilgi-bankasi] indeksleme:", e);
    return { ok: false, error: "Kayıt eklendi ama indeksleme başarısız — tekrar kaydet" };
  }

  revalidatePath("/admin/bilgi-bankasi");
  return { ok: true, message: "Eklendi — asistan bu bilgiyi artık kullanıyor" };
}

export async function updateKnowledgeAction(
  id: string,
  formData: FormData,
): Promise<KbActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Oturum bulunamadı" };

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Geçersiz form" };
  }

  const db = chatbotDb();
  const { data, error } = await db
    .from("admin_knowledge")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return { ok: false, error: "Kayıt bulunamadı" };

  try {
    await indexAdminEntry(data);
  } catch (e) {
    console.error("[bilgi-bankasi] yeniden indeksleme:", e);
    return { ok: false, error: "Güncellendi ama indeksleme başarısız — tekrar kaydet" };
  }

  revalidatePath("/admin/bilgi-bankasi");
  return { ok: true, message: "Güncellendi" };
}

export async function deleteKnowledgeAction(id: string): Promise<KbActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Oturum bulunamadı" };

  await removeAdminEntryChunks(id);
  const db = chatbotDb();
  const { error } = await db.from("admin_knowledge").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/bilgi-bankasi");
  return { ok: true, message: "Silindi" };
}

export async function reingestAction(): Promise<KbActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Oturum bulunamadı" };

  try {
    const result = await reingestSiteKb();
    revalidatePath("/admin/bilgi-bankasi");
    return { ok: true, message: `Site içeriği yeniden indekslendi (${result.chunks} parça)` };
  } catch (e) {
    console.error("[bilgi-bankasi] reingest:", e);
    return { ok: false, error: "İndeksleme başarısız" };
  }
}
