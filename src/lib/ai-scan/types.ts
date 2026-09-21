export type LayerKey = "erisim" | "cikarilabilirlik" | "altyapi" | "anlam" | "alintilanabilirlik";

export const LAYER_WEIGHTS: Record<LayerKey, number> = {
  erisim: 30,
  cikarilabilirlik: 25,
  altyapi: 15,
  anlam: 15,
  alintilanabilirlik: 15,
};

export const LAYER_LABELS: Record<LayerKey, { baslik: string; soru: string }> = {
  erisim: { baslik: "Erişim", soru: "AI botları gerçekten içeri girebiliyor mu?" },
  cikarilabilirlik: {
    baslik: "Çıkarılabilirlik",
    soru: "JavaScript çalıştırmayan bot ne görüyor?",
  },
  altyapi: { baslik: "Altyapı Dosyaları", soru: "robots, sitemap ve llms.txt yerinde mi?" },
  anlam: { baslik: "Anlam Katmanı", soru: "Yapılandırılmış veri bir grafik kuruyor mu?" },
  alintilanabilirlik: {
    baslik: "Alıntılanabilirlik",
    soru: "Alıntılanacak net bir pasaj var mı?",
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
