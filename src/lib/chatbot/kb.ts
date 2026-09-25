import "server-only";

import { servicePages } from "@/lib/services-data";

import { chatbotDb } from "./db";

export type KbDoc = {
  title: string;
  content: string;
  sourceUrl: string | null;
  authority: number;
  embedText?: string;
};

// System prompt'tan bilgi bankasına taşınan firma bilgileri.
// "## " başlıklı her bölüm ayrı chunk olur.
const FIRMA_GENEL = `## Tarihçe & Rakamlar
Kırmızı Erik 2001'de İstanbul'da 4 arkadaş tarafından kuruldu — YouTube henüz yokken, reklam dijitalleşmenin başındayken. 25 yılda binlerce proje tamamladık, 300'e yakın marka ile çalıştık, 6 ülkede hizmet verdik. Google Dijital Pazarlama Ödülleri ve üniversite ödülleri sahibiyiz.
İsmin hikâyesi: Reklam tarlasında dijitalin ilk filiz verdiği yıllarda yetişen taze, kırmızı bir erik. Erik = tazelik / dinamizm, Kırmızı = enerji / cesaret.

## Özkan Kurt (Kurucu / Ajans Başkanı)
2001'de Kırmızı Erik'i kuran 4 arkadaştan biri; bugün ajansı tek başına yönetiyor. Her brief için o işe özel uzman ekip kurulur — kreatif yönetmen, prodüksiyon, dijital, yazılım rolleri. 25 yıllık reklam ajansı ve kreatif direktörlük tecrübesi. Yazılım ve yeni teknolojileri yakından takip eder; YouTube'dan AI'ya her dalgayı erken denedi. Konsept odaklı, "satan iş" peşinde; brief'i derinlemesine sorgulamayı tercih eder, hazır şablon iş yapmaz. Detay için /biz-kimiz sayfası.

## Neden Kırmızı Erik (Duruşumuz / Manifesto)
1. Tek çatı, tek brief — çekim/dijital/yazılım üçü aynı ekiple, müşteri 3 ajansla koordinasyona girmez.
2. Ödüllü iş güzeldir, satan iş şarttır — kreatifte cesur, ROI'da net.
3. AI'da deneyimli — "bu yıl AI yılı" demiyoruz, 5 yıldır kuruyoruz.
4. İhale değil iş ortağı — brief alıp kaybolmuyoruz, ~300 markayla yıllarca yan yana yürüdük.
5. Sürpriz fatura yok — süreç şeffaf, fiyat net, gizli kalem yok.

## Çalışma Sürecimiz (5 aşama)
1. Brief & Keşif — markayı, hedefi, takvimi anlama. 2. Strateji & Konsept — önce 'neden', sonra 'nasıl'. 3. Kreatif & Üretim — çekim/tasarım/kod aynı çatı altında. 4. Test & Onay — ara mockup, prototip, A/B. 5. Lansman & Ölçüm — yayında biten iş yoktur, performans takibi yapılır.

## İletişim & Ofis
Ofis: İstanbul (Begonya Sk. Nida Kule, Ataşehir). Marmaris veya başka şehirde ofis yok, sadece İstanbul. E-posta: info@kirmizierik.com.tr. Telefon: +90 532 261 82 22 (mobil) veya +90 216 510 70 45 (sabit). Web: kirmizierik.com.tr. İletişim formu: /iletisim sayfası.

## Fiyatlandırma Yaklaşımı ve Tahminî Süreler
Fiyat verilmez: her projenin fiyatı kapsama göre belirlenir; iş türü, hedef ve takvim netleşmeden rakam paylaşılmaz. Ziyaretçi fiyat sorarsa detayları almak için iletişim formuna yönlendirilir, ekip aynı gün döner.
Tahminî süreler: video prodüksiyon 2-6 hafta, web sitesi 4-8 hafta, AI kurulumu 4-6 hafta (kapsama göre değişir).

## Referanslar
300'e yakın marka ile çalıştık; kamuya açık referanslardan bazıları: Novawood, Atlantis, Forma Makina. Referans/örnek iş isteyenlere yayındaki çalışmaların linki verilir; tüm portföy /calismalar sayfasında. Müşterilerin finansal/özel detayları paylaşılmaz.

## AI Kurulumları (vurgu hizmet)
AI Kurulumları vurgu hizmetimizdir — sitedeki bu sohbet asistanı bizim canlı demomuz; aynısını (RAG bilgi bankalı, panelden eğitilebilir chatbot) müşteriler için de kuruyoruz. Detay: /hizmetler/ai`;

function splitSections(doc: string): Array<{ title: string; content: string }> {
  return doc
    .split(/\n(?=## )/)
    .map((block) => {
      const lines = block.trim().split("\n");
      const title = (lines[0] ?? "").replace(/^##\s*/, "").trim();
      const content = lines.slice(1).join("\n").trim();
      return { title, content };
    })
    .filter((s) => s.content.length > 0);
}

/**
 * Site korpusu — sitenin TAMAMI:
 * - firma-genel bölümleri (statik)
 * - 9 hizmet sayfasının tam içeriği (services-data.ts)
 * - yayındaki tüm çalışmalar/referanslar (case_studies tablosu, linkli)
 * Site içeriği değişince /api/chatbot-admin/reingest ile yeniden indekslenir.
 */
export async function buildSiteDocs(): Promise<KbDoc[]> {
  const docs: KbDoc[] = [];

  for (const section of splitSections(FIRMA_GENEL)) {
    docs.push({
      title: `Kırmızı Erik — ${section.title}`,
      content: section.content,
      sourceUrl: null,
      authority: 2,
    });
  }

  // Hizmet sayfaları — tam içerik (kart açıklamaları dahil)
  for (const s of servicePages) {
    const yapilanlar = s.yapilanlar.map((y) => `${y.baslik}: ${y.aciklama}`).join("\n");
    const surec = s.surec.map((step) => step.baslik).join(" → ");
    const stack = s.stack.map((g) => `${g.label}: ${g.items.join(", ")}`).join(" | ");

    docs.push({
      title: `Hizmet: ${s.label}`,
      content:
        `${s.heroSubtitle}\n\nKapsam:\n${yapilanlar}\n\nSüreç: ${surec}\nStack/Araç: ${stack}`.slice(
          0,
          3500,
        ),
      sourceUrl: `/hizmetler/${s.slug}`,
      authority: 2,
      embedText: `${s.label} | ${s.slug} | ${s.heroSubtitle} | ${s.yapilanlar
        .map((y) => y.baslik)
        .join(" · ")}`,
    });
  }

  // Yayındaki çalışmalar (referanslar) — DB'den, her biri kendi linkiyle
  try {
    const db = chatbotDb();
    const { data: cases, error } = await db
      .from("case_studies")
      .select("baslik, slug, musteri_adi, sektor, kategori, ozet, aciklama")
      .eq("durum", "yayinda")
      .order("yayin_tarihi", { ascending: false });

    if (!error && cases && cases.length > 0) {
      docs.push({
        title: "Referans Listesi (Yayındaki Çalışmalar)",
        content: `Örnek işlerimizden bazıları:\n${cases
          .map(
            (c) =>
              `- ${c.baslik}${c.musteri_adi ? ` (${c.musteri_adi})` : ""}: /calismalar/${c.slug}`,
          )
          .join("\n")}\nTüm portföy: /calismalar`,
        sourceUrl: "/calismalar",
        authority: 2,
        embedText: `referans örnek iş portföy çalışma müşteri | ${cases
          .map((c) => `${c.baslik} ${c.musteri_adi ?? ""}`)
          .join(" | ")}`,
      });

      for (const c of cases) {
        const parts = [
          c.musteri_adi ? `Müşteri: ${c.musteri_adi}` : null,
          c.sektor ? `Sektör: ${c.sektor}` : null,
          Array.isArray(c.kategori) && c.kategori.length > 0
            ? `Kategori: ${c.kategori.join(", ")}`
            : null,
          c.ozet,
          c.aciklama,
        ].filter(Boolean);
        docs.push({
          title: `Çalışma: ${c.baslik}`,
          content: parts.join("\n").slice(0, 2500) || c.baslik,
          sourceUrl: `/calismalar/${c.slug}`,
          authority: 3,
          embedText: `${c.baslik} | ${c.musteri_adi ?? ""} | ${c.sektor ?? ""} | ${c.ozet ?? ""}`,
        });
      }
    }
  } catch (e) {
    console.warn("[kb] çalışmalar okunamadı, statik korpusla devam:", e);
  }

  // Yayındaki blog yazıları — ## bölümleri ayrı parça, her biri yazının linkiyle
  try {
    const db = chatbotDb();
    const { data: posts, error } = await db
      .from("blog_posts")
      .select("baslik, slug, ozet, icerik")
      .eq("durum", "yayinda");

    if (!error && posts) {
      for (const p of posts) {
        const sections = splitSections(`## Giriş\n${p.ozet ?? ""}\n${p.icerik}`);
        for (const section of sections) {
          docs.push({
            title: `Blog: ${p.baslik} — ${section.title}`,
            content: section.content.slice(0, 2500),
            sourceUrl: `/blog/${p.slug}`,
            authority: 2,
          });
        }
      }
    }
  } catch (e) {
    console.warn("[kb] blog okunamadı, statik korpusla devam:", e);
  }

  return docs;
}
