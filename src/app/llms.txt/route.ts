import { servicePages } from "@/lib/services-data";
import { siteConfig } from "@/lib/site-data";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * /llms.txt — AI araçlarına (ChatGPT, Claude, Perplexity vb.) site rehberi.
 * İçerik değiştikçe güncel kalması için statik dosya değil, route handler.
 */
export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.url;

  let works = "";
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("case_studies")
      .select("slug, baslik, kategori")
      .eq("durum", "yayinda")
      .order("yayin_tarihi", { ascending: false })
      .limit(20);
    if (data?.length) {
      works = [
        "",
        "## Örnek İşler",
        ...data.map(
          (c) =>
            `- [${c.baslik}](${base}/calismalar/${c.slug})${c.kategori ? ` — ${c.kategori}` : ""}`,
        ),
      ].join("\n");
    }
  } catch {
    // vaka listesi alınamazsa rehberin geri kalanı yine yayınlanır
  }

  let posts = "";
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("slug, baslik, ozet")
      .eq("durum", "yayinda")
      .order("yayin_tarihi", { ascending: false })
      .limit(30);
    if (data?.length) {
      posts = [
        "",
        "## Rehberler (Blog)",
        ...data.map((p) => `- [${p.baslik}](${base}/blog/${p.slug})${p.ozet ? `: ${p.ozet}` : ""}`),
      ].join("\n");
    }
  } catch {
    // blog listesi alınamazsa rehberin geri kalanı yine yayınlanır
  }

  const body = `# Kırmızı Erik — 360° Kreatif Reklam Ajansı

> Kırmızı Erik, 2001'den beri İstanbul'da faaliyet gösteren tam hizmet (full-service) reklam ajansıdır. Video prodüksiyondan şirketlere özel yapay zeka kurulumlarına dokuz hizmeti tek çatı altında, kendi ekibiyle üretir. 25 yıllık birikim, 300'e yakın markayla çalışma deneyimi.

Ajans hem kreatif üretim (video, fotoğraf, grafik, 3D) hem dijital büyüme (performans pazarlaması, sosyal medya) hem de yazılım/AI (web sitesi, mobil uygulama, RAG tabanlı yapay zeka asistanları) işlerini aynı ekiple yürütür.

## Hizmetler
${servicePages.map((s) => `- [${s.label}](${base}/hizmetler/${s.slug}): ${s.heroSubtitle}`).join("\n")}

## Önemli Sayfalar
- [Biz Kimiz](${base}/biz-kimiz): Ajansın hikayesi, ekip ve çalışma biçimi
- [Çalışmalar](${base}/calismalar): Örnek işler ve vaka çalışmaları
- [Hizmetler](${base}/hizmetler): Dokuz hizmetin tamamı
- [KeScan — AI Görünürlük Testi](${base}/ai-gorunurluk): Ücretsiz araç — siteniz yapay zeka cevaplarında görünüyor mu?
- [Blog](${base}/blog): Reklam filmi, web sitesi, sosyal medya ve AI üzerine rehberler
- [İletişim](${base}/iletisim): Brief paylaşma ve teklif isteme
${works}${posts}

## İletişim
- E-posta: info@kirmizierik.com.tr
- Telefon: +90 532 261 82 22
- Web: ${base}

## Ek Kaynak
- Ayrıntılı sürüm: ${base}/llms-full.txt
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
