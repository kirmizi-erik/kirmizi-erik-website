import "server-only";

import { analyzeHtml } from "./html";
import { safeFetch, validateScanUrl, type FetchOutcome } from "./net";
import { isPathAllowed } from "./robots";
import {
  LAYER_WEIGHTS,
  type BotCheck,
  type Finding,
  type LayerKey,
  type LayerScore,
  type ScanResult,
} from "./types";

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36 KirmiziErikScan/1.0";

const AI_BOTS: { bot: string; ua: string }[] = [
  {
    bot: "GPTBot",
    ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot",
  },
  {
    bot: "OAI-SearchBot",
    ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot",
  },
  {
    bot: "ClaudeBot",
    ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
  },
  {
    bot: "PerplexityBot",
    ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
  },
  {
    bot: "Googlebot",
    ua: "Mozilla/5.0 AppleWebKit/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/128.0 Safari/537.36",
  },
];

export async function runScan(inputUrl: string): Promise<ScanResult> {
  const url = await validateScanUrl(inputUrl);
  const origin = new URL(url.origin);

  // 1. tur: ana sayfa (tarayıcı UA) + altyapı dosyaları paralel
  const [page, robots, sitemap, llms, llmsFull] = await Promise.all([
    safeFetch(url, { userAgent: BROWSER_UA }),
    safeFetch(new URL("/robots.txt", origin), { userAgent: BROWSER_UA, maxBytes: 256 * 1024 }),
    safeFetch(new URL("/sitemap.xml", origin), { userAgent: BROWSER_UA, readBody: false }),
    safeFetch(new URL("/llms.txt", origin), { userAgent: BROWSER_UA, maxBytes: 64 * 1024 }),
    safeFetch(new URL("/llms-full.txt", origin), { userAgent: BROWSER_UA, readBody: false }),
  ]);

  if (!page.status || page.status >= 400 || !page.body) {
    if (page.status === 403 || page.status === 451 || page.status === 429) {
      throw new Error(
        `Site ${page.status} döndü — otomatik taramaları sunucu seviyesinde engelliyor. Bu genellikle AI botlarının da engellendiğine işaret eder; detaylı analiz için bizimle iletişime geçin.`,
      );
    }
    throw new Error(
      page.error
        ? `Siteye ulaşılamadı: ${page.error}`
        : `Site ${page.status ?? "yanıtsız"} döndü — adresi kontrol edin`,
    );
  }

  const robotsTxt =
    robots.status === 200 && robots.body && robots.bytes < 256 * 1024 ? robots.body : null;

  // 2. tur: aynı sayfa 5 AI bot kimliğiyle (paralel)
  const finalPageUrl = await validateScanUrl(page.finalUrl);
  const botFetches = await Promise.all(
    AI_BOTS.map((b) => safeFetch(finalPageUrl, { userAgent: b.ua, maxBytes: 1024 * 1024 })),
  );

  const bots: BotCheck[] = AI_BOTS.map((b, i) =>
    toBotCheck(b.bot, botFetches[i]!, robotsTxt, page),
  );

  const a = analyzeHtml(page.body, url.hostname);

  const okContentType = /text\/html/i.test(page.headers["content-type"] ?? "text/html");
  const htmlKb = round1(page.bytes / 1024);
  const textKb = round1(a.textChars / 1024);
  const textRatio = page.bytes > 0 ? round1((a.textChars / page.bytes) * 100) : 0;

  const infra = {
    robotsTxt: robots.status === 200,
    sitemap: sitemap.status === 200,
    llmsTxt: llms.status === 200 && isPlainText(llms),
    llmsFullTxt: llmsFull.status === 200,
  };

  const metrics = {
    htmlKb,
    textKb,
    textRatio,
    wordCount: a.wordCount,
    tokenEstimate: Math.round(a.textChars / 4),
    ttfbMs: page.ttfbMs,
    redirects: page.redirects,
    h1: a.h1,
    headings: a.headings,
    imagesTotal: a.imagesTotal,
    imagesWithAlt: a.imagesWithAlt,
    internalLinks: a.internalLinks,
    compression: page.headers["content-encoding"] ?? null,
  };

  const semantics = {
    jsonLdBlocks: a.jsonLdBlocks,
    jsonLdTypes: a.jsonLdTypes,
    hasIds: a.hasIds,
    hasSameAs: a.hasSameAs,
    title: a.title,
    metaDescription: a.metaDescription,
    ogTags: a.ogTags,
    canonical: a.canonical,
    langTag: a.langTag,
  };

  const tech = {
    framework: a.framework,
    server: page.headers["x-vercel-id"]
      ? "Vercel"
      : page.headers["cf-ray"]
        ? "Cloudflare"
        : (page.headers["server"] ?? null),
    analytics: a.analytics,
    csp: Boolean(page.headers["content-security-policy"]),
    hsts: Boolean(page.headers["strict-transport-security"]),
  };

  // ---- Katman puanları ----
  const bulgular: Finding[] = [];
  const add = (katman: LayerKey, onem: Finding["onem"], mesaj: string, cozum: string) =>
    bulgular.push({ katman, onem, mesaj, cozum });

  // Erişim
  let erisim = 100;
  const blockedBots = bots.filter((b) => b.sonuc === "engelli");
  const partialBots = bots.filter((b) => b.sonuc === "farkli");
  const robotsBlocked = bots.filter((b) => b.robotsAllowed === false);
  if (blockedBots.length) {
    erisim -= blockedBots.length * 18;
    add(
      "erisim",
      "kritik",
      `${blockedBots.map((b) => b.bot).join(", ")} sunucu tarafından engelleniyor (robots ne derse desin)`,
      "Sunucu/WAF kurallarında AI bot user-agent'larına izin verin; CDN bot koruması ayarlarını kontrol edin.",
    );
  }
  if (robotsBlocked.length) {
    erisim -= robotsBlocked.length * 12;
    add(
      "erisim",
      "kritik",
      `robots.txt şu botları reddediyor: ${robotsBlocked.map((b) => b.bot).join(", ")}`,
      "robots.txt'e AI botları için Allow kuralı ekleyin (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot).",
    );
  }
  if (partialBots.length) {
    erisim -= partialBots.length * 8;
    add(
      "erisim",
      "uyari",
      `${partialBots.map((b) => b.bot).join(", ")} tarayıcıdan belirgin farklı içerik alıyor`,
      "Bot kimliğine göre farklı içerik sunmayın (cloaking hem AI hem Google için risklidir).",
    );
  }

  // Çıkarılabilirlik
  let cikar = 100;
  if (!okContentType) cikar -= 30;
  if (a.wordCount < 80) {
    cikar -= 35;
    add(
      "cikarilabilirlik",
      "kritik",
      `JS çalıştırmayan bot yalnızca ${a.wordCount} kelime görüyor`,
      "Ana içerik sunucu tarafında (SSR/SSG) HTML'e basılmalı; client-only render'dan kaçının.",
    );
  } else if (a.wordCount < 250) {
    cikar -= 15;
    add(
      "cikarilabilirlik",
      "uyari",
      `Bot'un okuduğu metin sınırlı (${a.wordCount} kelime)`,
      "Sayfaya bot-okunur özgün metin ekleyin: hizmet açıklamaları, SSS, konum/uzmanlık bilgisi.",
    );
  }
  if (textRatio < 2) {
    cikar -= 20;
    add(
      "cikarilabilirlik",
      "uyari",
      `Metin/kod oranı çok düşük (%${textRatio}) — ${htmlKb} KB HTML'in yalnızca ${textKb} KB'ı içerik`,
      "JS payload'unu küçültün (kod bölme, gereksiz inline data'yı temizleme); botun tarama bütçesi koda gidiyor.",
    );
  } else if (textRatio < 5) {
    cikar -= 8;
  }
  if (page.ttfbMs > 1800) {
    cikar -= 15;
    add(
      "cikarilabilirlik",
      "uyari",
      `İlk yanıt yavaş (${page.ttfbMs} ms)`,
      "Sayfayı önbelleğe alın (statik üretim/ISR/CDN cache); botlar yavaş sayfadan az sayfa tarar.",
    );
  } else if (page.ttfbMs > 900) {
    cikar -= 6;
  }
  if (a.imagesTotal > 0 && a.imagesWithAlt / a.imagesTotal < 0.7) {
    cikar -= 8;
    add(
      "cikarilabilirlik",
      "uyari",
      `Görsellerin yalnızca ${a.imagesWithAlt}/${a.imagesTotal}'i alt metinli`,
      "Tüm anlamlı görsellere açıklayıcı alt metni ekleyin.",
    );
  }
  if (page.redirects > 1) {
    cikar -= 6;
    add(
      "cikarilabilirlik",
      "bilgi",
      `${page.redirects} zincirleme yönlendirme`,
      "Ana adrese tek adımda 301 ile ulaşılmalı.",
    );
  }

  // Altyapı
  let altyapi = 100;
  if (!infra.robotsTxt) {
    altyapi -= 30;
    add(
      "altyapi",
      "uyari",
      "robots.txt bulunamadı",
      "robots.txt ekleyin ve AI botlarına açıkça izin verin.",
    );
  }
  if (!infra.sitemap) {
    altyapi -= 30;
    add("altyapi", "uyari", "sitemap.xml bulunamadı", "Sitemap üretin ve robots.txt'te ilan edin.");
  }
  if (!infra.llmsTxt) {
    altyapi -= 40;
    add(
      "altyapi",
      "uyari",
      "llms.txt yok — AI araçlarına site rehberi sunulmuyor",
      "Site içeriğini özetleyen /llms.txt (ve tercihen /llms-full.txt) yayınlayın.",
    );
  } else if (!infra.llmsFullTxt) {
    altyapi -= 10;
  }

  // Anlam katmanı
  let anlam = 100;
  if (a.jsonLdBlocks === 0) {
    anlam -= 45;
    add(
      "anlam",
      "kritik",
      "JSON-LD yapılandırılmış veri yok",
      "Organization + WebSite şemasıyla başlayın; hizmet/ürün sayfalarına uygun tipleri ekleyin.",
    );
  } else {
    if (!a.hasIds) {
      anlam -= 15;
      add(
        "anlam",
        "uyari",
        "JSON-LD düğümleri @id ile birbirine bağlanmamış",
        "Şema düğümlerine @id verip birbirine referansla bağlayın (bilgi grafiği kurun).",
      );
    }
    if (!a.hasSameAs) {
      anlam -= 15;
      add(
        "anlam",
        "uyari",
        "sameAs ile dış otoritelere (sosyal profiller, dizinler) çapa atılmamış",
        "Organization şemasına sosyal medya ve dizin profillerinizi sameAs olarak ekleyin.",
      );
    }
  }
  if (!a.metaDescription) {
    anlam -= 10;
    add(
      "anlam",
      "uyari",
      "Meta description eksik/çok kısa",
      "155 karakteri hedefleyen özgün açıklama yazın.",
    );
  }
  if (!a.ogTags) anlam -= 8;
  if (!a.canonical) anlam -= 7;
  if (!a.title) {
    anlam -= 10;
    add(
      "anlam",
      "kritik",
      "Sayfa başlığı (title) yok",
      "Marka + değer önerisini içeren title ekleyin.",
    );
  }

  // Alıntılanabilirlik
  let alinti = 100;
  if (a.h1 === 0) {
    alinti -= 20;
    add(
      "alintilanabilirlik",
      "uyari",
      "H1 başlığı yok",
      "Sayfanın ana iddiasını tek H1'de netleştirin.",
    );
  }
  if (a.headings < 4) {
    alinti -= 15;
    add(
      "alintilanabilirlik",
      "uyari",
      `Başlık hiyerarşisi zayıf (${a.headings} başlık)`,
      "İçeriği soru formunda H2/H3 başlıklarla bölümleyin.",
    );
  }
  if (a.quotableSections < 2) {
    alinti -= 30;
    add(
      "alintilanabilirlik",
      "uyari",
      "Başlık altında kendi kendine yeten pasaj az — cevap motoru alıntılayacak blok bulamıyor",
      "Her başlığın hemen altına 2-3 cümlelik, bağlamsız da anlaşılan net bir cevap paragrafı yazın.",
    );
  } else if (a.quotableSections < 4) {
    alinti -= 12;
  }
  if (a.brandMentions === 0 && a.wordCount > 50) {
    alinti -= 15;
    add(
      "alintilanabilirlik",
      "uyari",
      "Marka adı sayfa metninde geçmiyor",
      "Bölüm metinlerinde marka adını doğal biçimde kullanın; parça tek başına okunduğunda kime ait olduğu anlaşılsın.",
    );
  }
  if (a.firstParagraphChars < 80) alinti -= 10;

  const katmanlar: LayerScore[] = (
    [
      ["erisim", erisim],
      ["cikarilabilirlik", cikar],
      ["altyapi", altyapi],
      ["anlam", anlam],
      ["alintilanabilirlik", alinti],
    ] as const
  ).map(([key, puan]) => ({
    key,
    puan: clamp(puan),
    agirlik: LAYER_WEIGHTS[key],
    ozet: layerSummary(key, clamp(puan)),
    bulgular: bulgular.filter((b) => b.katman === key),
  }));

  const skor = Math.round(katmanlar.reduce((acc, k) => acc + k.puan * k.agirlik, 0) / 100);

  const result: ScanResult = {
    inputUrl,
    finalUrl: page.finalUrl,
    hostname: url.hostname,
    fetchedAt: new Date().toISOString(),
    skor,
    not: grade(skor),
    ozet: overallSummary(skor, bulgular),
    katmanlar,
    metrics,
    bots,
    infra,
    semantics,
    tech,
    prompt: buildPrompt(page.finalUrl, tech.framework, bulgular),
  };
  return result;
}

function toBotCheck(
  bot: string,
  f: FetchOutcome,
  robotsTxt: string | null,
  browserPage: FetchOutcome,
): BotCheck {
  const robotsAllowed = robotsTxt ? isPathAllowed(robotsTxt, bot) : null;
  let sonuc: BotCheck["sonuc"];
  if (f.status === null) sonuc = "hata";
  else if (f.status === 403 || f.status === 451 || f.status === 429 || f.status >= 500)
    sonuc = "engelli";
  else if (browserPage.bytes > 0 && f.bytes > 0 && f.bytes < browserPage.bytes * 0.3)
    sonuc = "farkli";
  else if (f.status >= 200 && f.status < 400) sonuc = "gecti";
  else sonuc = "engelli";
  if (robotsAllowed === false && sonuc === "gecti") sonuc = "farkli"; // robots hayır diyor ama sunucu açık — tutarsızlık
  return { bot, robotsAllowed, status: f.status, bytes: f.bytes || null, sonuc };
}

function isPlainText(f: FetchOutcome): boolean {
  const ct = f.headers["content-type"] ?? "";
  if (/text\/html/i.test(ct)) return false; // SPA 200 fallback tuzağı
  return Boolean(f.body && f.body.trim().length > 20 && !/^\s*</.test(f.body));
}

function layerSummary(key: LayerKey, puan: number): string {
  const iyi: Record<LayerKey, string> = {
    erisim: "Botlar kapıdan giriyor; kural dosyası ile sunucu davranışı tutarlı.",
    cikarilabilirlik: "İçerik JS'siz de okunuyor; bot gerçek metne ulaşıyor.",
    altyapi: "robots, sitemap ve llms.txt yerli yerinde.",
    anlam: "Yapılandırılmış veri grafiği kurulu.",
    alintilanabilirlik: "Cevap motorunun alıntılayabileceği net pasajlar var.",
  };
  const orta: Record<LayerKey, string> = {
    erisim: "Botların çoğu giriyor ama tutarsızlıklar var.",
    cikarilabilirlik: "İçerik okunuyor ama gereksiz ağırlık ya da kısmi engeller var.",
    altyapi: "Temel dosyalar var ama AI katmanı eksik.",
    anlam: "Yapılandırılmış veri var ama grafiği tamamlanmamış.",
    alintilanabilirlik: "Alıntılanabilir yapı kısmen kurulu.",
  };
  const kotu: Record<LayerKey, string> = {
    erisim: "AI botları içeri giremiyor — görünürlüğün önünde duvar var.",
    cikarilabilirlik: "Bot sayfadan anlamlı metin çıkaramıyor.",
    altyapi: "Tarama altyapısı dosyaları eksik.",
    anlam: "Makineye sitenin ne olduğu anlatılmamış.",
    alintilanabilirlik: "Cevap motorunun kullanabileceği pasaj yok.",
  };
  return puan >= 85 ? iyi[key] : puan >= 55 ? orta[key] : kotu[key];
}

function overallSummary(skor: number, bulgular: Finding[]): string {
  const kritik = bulgular.filter((b) => b.onem === "kritik").length;
  if (skor >= 85)
    return "Siteniz yapay zekâ tarayıcıları için büyük ölçüde hazır; kalanlar ince ayar.";
  if (skor >= 65)
    return kritik
      ? "Temel iyi ama kritik eksikler AI görünürlüğünüzü sınırlıyor."
      : "Ortalamanın üzerindesiniz; birkaç hamleyle üst lige çıkabilirsiniz.";
  if (skor >= 40)
    return "AI asistanları sitenizi kısmen görüyor — rakipleriniz cevaplarda sizin yerinizi alıyor olabilir.";
  return "Siteniz yapay zekâ cevaplarında neredeyse görünmez durumda; yapısal müdahale gerekiyor.";
}

function grade(skor: number): string {
  if (skor >= 90) return "A+";
  if (skor >= 80) return "A";
  if (skor >= 70) return "B";
  if (skor >= 55) return "C";
  if (skor >= 40) return "D";
  return "E";
}

function buildPrompt(url: string, framework: string | null, bulgular: Finding[]): string {
  const isler = bulgular
    .filter((b) => b.onem !== "bilgi")
    .sort((x, y) => (x.onem === "kritik" ? -1 : 1) - (y.onem === "kritik" ? -1 : 1))
    .map(
      (b, i) =>
        `${i + 1}. [${b.onem === "kritik" ? "KRİTİK" : "UYARI"}] ${b.mesaj}\n   Yapılacak: ${b.cozum}`,
    );
  if (!isler.length) return "";
  return [
    `Web sitem: ${url}${framework ? ` (${framework})` : ""}`,
    "",
    "Aşağıdaki AI görünürlük (GEO) bulgularını sitemde düzelt. Her maddeyi uygula, uygulayamadığını nedeniyle raporla:",
    "",
    ...isler,
    "",
    "Kaynak: Kırmızı Erik AI Görünürlük Taraması — kirmizierik.com.tr/ai-gorunurluk",
  ].join("\n");
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}
function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
