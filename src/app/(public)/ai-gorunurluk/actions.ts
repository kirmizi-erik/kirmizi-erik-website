"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { runScan } from "@/lib/ai-scan/scan";
import { ScanUrlError } from "@/lib/ai-scan/net";
import { LAYER_LABELS, type ScanResult } from "@/lib/ai-scan/types";
import { sendScanReportEmail } from "@/lib/email/resend";
import { notifyNewLead } from "@/lib/notify/lead";
import { checkRateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

export type ScanActionResult =
  | { ok: true; result: ScanResult; remaining: number }
  | { ok: false; error: string };

export async function scanSite(inputUrl: string): Promise<ScanActionResult> {
  const rl = await checkRateLimit("scan");
  if (!rl.ok) {
    const saat = Math.ceil(rl.retryAfterSeconds / 3600);
    return {
      ok: false,
      error: `Günlük ücretsiz tarama hakkınız doldu (3/gün). ${saat} saat sonra yeniden deneyebilir ya da bizimle iletişime geçip sitenizin tam raporunu isteyebilirsiniz.`,
    };
  }

  const url = z.string().min(4).max(300).safeParse(inputUrl);
  if (!url.success) return { ok: false, error: "Geçerli bir site adresi girin" };

  try {
    const result = await runScan(url.data.trim());
    return {
      ok: true,
      result,
      remaining: Number.isFinite(rl.remaining) ? rl.remaining : 99,
    };
  } catch (e) {
    if (e instanceof ScanUrlError) return { ok: false, error: e.message };
    console.error("[scanSite]", e);
    return {
      ok: false,
      error:
        e instanceof Error && e.message.startsWith("Site")
          ? e.message
          : e instanceof Error && e.message.startsWith("Siteye")
            ? e.message
            : "Tarama sırasında bir sorun oluştu — adresi kontrol edip yeniden deneyin",
    };
  }
}

const reportInputSchema = z.object({
  ad_soyad: z.string().min(3, "Ad soyad en az 3 karakter").max(120),
  eposta: z.string().email("Geçerli bir e-posta girin").max(200),
  kvkk_onay: z
    .union([z.boolean(), z.string()])
    .transform((v) => v === true || v === "on" || v === "true"),
});

export type ReportActionResult = { ok: true } | { ok: false; error: string };

/**
 * Tarama raporunu ziyaretçinin e-postasına gönderir + lead olarak kaydeder.
 */
export async function sendScanReport(
  formData: FormData,
  result: ScanResult,
): Promise<ReportActionResult> {
  const rl = await checkRateLimit("lead");
  if (!rl.ok) {
    return {
      ok: false,
      error: `Çok fazla deneme, ${Math.ceil(rl.retryAfterSeconds / 60)} dk sonra tekrar dene`,
    };
  }

  const parsed = reportInputSchema.safeParse({
    ad_soyad: formData.get("ad_soyad"),
    eposta: formData.get("eposta"),
    kvkk_onay: formData.get("kvkk_onay") ?? false,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Geçersiz form" };
  }
  if (!parsed.data.kvkk_onay) {
    return { ok: false, error: "Devam etmek için KVKK metnini onaylaman gerek" };
  }

  // Rapor verisi client'tan geliyor — e-postaya girecek alanları sınırla/doğrula
  if (
    typeof result?.hostname !== "string" ||
    result.hostname.length > 200 ||
    !Array.isArray(result.katmanlar)
  ) {
    return { ok: false, error: "Rapor verisi geçersiz — sayfayı yenileyip yeniden tarayın" };
  }
  const skor = Math.max(0, Math.min(100, Math.round(Number(result.skor) || 0)));

  const bulgular = result.katmanlar
    .flatMap((k) => k.bulgular)
    .filter((b) => b.onem !== "bilgi")
    .slice(0, 12)
    .map((b) => ({
      onem: String(b.onem).slice(0, 10),
      mesaj: String(b.mesaj).slice(0, 300),
      cozum: String(b.cozum).slice(0, 300),
    }));

  const katmanOzet = result.katmanlar.map((k) => ({
    baslik: LAYER_LABELS[k.key]?.baslik ?? k.key,
    puan: Math.max(0, Math.min(100, Math.round(Number(k.puan) || 0))),
    ozet: String(k.ozet).slice(0, 200),
  }));

  const briefText = [
    `KeScan Taraması — ${result.hostname}`,
    `Skor: ${skor}/100 (${String(result.not).slice(0, 3)})`,
    ...katmanOzet.map((k) => `${k.baslik}: ${k.puan}`),
    "",
    ...bulgular.map((b) => `[${b.onem}] ${b.mesaj}`),
  ].join("\n");

  const reqHeaders = await headers();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .insert({
      ad_soyad: parsed.data.ad_soyad,
      eposta: parsed.data.eposta,
      hizmet_kategori: ["ai-kurulumlari"],
      brief: briefText.slice(0, 5000),
      ai_skor: skor,
      ai_ozet: `${result.hostname} AI görünürlük skoru ${skor}/100 — ${String(result.ozet).slice(0, 300)}`,
      kaynak: "ai-tarama",
      user_agent: reqHeaders.get("user-agent") ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[sendScanReport] lead insert", error);
    return { ok: false, error: "Rapor gönderilirken bir sorun oldu, lütfen tekrar dene" };
  }

  const emailResult = await sendScanReportEmail({
    to: parsed.data.eposta,
    hostname: result.hostname,
    skor,
    not: String(result.not).slice(0, 3),
    ozet: String(result.ozet).slice(0, 300),
    katmanlar: katmanOzet,
    bulgular,
  });

  // Ekibe lead bildirimi (fail-soft)
  await notifyNewLead({
    ad_soyad: parsed.data.ad_soyad,
    eposta: parsed.data.eposta,
    hizmet_kategori: ["ai-kurulumlari"],
    brief: briefText.slice(0, 5000),
    ai_ozet: `AI tarama lead'i — skor ${skor}/100`,
    kaynak: `AI görünürlük taraması (${result.hostname})`,
    leadId: data.id,
  }).catch((e) => console.warn("[sendScanReport] team email skip:", e));

  if (!emailResult.ok) {
    return {
      ok: false,
      error:
        "Rapor kaydedildi ama e-posta gönderilemedi — ekibimiz en kısa sürede sizinle paylaşacak",
    };
  }
  return { ok: true };
}

const newSiteInputSchema = reportInputSchema.extend({
  telefon: z
    .string()
    .transform((v) => v.replace(/[^\d+]/g, ""))
    .refine((v) => /^\+?\d{10,15}$/.test(v), "Geçerli bir telefon numarası girin"),
});

/**
 * Taramadan sonra "yeni web sitesi" talebi — kısa form (ad, telefon, e-posta).
 * Taranan site ve puan lead'e otomatik eklenir; ziyaretçi tekrar yazmaz.
 */
export async function requestNewSite(
  formData: FormData,
  scan: { hostname: string; skor: number; not: string },
): Promise<ReportActionResult> {
  const rl = await checkRateLimit("lead");
  if (!rl.ok) {
    return {
      ok: false,
      error: `Çok fazla deneme, ${Math.ceil(rl.retryAfterSeconds / 60)} dk sonra tekrar dene`,
    };
  }

  const parsed = newSiteInputSchema.safeParse({
    ad_soyad: formData.get("ad_soyad"),
    eposta: formData.get("eposta"),
    telefon: String(formData.get("telefon") ?? ""),
    kvkk_onay: formData.get("kvkk_onay") ?? false,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Geçersiz form" };
  }
  if (!parsed.data.kvkk_onay) {
    return { ok: false, error: "Devam etmek için KVKK metnini onaylaman gerek" };
  }

  // Tarama özeti client'tan geliyor — sınırla/doğrula
  const hostname = typeof scan?.hostname === "string" ? scan.hostname.slice(0, 200) : "";
  const skor = Math.max(0, Math.min(100, Math.round(Number(scan?.skor) || 0)));
  const not = String(scan?.not ?? "").slice(0, 3);

  const brief = [
    "KeScan sonrası — YENİ WEB SİTESİ talebi",
    `Taranan site: ${hostname || "—"}`,
    `KeScan skoru: ${skor}/100${not ? ` (${not})` : ""}`,
  ].join("\n");
  const ozet = `${hostname || "Site"} — KeScan ${skor}/100, yeni web sitesi istiyor`;

  const reqHeaders = await headers();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .insert({
      ad_soyad: parsed.data.ad_soyad,
      eposta: parsed.data.eposta,
      telefon: parsed.data.telefon,
      sirket: hostname || null,
      hizmet_kategori: ["web", "ai"],
      brief,
      ai_skor: skor,
      ai_ozet: ozet,
      kaynak: "kescan · yeni-site",
      user_agent: reqHeaders.get("user-agent") ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[requestNewSite] lead insert", error);
    return { ok: false, error: "Talebiniz gönderilemedi, lütfen tekrar deneyin" };
  }

  await notifyNewLead({
    ad_soyad: parsed.data.ad_soyad,
    eposta: parsed.data.eposta,
    telefon: parsed.data.telefon,
    sirket: hostname || null,
    hizmet_kategori: ["web", "ai"],
    brief,
    ai_ozet: ozet,
    kaynak: `KeScan → yeni web sitesi (${hostname})`,
    leadId: data.id,
  }).catch((e) => console.warn("[requestNewSite] team email skip:", e));

  return { ok: true };
}
