import "server-only";

const EMBEDDING_MODEL = "text-embedding-3-small"; // 1536 boyut
const BATCH_SIZE = 20;

/**
 * OpenAI embedding. OPENAI_API_KEY yoksa null döner → retriever BM25-only
 * moda düşer (Novawood'daki zarif düşüş deseni). Hata da null döner —
 * embedding hiçbir zaman sohbeti kırmaz.
 */
export async function embedTexts(texts: string[]): Promise<number[][] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || texts.length === 0) return null;

  const all: number[][] = [];
  try {
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      const res = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model: EMBEDDING_MODEL, input: batch }),
      });
      if (!res.ok) {
        console.warn("[embedder] OpenAI hata:", res.status, await res.text());
        return null;
      }
      const json = (await res.json()) as {
        data: { index: number; embedding: number[] }[];
      };
      const sorted = [...json.data].sort((a, b) => a.index - b.index);
      all.push(...sorted.map((d) => d.embedding));
    }
    return all;
  } catch (e) {
    console.warn("[embedder] embedding atlandı:", e);
    return null;
  }
}

export async function embedText(text: string): Promise<number[] | null> {
  const result = await embedTexts([text]);
  return result?.[0] ?? null;
}
