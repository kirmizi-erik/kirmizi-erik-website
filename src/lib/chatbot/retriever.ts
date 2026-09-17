import "server-only";

import { chatbotDb } from "./db";
import { embedText } from "./embedder";

export type RetrievedChunk = {
  id: string;
  title: string;
  content: string;
  source_url: string | null;
  authority: number;
  score: number;
};

const TOP_K = 6;
const CANDIDATE_K = 30;
const RRF_K = 60;
const SEMANTIC_WEIGHT = 0.6;
const BM25_WEIGHT = 0.3;
const CONTEXT_CHAR_BUDGET = 9000;

// Sorgu genişletme: eş anlamlılar BM25 recall'ını artırır (Novawood deseni, küçük tablo)
const EXPANSIONS: Array<[RegExp, string]> = [
  [/fiyat|ücret|bütçe|maliyet|kaç para/, "fiyat teklif bütçe aralık"],
  [/web ?site|websitesi|site yap/, "web sitesi yazılım"],
  [/sosyal medya|instagram|linkedin|tiktok/, "sosyal medya içerik yönetim"],
  [/video|film|çekim|reklam filmi/, "video prodüksiyon çekim kurgu"],
  [/foto[gğ]raf/, "fotoğraf çekim ürün"],
  [/yapay zeka|chatbot|asistan|\bai\b/, "AI yapay zeka kurulum chatbot otomasyon"],
  [/logo|kurumsal kimlik|amblem/, "grafik tasarım kurumsal kimlik logo"],
  [/uygulama|mobil|app\b/, "uygulama yazılım mobil"],
  [/kimsiniz|hakkınızda|tarihçe|ne zaman kuruldu/, "kuruluş tarihçe hikâye Özkan Kurt"],
  [/referans|müşteri|çalıştığınız markalar/, "referans marka müşteri"],
  [/süre|ne kadar sürer|teslim/, "süre hafta takvim teslim"],
];

/**
 * Türkçe-güvenli fold — SQL tarafındaki tr_fold() ile birebir aynı normalize.
 * İki taraf tutarlı olduğu sürece prefix eşleşmesi locale'den bağımsız çalışır.
 */
function trFold(s: string): string {
  return s
    .normalize("NFC")
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u");
}

function expandQuery(query: string): string {
  const lower = query.toLocaleLowerCase("tr-TR");
  const extras = EXPANSIONS.filter(([re]) => re.test(lower)).map(([, add]) => add);
  return extras.length > 0 ? `${query} ${extras.join(" ")}` : query;
}

/** tr_fold'lanmış `tok:* | tok:*` tsquery ifadesi (token 6 char'a kırpılır). */
function buildTsQuery(query: string): string | null {
  const tokens = Array.from(
    new Set(
      trFold(query)
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((t) => t.length >= 2)
        .map((t) => t.slice(0, 6)),
    ),
  ).slice(0, 12);
  if (tokens.length === 0) return null;
  return tokens.map((t) => `${t}:*`).join(" | ");
}

/**
 * Hibrit arama: pgvector semantik + tsvector BM25, RRF füzyonu.
 * Embedding yoksa (key eksik / hata) BM25-only devam eder.
 */
export async function hybridSearch(query: string): Promise<RetrievedChunk[]> {
  const db = chatbotDb();
  const expanded = expandQuery(query);
  const tsQuery = buildTsQuery(expanded);

  const [embedding, bm25Res] = await Promise.all([
    embedText(expanded),
    tsQuery
      ? db.rpc("kb_search_bm25", { query_ts: tsQuery, match_count: CANDIDATE_K })
      : Promise.resolve({ data: null, error: null }),
  ]);

  const semanticRes = embedding
    ? await db.rpc("kb_search_semantic", {
        query_embedding: embedding,
        match_count: CANDIDATE_K,
      })
    : { data: null, error: null };

  if (bm25Res.error) console.warn("[retriever] bm25:", bm25Res.error.message);
  if (semanticRes.error) console.warn("[retriever] semantic:", semanticRes.error.message);

  const semantic = (semanticRes.data ?? []) as RetrievedChunk[];
  const bm25 = (bm25Res.data ?? []) as RetrievedChunk[];

  // RRF füzyonu
  const fused = new Map<string, { chunk: RetrievedChunk; score: number }>();
  const addRanked = (list: RetrievedChunk[], weight: number) => {
    list.forEach((chunk, rank) => {
      const entry = fused.get(chunk.id) ?? { chunk, score: 0 };
      entry.score += weight / (RRF_K + rank + 1);
      fused.set(chunk.id, entry);
    });
  };
  addRanked(semantic, SEMANTIC_WEIGHT);
  addRanked(bm25, BM25_WEIGHT);

  let results = Array.from(fused.values())
    .sort((a, b) => b.score - a.score)
    .map((e) => e.chunk)
    .slice(0, TOP_K);

  // BM25 top-1 garantisi: keyword şampiyonu füzyonda düştüyse geri ekle
  const bm25Top = bm25[0];
  if (bm25Top && !results.some((c) => c.id === bm25Top.id)) {
    results = [...results.slice(0, TOP_K - 1), bm25Top];
  }

  return results;
}

/**
 * LLM'e verilecek bağlam bloğu. `(Detay: url)` işareti system prompt'taki
 * "sadece bağlamda geçen linkleri ver" kuralının dayanağı.
 */
export async function getContext(query: string): Promise<string> {
  try {
    const chunks = await hybridSearch(query);
    if (chunks.length === 0) return "";

    const parts: string[] = [];
    let used = 0;
    for (const chunk of chunks) {
      const header = chunk.source_url
        ? `[${chunk.title}] (Detay: ${chunk.source_url})`
        : `[${chunk.title}]`;
      const block = `${header}\n${chunk.content}`;
      if (used + block.length > CONTEXT_CHAR_BUDGET) break;
      parts.push(block);
      used += block.length;
    }
    return parts.join("\n\n---\n\n");
  } catch (e) {
    console.warn("[retriever] bağlam atlandı:", e);
    return "";
  }
}
