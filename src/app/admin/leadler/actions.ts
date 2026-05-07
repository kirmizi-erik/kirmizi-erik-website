"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const leadDurumSchema = z.enum(["yeni", "iletisim", "teklif", "kazandi", "kaybetti"]);

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

export async function updateLeadStatus(
  id: string,
  durum: string,
): Promise<ActionResult> {
  const parsed = leadDurumSchema.safeParse(durum);
  if (!parsed.success) return { ok: false, error: "Geçersiz durum" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ durum: parsed.data })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/leadler");
  revalidatePath(`/admin/leadler/${id}`);
  revalidatePath("/admin");
  return { ok: true, message: "Durum güncellendi" };
}

export async function updateLeadNotes(
  id: string,
  notlar: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ notlar: notlar.trim() || null })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/leadler/${id}`);
  return { ok: true, message: "Not kaydedildi" };
}

export async function deleteLead(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/leadler");
  revalidatePath("/admin");
  return { ok: true, message: "Lead silindi" };
}
