import "server-only";

import { chatbotDb } from "./db";
import { embedTexts } from "./embedder";
import { buildSiteDocs } from "./kb";

export type AdminKnowledgeEntry = {
  id: string;
  question_tr: string;
  answer_tr: string;
  question_en: string | null;
  answer_en: string | null;
  source_url: string | null;
};

/** embedding'i NULL kalan chunk'ları embed'ler (key yoksa no-op). */
export async function embedMissingChunks(): Promise<number> {
  const db = chatbotDb();
  const { data, error } = await db
    .from("kb_chunks")
    .select("id, title, content, embed_text")
    .is("embedding", null);
  if (error || !data || data.length === 0) return 0;

  const texts = data.map((c) =>
    c.embed_text ? c.embed_text : `${c.title} | ${c.content.slice(0, 2500)}`,
  );
  const embeddings = await embedTexts(texts);
  if (!embeddings) return 0;

  let done = 0;
  for (const [i, row] of data.entries()) {
    const embedding = embeddings[i];
    if (!embedding) continue;
    const { error: upErr } = await db.from("kb_chunks").update({ embedding }).eq("id", row.id);
    if (!upErr) done++;
  }
  return done;
}

/**
 * Site korpusunu sıfırdan indeksler: source='site' chunk'ları silinir ve
 * services-data + firma-genel'den yeniden yazılır. source='admin' (eğitim
 * Q&A) chunk'larına DOKUNMAZ — Novawood'daki ayrı data-source deseni.
 */
export async function reingestSiteKb(): Promise<{ chunks: number; embedded: number }> {
  const db = chatbotDb();
  const docs = await buildSiteDocs();

  const { error: delErr } = await db.from("kb_chunks").delete().eq("source", "site");
  if (delErr) throw new Error(`site chunk silme: ${delErr.message}`);

  const rows = docs.map((d) => ({
    source: "site",
    title: d.title,
    content: d.content,
    embed_text: d.embedText ?? null,
    source_url: d.sourceUrl,
    lang: "tr",
    authority: d.authority,
  }));
  const { error: insErr } = await db.from("kb_chunks").insert(rows);
  if (insErr) throw new Error(`site chunk ekleme: ${insErr.message}`);

  const embedded = await embedMissingChunks();
  return { chunks: rows.length, embedded };
}

/**
 * Panelden girilen Soru/Cevap çiftini indeksler: authority=1 (en yetkili),
 * embed_text = soru + cevap (benzer ziyaretçi sorusu semantik olarak
 * saklanan soruya yakın düşsün). Etki anında — rebuild/reingest gerekmez.
 */
export async function indexAdminEntry(entry: AdminKnowledgeEntry): Promise<void> {
  const db = chatbotDb();

  // Update durumunda eski chunk'lar silinip yeniden yazılır (dil sayısı değişebilir)
  await db.from("kb_chunks").delete().eq("admin_entry_id", entry.id);

  const rows = [
    {
      source: "admin",
      admin_entry_id: entry.id,
      title: entry.question_tr.slice(0, 200),
      content: `Soru: ${entry.question_tr}\nCevap: ${entry.answer_tr}`,
      embed_text: `${entry.question_tr} | ${entry.answer_tr.slice(0, 2500)}`,
      source_url: entry.source_url,
      lang: "tr",
      authority: 1,
    },
  ];
  if (entry.question_en && entry.answer_en) {
    rows.push({
      source: "admin",
      admin_entry_id: entry.id,
      title: entry.question_en.slice(0, 200),
      content: `Question: ${entry.question_en}\nAnswer: ${entry.answer_en}`,
      embed_text: `${entry.question_en} | ${entry.answer_en.slice(0, 2500)}`,
      source_url: entry.source_url,
      lang: "en",
      authority: 1,
    });
  }

  const { error } = await db.from("kb_chunks").insert(rows);
  if (error) throw new Error(`admin chunk ekleme: ${error.message}`);

  await embedMissingChunks();
}

export async function removeAdminEntryChunks(entryId: string): Promise<void> {
  const db = chatbotDb();
  await db.from("kb_chunks").delete().eq("admin_entry_id", entryId);
}
