type Redirect = { source: string; destination: string; permanent: boolean };

// Eski WordPress sitesinin (2016–2025) Google'da indeksli / dış link alan adresleri.
// Kaynak: Wayback Machine CDX listesi. Görsel ek sayfaları (/bg21, /africa-boy …)
// bilinçli olarak yönlendirilmez — SEO değerleri yok, 404 ile indeksten düşerler.
// /blog bilinçli olarak yok: yeni blog o adreste yayınlanacak.
// Sıra önemli: özel eşleşmeler, aynı önekli genel :path* kuralından önce gelir.

const HIZMET = {
  video: "/hizmetler/video-produksiyon",
  fotograf: "/hizmetler/fotograf-cekimleri",
  dijital: "/hizmetler/dijital-pazarlama",
  sosyal: "/hizmetler/sosyal-medya-yonetimi",
  web: "/hizmetler/web-tasarim-yazilim",
  grafik: "/hizmetler/grafik-tasarim",
  ucd: "/hizmetler/3d-2d-calismalar",
} as const;

const exact: [string, string][] = [
  // Kurumsal
  ["/hakkimizda/referanslar", "/calismalar"],
  ["/hakkimizda/fotograf-cekimi", HIZMET.fotograf],
  ["/about", "/biz-kimiz"],
  ["/contact-us-2", "/iletisim"],
  ["/gizlilik-politikasi-2", "/gizlilik"],

  // Eski hizmet sayfaları
  ["/hizmetlerimiz/3d-animator", HIZMET.ucd],
  ["/hizmetlerimiz/adwords", HIZMET.dijital],
  ["/hizmetlerimiz/seo", HIZMET.dijital],
  ["/hizmetlerimiz/icerik-yonetimi-2", HIZMET.web],
  ["/hizmetlerimiz/social", HIZMET.sosyal],
  ["/hizmetlerimiz/social-2", HIZMET.sosyal],
  ["/hizmetlerimiz/social-3", HIZMET.sosyal],
  ["/adwords.html", HIZMET.dijital],
  ["/analiz.html", "/ai-gorunurluk"],
  ["/moda-ve-reklam-fotografciligi", HIZMET.fotograf],

  // Portfolyo → yeni çalışma detayları
  ["/portfolio-item/atilgan-royal", "/calismalar/atilgan-royal-i-zmir"],
  ["/portfolio-item/dendro-parke", "/calismalar/dendro-parke"],
  ["/portfolio-item/forma-makina-a-s", "/calismalar/forma-makina-tanitim-filmi"],
  ["/portfolio-item/novawood-showreel", "/calismalar/novawood-showreel-eng"],
  ["/portfolio-item/sozer-a-s-tanitim-filmi", "/calismalar/sozer-kuyumculuk-san-tic-a-s"],
  ["/portfolio-item/sozer-a-s-tanitim-filmi-copy", "/calismalar/sozer-kuyumculuk-san-tic-a-s"],
  ["/novawood-tanitim-filmi", "/calismalar/novawood-showreel-eng"],
  ["/portfolio-item/kemal-ozcan-video-muzik-klibi", "/calismalar/muzik-klip"],
  ["/jquery", "/"],
  ["/neden-tanitim-filmi", HIZMET.video],
  ["/digiturk-kampanya", "/calismalar"],
  ["/kim-west", "/calismalar"],
  ["/winsell", "/calismalar"],
  ["/ilkem-turizm-ogrenci", "/calismalar"],
  ["/ilkem-turizm-personel-tasimaciligi", "/calismalar"],
  ["/etkinlik-mg", "/calismalar"],

  // Portfolyo kategori/etiket arşivleri → ilgili hizmet
  ["/portfolio-category/3d-2d-tasarim", HIZMET.ucd],
  ["/portfolio-category/motion-graphic", HIZMET.ucd],
  ["/portfolio-category/ambalaj-tasarimi", HIZMET.grafik],
  ["/portfolio-category/basili-isler", HIZMET.grafik],
  ["/portfolio-category/grafik-tasarim", HIZMET.grafik],
  ["/portfolio-category/reklam", HIZMET.video],
  ["/portfolio-category/video", HIZMET.video],
  ["/portfolio-category/video-produksiyon", HIZMET.video],
  ["/portfolio-category/sosyal-medya", HIZMET.sosyal],
  ["/portfolio-category/web-sitesi", HIZMET.web],
  ["/portfolio-tag/2d", HIZMET.ucd],
  ["/portfolio-tag/animasyon", HIZMET.ucd],
  ["/portfolio-tag/motion-graphic", HIZMET.ucd],
  ["/portfolio-tag/atilgan-royal", "/calismalar/atilgan-royal-i-zmir"],
  ["/portfolio-tag/basili-isler", HIZMET.grafik],
  ["/portfolio-tag/grafik-tasarim", HIZMET.grafik],
  ["/portfolio-tag/tasarim", HIZMET.grafik],
  ["/portfolio-tag/reklam-filmi", HIZMET.video],
  ["/portfolio-tag/video", HIZMET.video],
  ["/portfolio-tag/video-produksiyon", HIZMET.video],
  ["/portfolio-tag/sosyal-medya-yonetimi", HIZMET.sosyal],
  ["/portfolio-tag/web-sitesi", HIZMET.web],

  // Blog kategori/etiket arşivleri
  ["/kategori/fotografcilik", HIZMET.fotograf],
  ["/kategori/seo", HIZMET.dijital],
  ["/kategori/sosyal-medya", HIZMET.sosyal],
  ["/kategori/teknoloji", "/"],
  ["/kategori/news", "/"],
  ["/tag/seo", HIZMET.dijital],
  ["/tag/instagram", HIZMET.sosyal],
  ["/tag/yeni-instagram", HIZMET.sosyal],
  ["/tag/kirmizi-erik", "/biz-kimiz"],

  // Eski blog yazıları → konuya en yakın hizmet
  ["/2022/05/20/seo-icin-en-onemli-6-kural", HIZMET.dijital],
  ["/facebook-messenger-anket-ozelligi", HIZMET.sosyal],
  ["/facebook-satin-aldigi-faciometrics-ile-snapchate-meydan-okumaya-hazirlaniyor", HIZMET.sosyal],
  ["/instagram-reklam-veren-500-bin-isletme-profilleri-1-5-milyon", HIZMET.sosyal],
  ["/kafayataktik-avonun-meme-kanseri-ile-mucadele-projesine-yeni-bir-soluk", HIZMET.sosyal],
  ["/whatsappda-sonunda-dedirten-yenilik-video-gorusme-ozelligi", HIZMET.sosyal],
  ["/whatsapp-kamera-ve-fotograf-paylasimlarinda-snapchate-ozendi", HIZMET.sosyal],
  ["/snapchat-spectacles-10-saniye-video-gunes-gozlukleri", HIZMET.sosyal],
  ["/twitter-140-karakter", HIZMET.sosyal],
  ["/vinea-veda-vakti-geldi", HIZMET.sosyal],
  ["/youtube-offline-video-izleme-ve-paylasimi-icin-yeni-bir-uygulama-yayinladi", HIZMET.video],
  ["/iphone7-inceleme", "/"],
];

// Önek + tüm alt adresleri (WordPress ek sayfaları dahil) tek hedefe
const prefix: [string, string][] = [
  ["/hakkimizda", "/biz-kimiz"],
  ["/hizmetlerimiz", "/hizmetler"],
  ["/sosyal-medya-yonetimi", HIZMET.sosyal],
  ["/sosyal-medya", HIZMET.sosyal],
  ["/web-sitesi-tasarim", HIZMET.web],
  ["/content-management", HIZMET.web],
  ["/adwords", HIZMET.dijital],
  ["/video-produksiyon", HIZMET.video],
  ["/3d-animasyon", HIZMET.ucd],
  ["/basili-isler", HIZMET.grafik],
  ["/ambalaj-tasarimi", HIZMET.grafik],
  ["/atilgan-royal", "/calismalar/atilgan-royal-i-zmir"],
  ["/portfolio-item", "/calismalar"],
  ["/portfolio-category", "/calismalar"],
  ["/portfolio-tag", "/calismalar"],
  ["/portfolio-manager", "/calismalar"],
  ["/portfolio", "/calismalar"],
  ["/etiket", "/"],
  ["/kategori", "/"],
  ["/category", "/"],
  ["/tag", "/"],
  ["/author", "/biz-kimiz"],
  ["/2016", "/"],
  ["/2022", "/"],
];

export const legacyRedirects: Redirect[] = [
  ...exact.map(([source, destination]) => ({ source, destination, permanent: true })),
  // Önce önekin kendisi, sonra alt adresleri (":path+" boş eşleşmez)
  ...prefix.flatMap(([base, destination]) => [
    { source: base, destination, permanent: true },
    { source: `${base}/:path+`, destination, permanent: true },
  ]),
];
