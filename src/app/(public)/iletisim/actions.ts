"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { notifyNewLead } from "@/lib/notify/lead";
import { checkRateLimit } from "@/lib/rate-limit";
import { getServicePage } from "@/lib/services-data";
import { createAdminClient } from "@/lib/supabase/admin";
import { leadInputSchema } from "@/lib/validations/lead";

export type SubmitResult = { ok: true; id: string } | { ok: false; error: string };

// kaynak tarayıcıdan gelir: yalnız bilinen form sayfaları kabul edilir
function resolveKaynak(raw: FormDataEntryValue | null): { kaynak: string; etiket: string } {
  const value = typeof raw === "string" ? raw : "";
  const service = value.startsWith("/hizmetler/")
    ? getServicePage(value.slice("/hizmetler/".length))
    : undefined;
  if (service) return { kaynak: value, etiket: `hizmet sayfası formu · ${service.label}` };
  return { kaynak: "/iletisim", etiket: "iletişim formu" };
}

const emptyToNull = (s: unknown) => {
  if (typeof s !== "string") return null;
  const t = s.trim();
  return t.length ? t : null;
};

export async function submitLead(formData: FormData): Promise<SubmitResult> {
  const rl = await checkRateLimit("lead");
  if (!rl.ok) {
    return {
      ok: false,
      error: `Çok fazla deneme, ${Math.ceil(rl.retryAfterSeconds / 60)} dk sonra tekrar dene`,
    };
  }

  const raw = {
    ad_soyad: formData.get("ad_soyad"),
    eposta: formData.get("eposta"),
    // Opsiyonel alanlar her formda yok (ör. hizmet sayfası formu); null şemayı kırmasın
    telefon: formData.get("telefon") ?? "",
    sirket: formData.get("sirket") ?? "",
    hizmet_kategori: formData.getAll("hizmet_kategori").map(String).filter(Boolean),
    butce: formData.get("butce") ?? "",
    brief: formData.get("brief"),
    kvkk_onay: formData.get("kvkk_onay") ?? false,
  };
  const { kaynak, etiket } = resolveKaynak(formData.get("kaynak"));

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
  const aiSkor = typeof aiSkorRaw === "string" && aiSkorRaw ? Number(aiSkorRaw) : null;

  const reqHeaders = await headers();
  const userAgent = reqHeaders.get("user-agent") ?? "";

  const supabase = createAdminClient();
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
      kaynak,
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

  // E-posta bildirimi (background, fail olsa form yine submit kalsın)
  await notifyNewLead({
    ad_soyad: parsed.data.ad_soyad,
    eposta: parsed.data.eposta,
    telefon: emptyToNull(parsed.data.telefon),
    sirket: emptyToNull(parsed.data.sirket),
    hizmet_kategori: parsed.data.hizmet_kategori,
    butce: emptyToNull(parsed.data.butce),
    brief: parsed.data.brief,
    ai_ozet: emptyToNull(aiOzet),
    kaynak: etiket,
    leadId: data.id,
  }).catch((e) => console.warn("[submitLead] email skip:", e));

  return { ok: true, id: data.id };
}
