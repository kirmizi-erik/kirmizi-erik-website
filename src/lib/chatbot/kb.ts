import "server-only";

import { servicePages } from "@/lib/services-data";

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

## Fiyat Aralıkları ve Süreler (tahminî)
Net fiyat proje kapsamına göre belirlenir; aşağıdakiler gevşek aralıklardır.
Sosyal medya yönetimi: aylık 15-50K ₺ (paket büyüklüğüne göre). Video prodüksiyon: 30K-300K ₺ (basit ürün çekimi → premium reklam filmi). Web sitesi: 50K-500K ₺ (tek sayfa landing → e-ticaret + admin panel). AI Kurulumu: 80K-500K ₺ (basit chatbot → kompleks entegrasyon).
Tipik süreler: video 2-6 hafta, web sitesi 4-8 hafta, AI kurulumu 4-6 hafta.

## Referanslar
Kamuya açık referanslardan bazıları: Novawood, Atlantis, Forma Makina. 300'e yakın marka ile çalıştık; detaylı işler /calismalar sayfasında. Müşterilerin finansal/özel detayları paylaşılmaz.

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
 * Site korpusu: firma-genel bölümleri + 9 hizmet (her hizmet atomik chunk).
 * Kaynak tek: services-data.ts — site içeriği değişince /api/chatbot-admin/reingest
 * ile yeniden indekslenir (rebuild gerekmez).
 */
export function buildSiteDocs(): KbDoc[] {
  const docs: KbDoc[] = [];

  for (const section of splitSections(FIRMA_GENEL)) {
    docs.push({
      title: `Kırmızı Erik — ${section.title}`,
      content: section.content,
      sourceUrl: null,
      authority: 2,
    });
  }

  for (const s of servicePages) {
    const yapilanlar = s.yapilanlar.map((y) => y.baslik).join(" · ");
    const surec = s.surec.map((step) => step.baslik).join(" → ");
    const stack = s.stack.map((g) => `${g.label}: ${g.items.slice(0, 3).join(", ")}`).join(" | ");

    docs.push({
      title: `Hizmet: ${s.label}`,
      content: `Kapsam: ${yapilanlar}\nSüreç: ${surec}\nStack/Araç: ${stack}\nAçıklama: ${s.heroSubtitle}`,
      sourceUrl: `/hizmetler/${s.slug}`,
      authority: 2,
      embedText: `${s.label} | ${s.slug} | ${s.heroSubtitle} | ${yapilanlar}`,
    });
  }

  return docs;
}
