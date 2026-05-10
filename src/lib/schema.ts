const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.kirmizierik.com.tr";

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
  sameAs: [] as string[],
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

export function jsonLdScript(schema: object) {
  return {
    __html: JSON.stringify(schema),
  };
}
