import { trackMetaCustomEvent, trackMetaEvent, trackMetaLead } from "./meta-pixel";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// gtag yalnızca çerez onayı sonrası yüklenir; yoksa sessizce no-op.
export function trackGaEvent(name: string, params?: Record<string, unknown>) {
  window.gtag?.("event", name, params);
}

const GOOGLE_ADS_LEAD_SEND_TO =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_SEND_TO || "AW-956573955/lBytCLyz5KMdEIPSkMgD";

export type LeadContact = { email?: FormDataEntryValue | null; phone?: FormDataEntryValue | null };

// Gelişmiş dönüşümler E.164 ister: "0532 261 82 22" → "+905322618222"
function toE164(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return undefined;
  if (digits.startsWith("90")) return `+${digits}`;
  if (digits.startsWith("0")) return `+90${digits.slice(1)}`;
  if (digits.length === 10) return `+90${digits}`;
  return `+${digits}`;
}

function trackGoogleAdsLead(contact?: LeadContact) {
  const email = typeof contact?.email === "string" ? contact.email.trim().toLowerCase() : "";
  const phone = typeof contact?.phone === "string" ? toE164(contact.phone) : undefined;
  const userData: Record<string, string> = {};
  if (email) userData.email = email;
  if (phone) userData.phone_number = phone;
  if (email || phone) window.gtag?.("set", "user_data", userData);
  window.gtag?.("event", "conversion", { send_to: GOOGLE_ADS_LEAD_SEND_TO });
}

// Form gönderimi = birincil dönüşüm (GA4 generate_lead + Google Ads + Meta Lead).
export function trackLead(source: string, contact?: LeadContact) {
  trackGaEvent("generate_lead", { source });
  trackGoogleAdsLead(contact);
  trackMetaLead({ content_name: source });
}

// Tel/WhatsApp/e-posta tıklaması = ikincil (micro) dönüşüm.
export function trackContactClick(channel: "whatsapp" | "phone" | "email") {
  trackGaEvent("contact_click", { channel });
  trackMetaEvent("Contact", { channel });
}

// ──────────────────────────────────────────────────────────────────
// Chat hunisi: chat_open → chat_first_message → generate_lead
// Reklam kampanyaları generate_lead/Lead'e optimize edilir; ara adımlar
// retargeting kitlesi (chat açıp lead bırakmayan) kurmak için.
// ──────────────────────────────────────────────────────────────────
export function trackChatOpen(page: string) {
  trackGaEvent("chat_open", { page });
}

export function trackChatFirstMessage(page: string) {
  trackGaEvent("chat_first_message", { page });
  trackMetaCustomEvent("ChatEngaged", { page });
}

export function trackChatQuickReply(label: string) {
  trackGaEvent("chat_quick_reply", { label });
}
