import "server-only";

export type HtmlAnalysis = {
  textChars: number;
  wordCount: number;
  h1: number;
  headings: number;
  imagesTotal: number;
  imagesWithAlt: number;
  internalLinks: number;
  jsonLdBlocks: number;
  jsonLdTypes: string[];
  hasIds: boolean;
  hasSameAs: boolean;
  title: string | null;
  metaDescription: boolean;
  ogTags: boolean;
  canonical: boolean;
  langTag: string | null;
  framework: string | null;
  analytics: string[];
  /** Başlık sonrası kendi kendine yeten pasaj sayısı (alıntılanabilirlik) */
  quotableSections: number;
  brandMentions: number;
  firstParagraphChars: number;
};

/** Ham HTML'den JS çalıştırmadan metin + yapısal sinyaller çıkarır. */
export function analyzeHtml(html: string, hostname: string): HtmlAnalysis {
  const jsonLd = extractJsonLd(html);

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? null;
  const langTag = html.match(/<html[^>]*\blang=["']?([a-zA-Z-]+)/i)?.[1] ?? null;

  const stripped = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<template[\s\S]*?<\/template>/gi, " ");

  const text = stripped
    .replace(/<[^>]+>/g, " ")
    .replace(/&(nbsp|#160);/g, " ")
    .replace(/&(amp|#38);/g, "&")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = text ? text.split(" ").filter((w) => w.length > 1) : [];

  const h1 = countMatches(stripped, /<h1[\s>]/gi);
  const headings = countMatches(stripped, /<h[1-6][\s>]/gi);

  const imgTags = stripped.match(/<img\b[^>]*>/gi) ?? [];
  const imagesWithAlt = imgTags.filter((t) => /\balt=["'][^"']+["']/i.test(t)).length;

  const hrefs = [...stripped.matchAll(/<a\b[^>]*\bhref=["']([^"'#]+)["']/gi)].map((m) => m[1]!);
  const bareHost = hostname.replace(/^www\./, "");
  const internalLinks = new Set(
    hrefs.filter((h) => {
      if (h.startsWith("/") && !h.startsWith("//")) return true;
      try {
        return new URL(h).hostname.replace(/^www\./, "") === bareHost;
      } catch {
        return false;
      }
    }),
  ).size;

  // Alıntılanabilirlik: başlığı izleyen ≥120 karakterlik metin blokları
  let quotableSections = 0;
  for (const m of stripped.matchAll(/<\/h[1-6]>([\s\S]{0,1200}?)(?=<h[1-6][\s>]|$)/gi)) {
    const seg = m[1]!
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (seg.length >= 120) quotableSections += 1;
  }

  // Marka tespiti: hostname token'ı ("kirmizierik") metindeki yazımla
  // ("Kırmızı Erik") eşleşsin diye iki taraf da fold edilir (diakritik +
  // boşluk düşürme). Tireli domainlerde ("kirmizi-erik.com") tire de düşer,
  // yoksa boşluksuz metinle asla eşleşmez.
  const brandToken = trFold(bareHost.split(".")[0] ?? "").replace(/[^a-z0-9]/g, "");
  const foldedText = trFold(text).replace(/\s+/g, "");
  const brandMentions =
    brandToken.length >= 3 ? countMatches(foldedText, new RegExp(escapeRe(brandToken), "g")) : 0;

  const firstP = stripped.match(/<p[\s>]([\s\S]*?)<\/p>/i)?.[1] ?? "";
  const firstParagraphChars = firstP
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;

  return {
    textChars: text.length,
    wordCount: words.length,
    h1,
    headings,
    imagesTotal: imgTags.length,
    imagesWithAlt,
    internalLinks,
    ...jsonLd,
    title,
    metaDescription: /<meta[^>]+name=["']description["'][^>]+content=["'][^"']{20,}/i.test(html),
    ogTags: /<meta[^>]+property=["']og:(title|description|image)["']/i.test(html),
    canonical: /<link[^>]+rel=["']canonical["']/i.test(html),
    langTag,
    framework: detectFramework(html),
    analytics: detectAnalytics(html),
    quotableSections,
    brandMentions,
    firstParagraphChars,
  };
}

function extractJsonLd(html: string): {
  jsonLdBlocks: number;
  jsonLdTypes: string[];
  hasIds: boolean;
  hasSameAs: boolean;
} {
  const blocks = [
    ...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ];
  const types = new Set<string>();
  let hasIds = false;
  let hasSameAs = false;
  let valid = 0;

  for (const b of blocks) {
    try {
      const data: unknown = JSON.parse(b[1]!.trim());
      valid += 1;
      walk(data);
    } catch {
      // bozuk blok sayılmaz
    }
  }

  function walk(node: unknown): void {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== "object") return;
    const obj = node as Record<string, unknown>;
    const t = obj["@type"];
    if (typeof t === "string") types.add(t);
    if (Array.isArray(t)) t.forEach((x) => typeof x === "string" && types.add(x));
    if (typeof obj["@id"] === "string") hasIds = true;
    if (obj["sameAs"]) hasSameAs = true;
    Object.values(obj).forEach(walk);
  }

  return {
    jsonLdBlocks: valid,
    jsonLdTypes: [...types].slice(0, 12),
    hasIds,
    hasSameAs,
  };
}

function detectFramework(html: string): string | null {
  if (/\/_next\/|__NEXT_DATA__/i.test(html)) return "Next.js";
  if (/wp-content|wp-includes/i.test(html)) return "WordPress";
  if (/cdn\.shopify\.com|Shopify\.theme/i.test(html)) return "Shopify";
  if (/__NUXT__|\/_nuxt\//i.test(html)) return "Nuxt";
  if (/wix\.com|wixstatic/i.test(html)) return "Wix";
  if (/squarespace/i.test(html)) return "Squarespace";
  if (/data-astro|astro-island/i.test(html)) return "Astro";
  if (/__remixContext/i.test(html)) return "Remix";
  const gen = html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)/i);
  return gen ? gen[1]!.split(" ")[0]! : null;
}

function detectAnalytics(html: string): string[] {
  const out: string[] = [];
  if (/googletagmanager\.com\/gtag|gtag\(/i.test(html)) out.push("Google Analytics");
  if (/googletagmanager\.com\/gtm/i.test(html)) out.push("Tag Manager");
  if (/connect\.facebook\.net|fbq\(/i.test(html)) out.push("Meta Pixel");
  if (/clarity\.ms/i.test(html)) out.push("MS Clarity");
  if (/hotjar/i.test(html)) out.push("Hotjar");
  if (/plausible\.io/i.test(html)) out.push("Plausible");
  return out;
}

function trFold(s: string): string {
  return s
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

function countMatches(s: string, re: RegExp): number {
  return (s.match(re) ?? []).length;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
