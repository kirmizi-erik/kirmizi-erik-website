import "server-only";

import { createHash } from "node:crypto";

import { chatbotDb } from "./db";

// Cevapsız (bilgi boşluğu) sinyali — panel bu bayrağa göre filtreler,
// bilgi bankasına eklenecek soruları buradan görürüz.
const UNANSWERED_PATTERNS: RegExp[] = [
  /bilgim yok/i,
  /bilgi bankamda/i,
  /yardımcı olamam/i,
  /bu konuda (net )?bilgi(m| sahibi değilim| veremem)/i,
  /emin değilim/i,
  /maalesef .{0,40}bilgi/i,
  /elimde .{0,30}bilgi (yok|bulunmuyor)/i,
];

export function isUnanswered(answer: string): boolean {
  return UNANSWERED_PATTERNS.some((re) => re.test(answer));
}

/** KVKK: ham IP saklanmaz, salt'lı sha256 hash saklanır. */
export function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  const salt = process.env.IP_HASH_SALT ?? "kirmizi-erik-chat";
  return createHash("sha256")
    .update(salt + ip)
    .digest("hex");
}

export type ChatTurn = {
  sessionId: string;
  locale?: string;
  ip: string | null;
  pageUrl?: string | null;
  question: string;
  answer: string;
  latencyMs: number;
  unanswered: boolean;
};

/**
 * Bir soru-cevap turunu kaydeder (conversation upsert + 2 mesaj, tek RPC).
 * Fail-soft: hata ziyaretçinin sohbetini asla kırmaz.
 */
export async function recordTurn(turn: ChatTurn): Promise<void> {
  try {
    const db = chatbotDb();
    const { error } = await db.rpc("record_chat_turn", {
      p_session_id: turn.sessionId.slice(0, 64),
      p_locale: turn.locale ?? "tr",
      p_ip_hash: hashIp(turn.ip),
      p_page_url: turn.pageUrl?.slice(0, 500) ?? null,
      p_question: turn.question,
      p_answer: turn.answer,
      p_latency_ms: turn.latencyMs,
      p_unanswered: turn.unanswered,
    });
    if (error) console.warn("[transcript] kayıt hatası:", error.message);
  } catch (e) {
    console.warn("[transcript] kayıt atlandı:", e);
  }
}
