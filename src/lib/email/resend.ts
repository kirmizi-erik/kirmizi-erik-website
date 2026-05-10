import "server-only";

import { Resend } from "resend";

let _client: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_client) _client = new Resend(process.env.RESEND_API_KEY);
  return _client;
}

export type LeadNotificationInput = {
  ad_soyad: string;
  eposta: string;
  telefon?: string | null;
  sirket?: string | null;
  hizmet_kategori?: string[];
  butce?: string | null;
  brief: string;
  ai_ozet?: string | null;
  kaynak: string;
  leadId: string;
};

const FROM_DEFAULT = process.env.RESEND_FROM_EMAIL ?? "Kırmızı Erik <onboarding@resend.dev>";
const TO_DEFAULT: string[] = (
  process.env.LEAD_NOTIFICATION_TO ?? "info@kirmizierik.com.tr,kirmizierikmm@gmail.com"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Yeni lead geldiğinde Kırmızı Erik ekibine bilgilendirme e-postası gönderir.
 * Resend API key yoksa sessizce skip eder (dev'de zorunlu değil).
 */
export async function sendLeadNotification(
  lead: LeadNotificationInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const resend = getResend();
  if (!resend) {
    console.log("[email] RESEND_API_KEY yok, e-posta bildirimi skip");
    return { ok: false, error: "RESEND_API_KEY yapılandırılmadı" };
  }

  const adminUrl = `${SITE_URL}/admin/leadler/${lead.leadId}`;
  const subject = `Yeni brief: ${lead.ad_soyad}${lead.sirket ? ` (${lead.sirket})` : ""}`;

  const hizmetlerHtml =
    lead.hizmet_kategori && lead.hizmet_kategori.length
      ? `<p style="margin: 0 0 8px 0;"><strong>Hizmetler:</strong> ${lead.hizmet_kategori.join(", ")}</p>`
      : "";
  const butceHtml = lead.butce
    ? `<p style="margin: 0 0 8px 0;"><strong>Bütçe:</strong> ${lead.butce}</p>`
    : "";
  const sirketHtml = lead.sirket
    ? `<p style="margin: 0 0 8px 0;"><strong>Şirket:</strong> ${lead.sirket}</p>`
    : "";
  const telefonHtml = lead.telefon
    ? `<p style="margin: 0 0 8px 0;"><strong>Telefon:</strong> <a href="tel:${lead.telefon}">${lead.telefon}</a></p>`
    : "";
  const aiHtml = lead.ai_ozet
    ? `<div style="background:#f3f4f6;border-radius:8px;padding:12px;margin:16px 0;"><p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;">AI özeti</p><p style="margin:6px 0 0 0;font-style:italic;">${escapeHtml(lead.ai_ozet)}</p></div>`
    : "";

  const html = `<!DOCTYPE html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #111;">
  <div style="border-bottom: 3px solid #DC0E18; padding-bottom: 12px; margin-bottom: 24px;">
    <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Yeni Brief Geldi</h1>
    <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 13px;">${escapeHtml(lead.kaynak)}</p>
  </div>

  <div style="margin-bottom: 24px;">
    <h2 style="margin: 0 0 12px 0; font-size: 18px;">${escapeHtml(lead.ad_soyad)}</h2>
    ${sirketHtml}
    <p style="margin: 0 0 8px 0;"><strong>E-posta:</strong> <a href="mailto:${escapeHtml(lead.eposta)}">${escapeHtml(lead.eposta)}</a></p>
    ${telefonHtml}
    ${hizmetlerHtml}
    ${butceHtml}
  </div>

  ${aiHtml}

  <div style="margin-bottom: 24px;">
    <p style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">Brief / Sohbet</p>
    <div style="background: #fafafa; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${escapeHtml(lead.brief)}</div>
  </div>

  <div style="text-align: center; margin: 32px 0;">
    <a href="${adminUrl}" style="display: inline-block; background: #DC0E18; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Admin'de Aç</a>
  </div>

  <p style="font-size: 11px; color: #6b7280; text-align: center; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 12px;">
    Kırmızı Erik · kirmizierik.com.tr
  </p>
</body></html>`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_DEFAULT,
      to: TO_DEFAULT,
      replyTo: lead.eposta,
      subject,
      html,
    });
    if (error) {
      console.error("[email] resend error", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] exception", err);
    return { ok: false, error: "E-posta gönderilemedi" };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
