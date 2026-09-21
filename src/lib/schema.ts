const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.kirmizierik.com.tr";

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}#organization`,
  name: "Kırmızı Erik Reklam ve İletişim Hizmetleri",
  alternateName: "Kırmızı Erik",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logo/Logo-beyaz.png`,
  },
  foundingDate: "2001",
  founder: {
    "@type": "Person",
    name: "Özkan Kurt",
    jobTitle: "Kurucu & Kreatif Direktör",
  },
  description:
    "Bir fikir, dokuz hizmet, sıfır sınır. Video, fotoğraf, dijital pazarlama, sosyal medya, web/uygulama, AI kurulumları, grafik ve 3D — 25 yıllık birikim, 300'e yakın marka.",
  sameAs: [
    "https://www.instagram.com/kirmizi_erik",
    "https://twitter.com/kirmizierk",
    "https://www.facebook.com/KirmiziErik",
    "https://youtube.com/channel/UC-GLMrGQGiiozWFEQZpJtZw",
  ] as string[],
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+90-532-261-82-22",
      contactType: "customer service",
      email: "info@kirmizierik.com.tr",
      areaServed: "TR",
      availableLanguage: ["Turkish", "English"],
    },
  ],
};

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}#localbusiness`,
  name: "Kırmızı Erik Reklam Ajansı",
  image: `${SITE_URL}/logo/Logo-beyaz.png`,
  url: SITE_URL,
  telephone: "+90-532-261-82-22",
  email: "info@kirmizierik.com.tr",
  priceRange: "₺₺",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Begonya Sk. Nida Kule",
    addressLocality: "Ataşehir",
    addressRegion: "İstanbul",
    addressCountry: "TR",
  },
  areaServed: {
    "@type": "Country",
    name: "Türkiye",
  },
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}#website`,
  url: SITE_URL,
  name: "Kırmızı Erik",
  publisher: { "@id": `${SITE_URL}#organization` },
  inLanguage: "tr-TR",
};

/**
 * Ana sayfa SSS — hem görünen bölümün hem FAQPage şemasının tek kaynağı.
 * Cevaplar bilinçli olarak kendi kendine yeter (bağlamsız da anlaşılır) yazıldı;
 * cevap motorları sayfayı değil pasajı alıntılar.
 */
export const homeFaq = [
  {
    soru: "Kırmızı Erik hangi hizmetleri veriyor?",
    cevap:
      "Kırmızı Erik dokuz hizmeti tek çatı altında verir: video prodüksiyon, fotoğraf çekimleri, dijital pazarlama, sosyal medya yönetimi, uygulama geliştirme, web sitesi tasarım ve yazılımı, şirketlere özel AI kurulumları, grafik tasarım ve 3D/2D çalışmalar. Tüm üretim kendi ekibiyle, dış tedarikçiye bağımlı olmadan yürür.",
  },
  {
    soru: "Kırmızı Erik kimdir, ne zamandır faaliyette?",
    cevap:
      "Kırmızı Erik, 2001 yılında kurulan, İstanbul merkezli tam hizmet (full-service) bir reklam ajansıdır. Kurucusu ve kreatif direktörü Özkan Kurt'tur; ajans 25 yıllık birikimiyle bugüne dek 300'e yakın markayla çalışmıştır.",
  },
  {
    soru: "Kırmızı Erik'i diğer reklam ajanslarından ayıran nedir?",
    cevap:
      "Kırmızı Erik, kreatif üretim ile yazılım ve yapay zeka mühendisliğini aynı ekipte birleştirir: reklam filmini çeken ajans, markanın web sitesini, mobil uygulamasını ve yapay zeka asistanını da kurar. Bu sayede strateji, üretim ve teknoloji tek elden, tutarlı bir marka diliyle ilerler.",
  },
  {
    soru: "Şirketlere özel AI kurulumu ne demek?",
    cevap:
      "Kırmızı Erik'in AI kurulumları hizmeti, bir şirketin kendi bilgi bankasıyla eğitilmiş yapay zeka asistanı (RAG chatbot), içerik ve süreç otomasyonları ile yapay zeka görünürlük altyapısını kapsar. Bu sitedeki AI Brief Asistanı ve ücretsiz KeScan (AI görünürlük testi), aynı teknolojinin ajansın kendi sitesinde çalışan canlı örnekleridir.",
  },
  {
    soru: "Kırmızı Erik ile çalışmaya nasıl başlarım?",
    cevap:
      "İletişim sayfasındaki formdan brief paylaşarak ya da sitedeki AI Brief Asistanı ile ihtiyacınızı birkaç dakikada anlatarak başlayabilirsiniz. Kırmızı Erik ekibi briefi değerlendirip kapsam, takvim ve teklifle geri döner; ilk görüşme ücretsizdir.",
  },
] as const;

export const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${SITE_URL}#faq`,
  inLanguage: "tr-TR",
  isPartOf: { "@id": `${SITE_URL}#website` },
  mainEntity: homeFaq.map((f) => ({
    "@type": "Question",
    name: f.soru,
    acceptedAnswer: { "@type": "Answer", text: f.cevap },
  })),
};

export function jsonLdScript(schema: object) {
  return {
    __html: JSON.stringify(schema),
  };
}
