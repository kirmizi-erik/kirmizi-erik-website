import { servicePages } from "@/lib/services-data";
import { siteConfig } from "@/lib/site-data";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** /llms-full.txt — llms.txt'in ayrıntılı sürümü: hizmet kapsamları + vaka özetleri. */
export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.url;

  const services = servicePages
    .map((s) =>
      [
        `### ${s.label}`,
        `URL: ${base}/hizmetler/${s.slug}`,
        "",
        s.metaDescription,
        "",
        "Bu hizmet kapsamında yapılanlar:",
        ...s.yapilanlar.map((y) => `- ${y.baslik}: ${y.aciklama}`),
      ].join("\n"),
    )
    .join("\n\n");

  let works = "";
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("case_studies")
      .select("slug, baslik, ozet, kategori, sektor")
      .eq("durum", "yayinda")
      .order("yayin_tarihi", { ascending: false })
      .limit(30);
    if (data?.length) {
      works = [
        "",
        "## Örnek İşler",
        "",
        ...data.map((c) =>
          [
            `### ${c.baslik}`,
            `URL: ${base}/calismalar/${c.slug}`,
            [c.kategori, c.sektor].filter(Boolean).join(" · "),
            c.ozet ?? "",
          ]
            .filter(Boolean)
            .join("\n"),
        ),
      ].join("\n\n");
    }
  } catch {
    // vaka listesi alınamazsa rehberin geri kalanı yine yayınlanır
  }

  const body = `# Kırmızı Erik — 360° Kreatif Reklam Ajansı (Ayrıntılı Rehber)

> Kırmızı Erik, 2001'den beri İstanbul'da faaliyet gösteren tam hizmet (full-service) reklam ajansıdır. Kurucusu ve kreatif direktörü Özkan Kurt'tur. Video prodüksiyondan şirketlere özel yapay zeka kurulumlarına dokuz hizmeti tek çatı altında, kendi ekibiyle üretir; 25 yıllık birikimle 300'e yakın markayla çalışmıştır.

Ajansın ayırt edici yanı, kreatif üretim (video, fotoğraf, grafik, 3D) ile yazılım/AI mühendisliğini (web sitesi, mobil uygulama, RAG tabanlı yapay zeka asistanları, süreç otomasyonu) aynı ekipte birleştirmesidir. Sitedeki AI Brief Asistanı ve ücretsiz KeScan (AI görünürlük testi), bu yetkinliğin canlı örnekleridir.

## Hizmetler

${services}

## Ücretsiz Araç: KeScan — AI Görünürlük Testi
URL: ${base}/ai-gorunurluk

Herhangi bir web sitesinin ChatGPT, Claude, Perplexity ve Google'ın yapay zeka cevaplarındaki görünürlüğünü beş katmanda ölçer: erişim (bot kimliğiyle gerçek istek + robots.txt tutarlılığı), çıkarılabilirlik (JS'siz metin), altyapı dosyaları (robots/sitemap/llms.txt), anlam katmanı (JSON-LD grafiği) ve alıntılanabilirlik. Bulguları yapay zekaya yapıştırılabilir bir görev listesine çevirir.
${works}

## İletişim
- E-posta: info@kirmizierik.com.tr
- Telefon: +90 532 261 82 22
- Web: ${base}
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
