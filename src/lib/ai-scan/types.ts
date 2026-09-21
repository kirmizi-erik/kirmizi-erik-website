export type LayerKey = "erisim" | "cikarilabilirlik" | "altyapi" | "anlam" | "alintilanabilirlik";

export const LAYER_WEIGHTS: Record<LayerKey, number> = {
  erisim: 30,
  cikarilabilirlik: 25,
  altyapi: 15,
  anlam: 15,
  alintilanabilirlik: 15,
};

export const LAYER_LABELS: Record<LayerKey, { baslik: string; soru: string }> = {
  erisim: {
    baslik: "Erişim",
    soru: "ChatGPT, Claude gibi asistanların botları sitenize girebiliyor mu?",
  },
  cikarilabilirlik: {
    baslik: "Çıkarılabilirlik",
    soru: "Bir bot sayfanızı açtığında gerçek metninizi okuyabiliyor mu?",
  },
  altyapi: {
    baslik: "Altyapı Dosyaları",
    soru: "Botlara yol gösteren dosyalar (robots, sitemap, llms.txt) yerinde mi?",
  },
  anlam: {
    baslik: "Anlam Katmanı",
    soru: "Sitenizin ne ve kim olduğunu makinelere anlatan etiketler kurulu mu?",
  },
  alintilanabilirlik: {
    baslik: "Alıntılanabilirlik",
    soru: "Yapay zekâ cevap verirken sitenizden alıntı yapabilir mi?",
  },
};

/** Katman başına sabit vurgu rengi — sonuç kartları + sayfa açıklaması aynı dili konuşur. */
export const LAYER_COLORS: Record<
  LayerKey,
  { border: string; text: string; bg: string; ring: string }
> = {
  erisim: {
    border: "border-l-sky-400",
    text: "text-sky-400",
    bg: "bg-sky-400/10",
    ring: "border-sky-400/50",
  },
  cikarilabilirlik: {
    border: "border-l-violet-400",
    text: "text-violet-400",
    bg: "bg-violet-400/10",
    ring: "border-violet-400/50",
  },
  altyapi: {
    border: "border-l-teal-400",
    text: "text-teal-400",
    bg: "bg-teal-400/10",
    ring: "border-teal-400/50",
  },
  anlam: {
    border: "border-l-fuchsia-400",
    text: "text-fuchsia-400",
    bg: "bg-fuchsia-400/10",
    ring: "border-fuchsia-400/50",
  },
  alintilanabilirlik: {
    border: "border-l-orange-400",
    text: "text-orange-400",
    bg: "bg-orange-400/10",
    ring: "border-orange-400/50",
  },
};

export type Onem = "kritik" | "uyari" | "bilgi";

export type Finding = {
  katman: LayerKey;
  onem: Onem;
  mesaj: string;
  cozum: string;
};

export type LayerScore = {
  key: LayerKey;
  puan: number; // 0-100
  agirlik: number;
  ozet: string;
  bulgular: Finding[];
};

export type BotCheck = {
  bot: string;
  robotsAllowed: boolean | null; // null = robots.txt yok/okunamadı
  status: number | null;
  bytes: number | null;
  sonuc: "gecti" | "engelli" | "farkli" | "hata";
};

export type ScanMetrics = {
  htmlKb: number;
  textKb: number;
  textRatio: number; // yüzde
  wordCount: number;
  tokenEstimate: number;
  ttfbMs: number;
  redirects: number;
  h1: number;
  headings: number;
  imagesTotal: number;
  imagesWithAlt: number;
  internalLinks: number;
  compression: string | null;
};

export type ScanInfra = {
  robotsTxt: boolean;
  sitemap: boolean;
  llmsTxt: boolean;
  llmsFullTxt: boolean;
};

export type ScanSemantics = {
  jsonLdBlocks: number;
  jsonLdTypes: string[];
  hasIds: boolean;
  hasSameAs: boolean;
  title: string | null;
  metaDescription: boolean;
  ogTags: boolean;
  canonical: boolean;
  langTag: string | null;
};

export type ScanTech = {
  framework: string | null;
  server: string | null;
  analytics: string[];
  csp: boolean;
  hsts: boolean;
};

export type ScanResult = {
  inputUrl: string;
  finalUrl: string;
  hostname: string;
  fetchedAt: string; // ISO
  skor: number;
  not: string; // A+ .. E
  ozet: string;
  katmanlar: LayerScore[];
  metrics: ScanMetrics;
  bots: BotCheck[];
  infra: ScanInfra;
  semantics: ScanSemantics;
  tech: ScanTech;
  prompt: string; // AI'ya yapıştırılacak görev listesi
};
