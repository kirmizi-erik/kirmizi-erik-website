import "server-only";

import { sendLeadNotification, type LeadNotificationInput } from "@/lib/email/resend";

import { sendLeadTelegram } from "./telegram";

/** Yeni lead'i tüm kanallara (e-posta + Telegram) paralel bildirir; hiçbiri throw etmez. */
export async function notifyNewLead(lead: LeadNotificationInput): Promise<void> {
  const [email, telegram] = await Promise.allSettled([
    sendLeadNotification(lead),
    sendLeadTelegram(lead),
  ]);
  for (const [channel, result] of [
    ["email", email],
    ["telegram", telegram],
  ] as const) {
    if (result.status === "rejected") console.warn(`[notify] ${channel}:`, result.reason);
    else if (!result.value.ok) console.warn(`[notify] ${channel}:`, result.value.error);
  }
}
