import "server-only";

import type { LeadNotificationInput } from "@/lib/email/resend";

const CALLMEBOT_URL = "https://api.callmebot.com/whatsapp.php";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// CallMeBot mesajı URL query'de taşır; uzun brief'i kısa tut.
const BRIEF_PREVIEW_CHARS = 300;

function buildMessage(lead: LeadNotificationInput): string {
  const lines = [
    `*Yeni lead* — ${lead.kaynak}`,
    `${lead.ad_soyad}${lead.sirket ? ` (${lead.sirket})` : ""}`,
    lead.telefon ? `Tel: ${lead.telefon}` : null,
    `E-posta: ${lead.eposta}`,
    lead.hizmet_kategori?.length ? `Hizmet: ${lead.hizmet_kategori.join(", ")}` : null,
    lead.ai_ozet ? `Özet: ${lead.ai_ozet}` : `Brief: ${lead.brief.slice(0, BRIEF_PREVIEW_CHARS)}`,
    `${SITE_URL}/admin/leadler/${lead.leadId}`,
  ];
  return lines.filter(Boolean).join("\n");
}

/** CallMeBot ile ekibe WhatsApp bildirimi. Env yoksa sessizce atlar. */
export async function sendLeadWhatsApp(
  lead: LeadNotificationInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apikey) {
    return { ok: false, error: "CALLMEBOT_PHONE / CALLMEBOT_APIKEY yapılandırılmadı" };
  }

  const url = new URL(CALLMEBOT_URL);
  url.searchParams.set("phone", phone);
  url.searchParams.set("apikey", apikey);
  url.searchParams.set("text", buildMessage(lead));

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000), cache: "no-store" });
    if (!res.ok) {
      console.error("[whatsapp] callmebot HTTP", res.status);
      return { ok: false, error: `CallMeBot HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("[whatsapp] exception", err);
    return { ok: false, error: "WhatsApp bildirimi gönderilemedi" };
  }
}
