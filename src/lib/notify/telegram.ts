import "server-only";

import type { LeadNotificationInput } from "@/lib/email/resend";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Telegram mesaj limiti 4096 karakter; brief önizlemesi kısa tutulur.
const BRIEF_PREVIEW_CHARS = 600;

function buildMessage(lead: LeadNotificationInput): string {
  const lines = [
    `🔴 Yeni lead — ${lead.kaynak}`,
    "",
    `${lead.ad_soyad}${lead.sirket ? ` (${lead.sirket})` : ""}`,
    lead.telefon ? `Tel: ${lead.telefon}` : null,
    `E-posta: ${lead.eposta}`,
    lead.hizmet_kategori?.length ? `Hizmet: ${lead.hizmet_kategori.join(", ")}` : null,
    lead.butce ? `Bütçe: ${lead.butce}` : null,
    "",
    lead.ai_ozet ? `Özet: ${lead.ai_ozet}` : `Brief: ${lead.brief.slice(0, BRIEF_PREVIEW_CHARS)}`,
    "",
    `${SITE_URL}/admin/leadler/${lead.leadId}`,
  ];
  return lines.filter((l) => l !== null).join("\n");
}

/** Telegram bot ile ekibe lead bildirimi. Env yoksa sessizce atlar. */
export async function sendLeadTelegram(
  lead: LeadNotificationInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return { ok: false, error: "TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID yapılandırılmadı" };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: buildMessage(lead),
        link_preview_options: { is_disabled: true },
      }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[telegram] HTTP", res.status, await res.text());
      return { ok: false, error: `Telegram HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("[telegram] exception", err);
    return { ok: false, error: "Telegram bildirimi gönderilemedi" };
  }
}
