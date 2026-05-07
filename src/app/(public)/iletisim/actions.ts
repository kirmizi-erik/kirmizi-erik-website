"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { leadInputSchema } from "@/lib/validations/lead";

export type SubmitResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

const emptyToNull = (s: unknown) => {
  if (typeof s !== "string") return null;
  const t = s.trim();
  return t.length ? t : null;
};

export async function submitLead(formData: FormData): Promise<SubmitResult> {
  const raw = {
    ad_soyad: formData.get("ad_soyad"),
    eposta: formData.get("eposta"),
    telefon: formData.get("telefon"),
    sirket: formData.get("sirket"),
    hizmet_kategori: formData.getAll("hizmet_kategori").map(String).filter(Boolean),
    butce: formData.get("butce"),
    brief: formData.get("brief"),
    kvkk_onay: formData.get("kvkk_onay") ?? false,
    kaynak: formData.get("kaynak") ?? "/iletisim",
  };

  const parsed = leadInputSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { ok: false, error: first?.message ?? "Geçersiz form verisi" };
  }

  if (!parsed.data.kvkk_onay) {
    return { ok: false, error: "Devam etmek için KVKK metnini onaylaman gerek" };
  }

  // AI puanı opsiyonel (form gönderilmeden önce kullanıcı çalıştırırsa formData'da gelir)
  const aiSkorRaw = formData.get("ai_skor");
  const aiOzet = formData.get("ai_ozet");
  const aiSkor =
    typeof aiSkorRaw === "string" && aiSkorRaw ? Number(aiSkorRaw) : null;

  const reqHeaders = await headers();
  const userAgent = reqHeaders.get("user-agent") ?? "";

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .insert({
      ad_soyad: parsed.data.ad_soyad,
      eposta: parsed.data.eposta,
      telefon: emptyToNull(parsed.data.telefon),
      sirket: emptyToNull(parsed.data.sirket),
      hizmet_kategori: parsed.data.hizmet_kategori,
      butce: emptyToNull(parsed.data.butce),
      brief: parsed.data.brief,
      ai_skor: aiSkor && Number.isFinite(aiSkor) ? aiSkor : null,
      ai_ozet: emptyToNull(aiOzet),
      kaynak: parsed.data.kaynak ?? "/iletisim",
      user_agent: userAgent || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[submitLead]", error);
    return { ok: false, error: "Form gönderilirken bir sorun oldu, lütfen tekrar dene" };
  }

  revalidatePath("/admin/leadler");
  revalidatePath("/admin");

  return { ok: true, id: data.id };
}
