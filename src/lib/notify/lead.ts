import "server-only";

import { sendLeadNotification, type LeadNotificationInput } from "@/lib/email/resend";

import { sendLeadWhatsApp } from "./whatsapp";

/** Yeni lead'i tüm kanallara (e-posta + WhatsApp) paralel bildirir; hiçbiri throw etmez. */
export async function notifyNewLead(lead: LeadNotificationInput): Promise<void> {
  const [email, whatsapp] = await Promise.allSettled([
    sendLeadNotification(lead),
    sendLeadWhatsApp(lead),
  ]);
  for (const [channel, result] of [
    ["email", email],
    ["whatsapp", whatsapp],
  ] as const) {
    if (result.status === "rejected") console.warn(`[notify] ${channel}:`, result.reason);
    else if (!result.value.ok) console.warn(`[notify] ${channel}:`, result.value.error);
  }
}
