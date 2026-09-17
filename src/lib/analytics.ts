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

// Form gönderimi = birincil dönüşüm (GA4 generate_lead + Meta Lead).
export function trackLead(source: string) {
  trackGaEvent("generate_lead", { source });
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
