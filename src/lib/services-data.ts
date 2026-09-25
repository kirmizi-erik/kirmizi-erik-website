import {
  Bot,
  Box,
  Briefcase,
  Camera,
  Database,
  FileText,
  Film,
  Globe,
  Headphones,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  LineChart,
  Megaphone,
  Mic,
  MonitorSmartphone,
  Music,
  Package,
  Palette,
  Plane,
  Search,
  ScanText,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Target,
  Type,
  Video,
  Wand2,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { HizmetGrup } from "./site-data";

export type ServiceCard = {
  icon: LucideIcon;
  baslik: string;
  aciklama: string;
};

export type ServiceProcessStep = {
  no: string;
  baslik: string;
  aciklama: string;
};

export type ServiceStackGroup = {
  label: string;
  items: string[];
};

export type ServicePanelShowcase = {
  baslik: string;
  altBaslik: string;
  aciklama: string;
  ozellikler: ServiceCard[];
  gorseller: { src: string; alt: string }[];
};

export type ServicePageData = {
  slug: string;
  label: string;
  // <title> için arama niyetli başlık (label sayfa içi kısa ad olarak kalır)
  seoTitle: string;
  grup: HizmetGrup;
  oneCikan?: boolean; // anasayfa Yazılım & AI sütununda yıldız (sadece AI)
  // Hero
  heroSubtitle: string;
  metaDescription: string;
  // Sayfa içeriği
  yapilanlarBaslik: string;
  yapilanlarAltBaslik: string;
  yapilanlar: ServiceCard[];
  surecBaslik: string;
  surecAltBaslik: string;
  surec: ServiceProcessStep[];
  stackBaslik: string;
  stackAltBaslik: string;
  stack: ServiceStackGroup[];
  panel?: ServicePanelShowcase;
  // Özel CTA (AI Kurulumları için canlı demo)
  customCta?: {
    rozet: string;
    baslik: string;
    aciklama: string;
  };
};

export const servicePages: ServicePageData[] = [
  // ──────────────────────────────────────────────────────────────────
  // 1. VIDEO PRODÜKSİYON
  // ──────────────────────────────────────────────────────────────────
  {
    slug: "video-produksiyon",
    label: "Video Prodüksiyon",
    seoTitle: "Video Prodüksiyon — Reklam ve Tanıtım Filmi",
    grup: "gorsel",
    heroSubtitle:
      "Reklam filminden ürün videosuna, sosyal medya içeriğinden müzik klibine — fikirden teslime tüm prodüksiyonu kendi ekibimizle yönetiriz.",
    metaDescription:
      "Kırmızı Erik Video Prodüksiyon — TV reklam filmi, kurumsal video, ürün çekimi, sosyal medya içeriği, müzik klibi. Konseptten post-prodüksiyona uçtan uca üretim.",
    yapilanlarBaslik: "Bir kamera değil,",
    yapilanlarAltBaslik: "bir hikaye anlatımı.",
    yapilanlar: [
      {
        icon: Film,
        baslik: "TV / Sinema Reklam Filmi",
        aciklama:
          "Markanın hikayesini büyük bütçeli yapımlarla anlatan, ölçülebilir hatırlanma değeri olan reklam filmleri.",
      },
      {
        icon: Briefcase,
        baslik: "Kurumsal Tanıtım Filmi",
        aciklama:
          "Şirketinin değerlerini, ekibini ve üretim süreçlerini profesyonel bir dille gösteren kurumsal videolar.",
      },
      {
        icon: Package,
        baslik: "Ürün Videosu / Demo",
        aciklama:
          "E-ticaret ve sunum için ürün özelliklerini net gösteren, dönüşüm odaklı kısa videolar.",
      },
      {
        icon: Smartphone,
        baslik: "Sosyal Medya İçeriği",
        aciklama:
          "Reels, TikTok, Story ve YouTube Shorts için dikey formatlarda, hızlı çekilen seri içerik üretimi.",
      },
      {
        icon: Music,
        baslik: "Müzik Klibi",
        aciklama:
          "Sanatçı vizyonunu görsel dile çeviren konseptli müzik klibi prodüksiyonu — yönetmenden post-produksiyon'a.",
      },
      {
        icon: Plane,
        baslik: "Hava Çekimi (Drone)",
        aciklama:
          "Lisanslı pilotlarla 4K/6K hava çekimi — tesis tanıtımı, mimari, etkinlik, doğa ve takip kamerası.",
      },
      {
        icon: Mic,
        baslik: "Belgesel ve Röportaj",
        aciklama:
          "Marka, ekip veya etkinlik belgesel formatı; uzun soluklu, derin anlatım gereken yapımlar.",
      },
    ],
    surecBaslik: "Beş aşama,",
    surecAltBaslik: "her sahne yerinde.",
    surec: [
      {
        no: "01",
        baslik: "Brief & Konsept",
        aciklama:
          "Markanın hedefleri, hedef kitle, dağıtım kanalları ve bütçe netleştirilir. 1-3 konsept yön sunulur.",
      },
      {
        no: "02",
        baslik: "Senaryo & Storyboard",
        aciklama:
          "Onaylanan konsept üzerinden senaryo yazılır, kare kare storyboard ile çekim planı çıkarılır.",
      },
      {
        no: "03",
        baslik: "Pre-Prodüksiyon",
        aciklama:
          "Lokasyon keşfi, casting, sanat yönetimi, stylist, ekip seçimi, izinler ve takvim.",
      },
      {
        no: "04",
        baslik: "Çekim",
        aciklama:
          "Yönetmen, DOP ve ekibimizle 1-5 günlük çekim. Marka temsilcisi sette aktif onay sürecinde.",
      },
      {
        no: "05",
        baslik: "Post-Prodüksiyon",
        aciklama:
          "Kurgu, renk düzenlemesi, ses tasarımı ve motion graphic. Birden fazla format export (TV, sosyal medya, YouTube).",
      },
    ],
    stackBaslik: "Donanım ve",
    stackAltBaslik: "iş akışı.",
    stack: [
      {
        label: "Kamera & Optik",
        items: [
          "Sony FX serisi, RED Komodo, Blackmagic 6K Pro",
          "Sigma Cine, Canon Cinema, Zeiss CP.3 lens setleri",
          "DJI Ronin gimbal, slider, jib",
          "DJI Mavic 3 Pro / Inspire — lisanslı drone pilotu",
        ],
      },
      {
        label: "Işık & Ses",
        items: [
          "Aputure 600c Pro, Quasar tüpler, HMI",
          "Sennheiser & Sanken mikrofonlar, Sound Devices kayıt",
        ],
      },
      {
        label: "Post-Prodüksiyon",
        items: [
          "DaVinci Resolve (renk + montaj)",
          "Premiere Pro + After Effects",
          "Pro Tools / Audition (ses)",
        ],
      },
      {
        label: "Ekip",
        items: [
          "Yönetmen",
          "DOP & 1. Asistan",
          "Sanat yönetmeni",
          "Ses + Işık",
          "Editör + Renk uzmanı",
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 2. FOTOĞRAF ÇEKİMLERİ
  // ──────────────────────────────────────────────────────────────────
  {
    slug: "fotograf-cekimleri",
    label: "Fotoğraf Çekimleri",
    seoTitle: "Ürün ve Kurumsal Fotoğraf Çekimi",
    grup: "gorsel",
    heroSubtitle:
      "Ürün katalogundan kurumsal portreye, mekan çekiminden lookbook'a — çekim öncesinde hazırlık, sırasında yönlendirme, sonrasında retouch.",
    metaDescription:
      "Kırmızı Erik Fotoğraf Çekimleri — ürün, kurumsal portre, mekan, etkinlik, lookbook, lifestyle. Stüdyo ve lokasyon çekimleri, profesyonel retouch.",
    yapilanlarBaslik: "Doğru kare,",
    yapilanlarAltBaslik: "doğru ışık.",
    yapilanlar: [
      {
        icon: ShoppingCart,
        baslik: "E-Ticaret Ürün Çekimi",
        aciklama:
          "Beyaz fonda standart e-ticaret çekimi + ürün hikayesini gösteren lifestyle açıları. Toplu paketlerde optimize fiyat.",
      },
      {
        icon: Sparkles,
        baslik: "Premium Ürün Çekimi",
        aciklama:
          "Cam, takı, kozmetik gibi premium ürünler için sanat yönetimi, set tasarımı, makro ve detay açıları.",
      },
      {
        icon: Briefcase,
        baslik: "Kurumsal Portre",
        aciklama:
          "CEO portresi, ekip foto­grafları, LinkedIn ve PR için tutarlı, modern portreler.",
      },
      {
        icon: Box,
        baslik: "Mekan ve Mimari",
        aciklama:
          "Restoran, ofis, otel, mağaza için iç ve dış mekan çekimi — ışık koşullarında uzmanlaşmış ekipman.",
      },
      {
        icon: Camera,
        baslik: "Etkinlik & PR",
        aciklama:
          "Lansman, kongre, konferans çekimleri — anlık paylaşım için aynı gün hızlı teslim seçeneği.",
      },
      {
        icon: ImageIcon,
        baslik: "Lookbook & Lifestyle",
        aciklama:
          "Moda, ev tekstili, mücevher için sezonluk lookbook çekimi. Stylist, model, lokasyon yönetimi dahil.",
      },
      {
        icon: Plane,
        baslik: "Hava Fotoğrafı (Drone)",
        aciklama:
          "Tesis, kampüs, otel, fabrika ve mimari için yüksek çözünürlüklü hava fotoğrafı — lisanslı pilot, izinler dahil.",
      },
    ],
    surecBaslik: "Beş aşama,",
    surecAltBaslik: "her kare onaylı.",
    surec: [
      {
        no: "01",
        baslik: "Brief & Mood Board",
        aciklama:
          "Marka tonu, kullanım alanı (web, basılı, sosyal medya), referans örnekler ve teknik gereksinimler netleştirilir.",
      },
      {
        no: "02",
        baslik: "Lokasyon & Kadro",
        aciklama:
          "Stüdyo veya lokasyon seçimi. Gerekirse model casting, stylist, makyöz ve sanat yönetmeni.",
      },
      {
        no: "03",
        baslik: "Çekim",
        aciklama:
          "1-3 günlük çekim. Marka temsilcisi onlinde veya sette anlık onay verir, kareler doğrulanır.",
      },
      {
        no: "04",
        baslik: "Seçim & Retouch",
        aciklama:
          "Çekim sonrası ön seçim — onaylanan kareler için renk, cilt, leke, kompozisyon retouch'u.",
      },
      {
        no: "05",
        baslik: "Final Teslim",
        aciklama:
          "Web ve baskı için ayrı boyutlarda, isimlendirilmiş, organize klasör yapısında teslim.",
      },
    ],
    stackBaslik: "Stüdyo ve",
    stackAltBaslik: "iş akışı.",
    stack: [
      {
        label: "Kamera & Optik",
        items: [
          "Sony A1, Canon R5, medium format opsiyon",
          "Sigma Art, Canon L, Zeiss Otus serisi lens",
          "Macro, tilt-shift, prime lens kütüphanesi",
          "DJI Mavic 3 Pro / Inspire — lisanslı drone pilotu",
        ],
      },
      {
        label: "Işık",
        items: [
          "Profoto B10/B10X, Pro-10 jeneratör",
          "Octa, beauty dish, softbox, snoot, gridler",
          "RGB sürekli ışık (video çekim entegrasyonu için)",
        ],
      },
      {
        label: "Yazılım & Renk",
        items: [
          "Capture One Pro (tethered çekim)",
          "Photoshop + Lightroom (retouch)",
          "DAM ve renk yönetimi (sRGB / AdobeRGB)",
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 3. DİJİTAL PAZARLAMA
  // ──────────────────────────────────────────────────────────────────
  {
    slug: "dijital-pazarlama",
    label: "Dijital Pazarlama",
    seoTitle: "Dijital Pazarlama — Google Ads, Meta ve SEO",
    grup: "dijital",
    heroSubtitle:
      "Reklam bütçenle aldığın gerçek sonuç. Performans pazarlaması, SEO, içerik stratejisi ve raporlama — KPI odaklı, şeffaf.",
    metaDescription:
      "Kırmızı Erik Dijital Pazarlama — Google Ads, Meta Ads, SEO, içerik stratejisi, e-posta pazarlama, CRO. KPI odaklı, ölçülebilir performans pazarlaması.",
    yapilanlarBaslik: "Reklam değil,",
    yapilanlarAltBaslik: "geri dönüş.",
    yapilanlar: [
      {
        icon: Target,
        baslik: "Performans Pazarlaması",
        aciklama:
          "Google, Meta, TikTok ve LinkedIn reklam yönetimi. CPA ve ROAS hedeflerine göre kampanya kurulumu, optimize ve ölçekleme.",
      },
      {
        icon: Search,
        baslik: "SEO (Teknik + İçerik)",
        aciklama:
          "Site teknik audit, on-page optimizasyon, anahtar kelime stratejisi, link building ve içerik takvimi.",
      },
      {
        icon: FileText,
        baslik: "İçerik Stratejisi",
        aciklama:
          "Funnel'ın her seviyesine (TOFU/MOFU/BOFU) uygun blog, video, indirilebilir içerik üretimi.",
      },
      {
        icon: Mic,
        baslik: "E-posta Pazarlama",
        aciklama:
          "Newsletter, otomasyonlar (welcome, abandoned cart, win-back), segmentasyon ve A/B test.",
      },
      {
        icon: Wand2,
        baslik: "Conversion Optimization",
        aciklama:
          "Heatmap, session recording, A/B test ile ana sayfa, ürün sayfası ve checkout iyileştirmeleri.",
      },
      {
        icon: LineChart,
        baslik: "Analitik & Raporlama",
        aciklama:
          "GA4, GTM, custom dashboard kurulumu. Aylık şeffaf raporlama — tahmin değil, gerçek sayı.",
      },
    ],
    surecBaslik: "Beş aşama,",
    surecAltBaslik: "her sayı izlenebilir.",
    surec: [
      {
        no: "01",
        baslik: "Audit",
        aciklama:
          "Mevcut hesapların, sitenin ve rakiplerin teknik analizi. Eksikler ve fırsatlar listesi.",
      },
      {
        no: "02",
        baslik: "Strateji",
        aciklama: "Hedef kitle, KPI, kanal mix, bütçe dağılımı ve 90 günlük yol haritası.",
      },
      {
        no: "03",
        baslik: "Kurulum & Tracking",
        aciklama:
          "Pixel, conversion API, GA4, GTM, dashboard kurulumu. Ölçüm doğru olmadan optimize anlamsız.",
      },
      {
        no: "04",
        baslik: "Test & Optimize",
        aciklama:
          "Yaratıcı, hedef kitle ve teklif (offer) testleri. Veriye göre haftalık iterasyon.",
      },
      {
        no: "05",
        baslik: "Ölçeklendirme",
        aciklama:
          "ROAS hedefini tutturan kampanyalarda bütçe artışı, yeni pazar ve kanal genişlemesi.",
      },
    ],
    stackBaslik: "Reklam, ölçüm",
    stackAltBaslik: "ve analitik.",
    stack: [
      {
        label: "Reklam Platformları",
        items: [
          "Google Ads",
          "Meta Ads (Facebook + Instagram)",
          "TikTok Ads",
          "LinkedIn Ads",
          "X Ads",
        ],
      },
      {
        label: "Analitik & Tracking",
        items: [
          "Google Analytics 4",
          "Google Tag Manager",
          "Meta Conversion API",
          "Hotjar / Microsoft Clarity",
        ],
      },
      {
        label: "SEO",
        items: ["Ahrefs", "Semrush", "Google Search Console", "Screaming Frog"],
      },
      {
        label: "E-posta & CRM",
        items: ["Mailchimp", "Klaviyo", "ActiveCampaign", "HubSpot"],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 4. SOSYAL MEDYA YÖNETİMİ
  // ──────────────────────────────────────────────────────────────────
  {
    slug: "sosyal-medya-yonetimi",
    label: "Sosyal Medya Yönetimi",
    seoTitle: "Sosyal Medya Yönetimi ve İçerik Üretimi",
    grup: "dijital",
    heroSubtitle:
      "Sadece post atmak değil — markanın sesi, hikayesi, etkileşim stratejisi. Aylık takvimden raporlamaya, hayranlardan etkileşim yönetimine.",
    metaDescription:
      "Kırmızı Erik Sosyal Medya Yönetimi — Instagram, TikTok, LinkedIn, X, Facebook için içerik takvimi, üretim, etkileşim yönetimi, influencer işbirlikleri.",
    yapilanlarBaslik: "Aylık plan,",
    yapilanlarAltBaslik: "günlük etki.",
    yapilanlar: [
      {
        icon: FileText,
        baslik: "İçerik Takvimi",
        aciklama:
          "Aylık editöryal takvim, kampanya entegrasyonu, sezonluk planlama. Tek bakışta tüm aylık görünür.",
      },
      {
        icon: Camera,
        baslik: "Görsel & Video Üretim",
        aciklama:
          "Post, story, reel, TikTok için içerik üretimi. Markaya özel template'ler ve kalıcı görsel dil.",
      },
      {
        icon: Megaphone,
        baslik: "Topluluk Yönetimi",
        aciklama:
          "DM, yorum ve mention takibi. Tepki süresi 1 saatin altında, marka tonunda yanıtlama.",
      },
      {
        icon: Sparkles,
        baslik: "Influencer İşbirlikleri",
        aciklama:
          "Markaya uygun mikro ve makro influencer seçimi, brief, içerik onayı, performans ölçümü.",
      },
      {
        icon: Target,
        baslik: "Sosyal Medya Reklamları",
        aciklama: "Boost'tan kompleks kampanyaya — hedef kitle, yaratıcı varyasyonlar, A/B test.",
      },
      {
        icon: LineChart,
        baslik: "Aylık Raporlama",
        aciklama:
          "Engagement, takipçi büyümesi, en iyi-en kötü post analizleri ve sonraki ay için aksiyonlar.",
      },
    ],
    surecBaslik: "Beş aşama,",
    surecAltBaslik: "marka her gün canlı.",
    surec: [
      {
        no: "01",
        baslik: "Marka Analizi",
        aciklama:
          "Mevcut hesaplar, hedef kitle, rakip analizi ve ton-of-voice. Markanın sosyal medyadaki kişiliği netleşir.",
      },
      {
        no: "02",
        baslik: "Strateji & Editöryal Çizgi",
        aciklama:
          "İçerik kategorileri (eğitici, ürün, hikaye, kampanya), post sayısı, format dağılımı ve KPI.",
      },
      {
        no: "03",
        baslik: "Üretim",
        aciklama:
          "Aylık 12-30 post + 4-12 reel/TikTok üretimi. Çekim, tasarım, video kurgu hep dahil.",
      },
      {
        no: "04",
        baslik: "Yayın & Etkileşim",
        aciklama: "Optimal saatlerde yayın. DM, yorum, mention takibi ve marka tonunda yanıtlama.",
      },
      {
        no: "05",
        baslik: "Aylık Performans Raporu",
        aciklama:
          "İçerik bazında performans, takipçi analizi, hashtag etkinliği ve sonraki ay önerileri.",
      },
    ],
    stackBaslik: "Planlama, üretim,",
    stackAltBaslik: "ve raporlama.",
    stack: [
      {
        label: "Planlama & Yayın",
        items: ["Buffer", "Later", "Hootsuite", "Native scheduler'lar"],
      },
      {
        label: "Üretim",
        items: [
          "Adobe Premiere Pro + After Effects",
          "Photoshop + Illustrator",
          "Figma (post template'ler)",
          "CapCut Pro",
        ],
      },
      {
        label: "Analitik",
        items: [
          "Native insights (IG, TT, LI, X)",
          "Hootsuite Analytics",
          "Sprout Social",
          "Google Looker Studio",
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 5. UYGULAMA GELİŞTİRME
  // ──────────────────────────────────────────────────────────────────
  {
    slug: "uygulama-gelistirme",
    label: "Uygulama Geliştirme",
    seoTitle: "Mobil Uygulama ve Yazılım Geliştirme",
    grup: "yazilim",
    heroSubtitle:
      "iOS/Android native, cross-platform veya hibrit — markaya en uygun yaklaşımı seçer, ürün stratejisinden App Store yayınına kadar yönetiriz.",
    metaDescription:
      "Kırmızı Erik Uygulama Geliştirme — iOS native (Swift), Android native (Kotlin), cross-platform (React Native, Flutter), hibrit web app (PWA). Ürün stratejisi, UX, geliştirme, yayın.",
    yapilanlarBaslik: "Mobil deneyim,",
    yapilanlarAltBaslik: "her platformda.",
    yapilanlar: [
      {
        icon: Smartphone,
        baslik: "Native iOS",
        aciklama:
          "Swift + SwiftUI ile App Store standartlarında, hızlı, batarya dostu yerli iOS uygulamaları.",
      },
      {
        icon: Smartphone,
        baslik: "Native Android",
        aciklama:
          "Kotlin + Jetpack Compose ile modern Android uygulamaları. Material 3 standartlarında.",
      },
      {
        icon: Layers,
        baslik: "Cross-Platform",
        aciklama:
          "React Native veya Flutter ile tek codebase, iki platform. Bütçe dostu, hızlı iterasyon.",
      },
      {
        icon: Globe,
        baslik: "Hibrit Web App / PWA",
        aciklama:
          "Tarayıcı + ana ekran kısayolu deneyimi. App Store gerek yok, push notification destekli.",
      },
      {
        icon: Database,
        baslik: "Backend & API",
        aciklama:
          "Supabase, Firebase veya custom Node.js backend. Auth, DB, storage, real-time hep dahil.",
      },
      {
        icon: Search,
        baslik: "ASO (App Store Optimizasyonu)",
        aciklama:
          "Anahtar kelime, açıklama, ekran görüntüsü, video — App Store ve Play Store sıralaması için.",
      },
    ],
    surecBaslik: "Altı aşama,",
    surecAltBaslik: "fikirden mağazaya.",
    surec: [
      {
        no: "01",
        baslik: "Ürün Stratejisi",
        aciklama:
          "Hedef kullanıcı, problem, çözüm, MVP scope ve başarı metrikleri. Yanlış şey üretmemek için.",
      },
      {
        no: "02",
        baslik: "UX/UI Tasarım",
        aciklama: "Wireframe, kullanıcı akışı, prototipleme, Figma'da yüksek çözünürlüklü tasarım.",
      },
      {
        no: "03",
        baslik: "Geliştirme",
        aciklama:
          "2 haftalık sprint'lerle iteratif geliştirme. Her sprint sonu canlı build, ekip onayı.",
      },
      {
        no: "04",
        baslik: "Test & QA",
        aciklama:
          "Manuel + otomatik test, çoklu cihaz testi, performans profili, beta tester programı.",
      },
      {
        no: "05",
        baslik: "Yayınlama",
        aciklama: "App Store ve Play Store'a yükleme, review onayı, lansman koordinasyonu.",
      },
      {
        no: "06",
        baslik: "Bakım & Güncelleme",
        aciklama:
          "OS güncelleme uyumluluğu, bug fix, yeni özellik geliştirme, kullanıcı geri bildirim takibi.",
      },
    ],
    stackBaslik: "Native, hibrit,",
    stackAltBaslik: "veya cross.",
    stack: [
      {
        label: "Native",
        items: ["Swift + SwiftUI (iOS)", "Kotlin + Jetpack Compose (Android)"],
      },
      {
        label: "Cross-Platform",
        items: ["React Native + Expo", "Flutter"],
      },
      {
        label: "Backend",
        items: ["Supabase (Postgres + Auth + Storage)", "Firebase", "Custom Node.js + PostgreSQL"],
      },
      {
        label: "Tasarım",
        items: ["Figma", "Lottie animasyon", "Material 3 + Apple HIG"],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 6. WEB SİTESİ TASARIM VE YAZILIMI
  // ──────────────────────────────────────────────────────────────────
  {
    slug: "web-tasarim-yazilim",
    label: "Web Sitesi Tasarım ve Yazılımı",
    seoTitle: "Kurumsal Web Sitesi Tasarımı ve Yazılım",
    grup: "yazilim",
    heroSubtitle:
      "Kurumsal siteden e-ticarete, web app'ten admin paneline — modern stack, hızlı yükleme, SEO dostu, mobil-öncelikli.",
    metaDescription:
      "Kırmızı Erik Web Tasarım ve Yazılım — kurumsal site, e-ticaret, web app, admin paneli ve CMS. Next.js, React, Tailwind, Vercel.",
    yapilanlarBaslik: "Statik değil,",
    yapilanlarAltBaslik: "yaşayan ürün.",
    yapilanlar: [
      {
        icon: Globe,
        baslik: "Kurumsal Web Sitesi",
        aciklama:
          "Marka kimliğine uygun, hızlı, SEO dostu kurumsal siteler. Bu site de bizim eserimiz.",
      },
      {
        icon: ShoppingCart,
        baslik: "E-Ticaret",
        aciklama:
          "Shopify, WooCommerce veya custom checkout. Türk ödeme sistemleri (iyzico, PayTR) entegre.",
      },
      {
        icon: MonitorSmartphone,
        baslik: "Web Uygulaması / SaaS",
        aciklama: "Auth, billing, multi-tenant — web tabanlı yazılım ürününü sıfırdan kurarız.",
      },
      {
        icon: LayoutDashboard,
        baslik: "Admin Paneli & CMS",
        aciklama:
          "Müşterinin içeriği kendi yönetebileceği admin panel. Bu site de admin'den yönetiliyor.",
      },
      {
        icon: Target,
        baslik: "Landing Sayfa",
        aciklama:
          "Tek hedef, tek aksiyon. Reklam kampanyaları için yüksek dönüşüm odaklı sayfalar.",
      },
      {
        icon: Zap,
        baslik: "Performans & SEO",
        aciklama:
          "Lighthouse 90+, Core Web Vitals yeşil, schema.org markup, sitemap, OG image — hepsi standart.",
      },
      {
        icon: Bot,
        baslik: "Yapay Zeka Entegrasyonu",
        aciklama:
          "Sitenin içeriğiyle eğitilmiş AI asistan, panelde tek tıkla TR→EN çeviri, gelen talepleri özetleyen AI. ChatGPT ve Google AI Overview'da görünürlük için llms.txt ve yapılandırılmış veri.",
      },
    ],
    surecBaslik: "Beş aşama,",
    surecAltBaslik: "her sprint canlı build.",
    surec: [
      {
        no: "01",
        baslik: "Brief & Sitemap",
        aciklama: "Hedef, içerik mimarisi, kullanıcı yolları. Site açılmadan haritası net olur.",
      },
      {
        no: "02",
        baslik: "Wireframe & Tasarım",
        aciklama: "Düşük çözünürlüklü kullanıcı akışı, sonra Figma'da mood board ve final tasarım.",
      },
      {
        no: "03",
        baslik: "Geliştirme",
        aciklama:
          "Next.js + Tailwind ile component bazlı kodlama. Her sprint canlı staging'de görünür.",
      },
      {
        no: "04",
        baslik: "İçerik & QA",
        aciklama: "Migration veya ilk içerik girişi. Cross-browser, mobile, performans testi.",
      },
      {
        no: "05",
        baslik: "Lansman + Bakım",
        aciklama: "Domain bağlantı, DNS, SSL, monitoring. Aylık güncelleme paketi opsiyonel.",
      },
    ],
    stackBaslik: "Modern stack,",
    stackAltBaslik: "uzun ömürlü kod.",
    stack: [
      {
        label: "Yazılım Dilleri",
        items: ["TypeScript", "JavaScript", "Python", "SQL", "HTML5 & CSS3"],
      },
      {
        label: "Frontend",
        items: ["Next.js 16 (App Router)", "React 19", "Tailwind CSS", "shadcn/ui"],
      },
      {
        label: "Backend & DB",
        items: [
          "Node.js",
          "PostgreSQL + pgvector",
          "Supabase (Auth + Storage)",
          "Drizzle ORM",
          "Docker + Vercel / Hetzner",
        ],
      },
      {
        label: "Yapay Zeka",
        items: [
          "Claude (Anthropic)",
          "OpenAI Embeddings",
          "RAG — hibrit semantik + anahtar kelime arama",
          "llms.txt + JSON-LD (AI arama görünürlüğü)",
        ],
      },
      {
        label: "CMS",
        items: ["Özel admin panel", "Sanity", "Strapi"],
      },
      {
        label: "E-Ticaret",
        items: ["Shopify", "WooCommerce", "Custom + Stripe/iyzico/PayTR"],
      },
    ],
    panel: {
      baslik: "Hazır tema değil,",
      altBaslik: "size özel yönetim paneli.",
      aciklama:
        "Siteyi teslim edip bırakmıyoruz. İçeriğin tamamını kod bilmeden yönetebileceğiniz, sitenizin yapısına göre sıfırdan yazılmış bir panel kuruyoruz. Aşağıdaki görseller ihracatçı bir ahşap üreticisi için geliştirdiğimiz panelden ve bu panelle yönetilen siteden.",
      ozellikler: [
        {
          icon: Layers,
          baslik: "Modüler İçerik Yönetimi",
          aciklama:
            "Ürün, kategori, blog, referans, döküman — her modülde arama, sıralama, filtre, küçük resim önizleme ve onaylı silme.",
        },
        {
          icon: Zap,
          baslik: "Yayınla, Anında Canlıda",
          aciklama:
            "Taslak/yayın akışı. Yayınlanan içerik sayfasıyla birlikte menüye, kategori kartına ve dil eşleşmesine otomatik yansır; silince hepsinden kalkar.",
        },
        {
          icon: Globe,
          baslik: "Çok Dilli + AI Çeviri",
          aciklama:
            "TR ve EN alanlar yan yana. Tek tıkla yapay zeka çevirisi, dil değiştirici için sayfa eşleşmeleri otomatik.",
        },
        {
          icon: ImageIcon,
          baslik: "Akıllı Görsel Kütüphanesi",
          aciklama:
            "Çoklu yükleme, otomatik WebP sıkıştırma ve boyutlandırma, galeriden tıkla-seç hero görseli.",
        },
        {
          icon: LineChart,
          baslik: "Analytics & SEO Paneli",
          aciklama:
            "Google Analytics 4 ve Search Console verileri panelin içinde — ziyaret, arama sorgusu, sayfa performansı.",
        },
        {
          icon: Database,
          baslik: "Talep Kutusu & Güvenlik",
          aciklama:
            "Formlardan ve AI asistandan gelen talepler tek listede. Şifreli giriş, HTTPS, her kayıtta görsel geri bildirim.",
        },
      ],
      gorseller: [
        {
          src: "/hizmetler/web-panel/admin-genel-bakis.webp",
          alt: "Panel genel bakış: içerik sayıları, gelen talepler ve son aktivite",
        },
        {
          src: "/hizmetler/web-panel/admin-analytics.webp",
          alt: "Panel içinde Google Analytics 4: anlık ziyaretçi, trafik kaynakları, en çok ziyaret edilen sayfalar",
        },
        {
          src: "/hizmetler/web-panel/site-anasayfa.webp",
          alt: "Panelden yönetilen sitenin anasayfası: hero görseli ve başlık panelden değişir",
        },
        {
          src: "/hizmetler/web-panel/site-referanslar.webp",
          alt: "Panelden eklenen referanslar: kategori ve ağaç türü filtreli proje listesi",
        },
      ],
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 7. AI KURULUMLARI (vurgu hizmet)
  // ──────────────────────────────────────────────────────────────────
  {
    slug: "ai-kurulumlari",
    label: "AI Kurulumları",
    seoTitle: "Şirketlere Özel AI Chatbot ve Otomasyon",
    grup: "yazilim",
    oneCikan: true,
    heroSubtitle:
      "Markanın sesiyle konuşan, müşterinin ihtiyacını anlayan, içerik üreten ve operasyonu sadeleştiren AI sistemleri — markanın diline ve verisine özel.",
    metaDescription:
      "Kırmızı Erik AI Kurulumları — markaya özel chatbot, içerik üretim asistanı, müşteri hizmetleri otomasyonu, doküman analizi. Claude, OpenAI, Gemini orchestration.",
    yapilanlarBaslik: "Sıradan değil,",
    yapilanlarAltBaslik: "markana özgü.",
    yapilanlar: [
      {
        icon: Bot,
        baslik: "Markaya Özel Chatbot",
        aciklama:
          "Ürün katalogun, SSS'in, marka tonun üzerine eğitilmiş, web sitende veya WhatsApp'ta çalışan asistan.",
      },
      {
        icon: FileText,
        baslik: "İçerik Üretim Asistanı",
        aciklama:
          "Sosyal medya post'u, e-posta, blog yazısı, ürün açıklaması — markanın sesi ve hedef kitlesine göre.",
      },
      {
        icon: Headphones,
        baslik: "Müşteri Hizmetleri Otomasyonu",
        aciklama:
          "Sıkça gelen soruları otomatik yanıtla, karmaşık olanları doğru takıma yönlendir. CRM/destek bağlantılı.",
      },
      {
        icon: ScanText,
        baslik: "Doküman / PDF Analizi",
        aciklama:
          "Sözleşme, fatura, rapor — büyük doküman havuzlarını okuyan, özet/karşılaştırma çıkaran asistan.",
      },
      {
        icon: Workflow,
        baslik: "İş Akışı Otomasyonu",
        aciklama:
          "E-posta tasnifi, lead skorlama, rapor üretimi — manuel işleri AI ile sadeleştir.",
      },
      {
        icon: Layers,
        baslik: "Mevcut Ürüne AI Entegrasyonu",
        aciklama: "Web sitende veya uygulamanda akıllı arama, öneri sistemi, otomatik etiketleme.",
      },
    ],
    surecBaslik: "Beş aşama,",
    surecAltBaslik: "üç haftada çalışan demo.",
    surec: [
      {
        no: "01",
        baslik: "Keşif",
        aciklama:
          "İhtiyacı dinler, mevcut süreçleri haritalandırırız. AI'nın gerçekten fark yaratacağı 1-2 noktayı netleştiririz.",
      },
      {
        no: "02",
        baslik: "Veri & Strateji",
        aciklama:
          "Kurumsal veri (kataloğun, SSS, dokümanlar, marka rehberi) toplanır. Hangi modelin doğru olacağı kararlaştırılır.",
      },
      {
        no: "03",
        baslik: "Prototip",
        aciklama:
          "1-2 hafta içinde çalışan prototip teslim edilir. Demo üzerinde birlikte iyileştirme turları.",
      },
      {
        no: "04",
        baslik: "Entegrasyon",
        aciklama:
          "Mevcut sistemlerine (web, CRM, Slack, WhatsApp) bağlarız. Erişim kontrolü, log, izleme dahil.",
      },
      {
        no: "05",
        baslik: "Bakım & Geliştirme",
        aciklama:
          "Aylık paket: kullanım izleme, modeli güncelleme, yeni feature'lar, ekip eğitimi.",
      },
    ],
    stackBaslik: "Neyle",
    stackAltBaslik: "çalışıyoruz?",
    stack: [
      {
        label: "Foundation Models",
        items: ["Anthropic Claude (Opus, Sonnet, Haiku)", "OpenAI GPT serisi", "Google Gemini"],
      },
      {
        label: "Geliştirme",
        items: ["Anthropic SDK", "LangChain / LangGraph", "Vercel AI SDK", "Custom orchestration"],
      },
      {
        label: "Veri & Vektör",
        items: ["pgvector (Postgres)", "Pinecone / Weaviate", "Supabase, kurumsal DB'ler"],
      },
      {
        label: "Entegrasyon",
        items: [
          "WhatsApp Business API",
          "Slack, Microsoft Teams",
          "n8n, Make, Zapier",
          "Custom REST/GraphQL",
        ],
      },
    ],
    customCta: {
      rozet: "Canlı Demo",
      baslik: "Bu siteyi yazan AI",
      aciklama:
        "Sağ alttaki sohbet asistanımız, Claude Haiku 4.5 üzerine kurduğumuz sistemin canlı bir örneği. Markamızın sesiyle konuşuyor, hizmetlerimizi biliyor, sorularını yanıtlıyor. Senin için de aynısını kurabiliriz.",
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // 8. GRAFİK TASARIM
  // ──────────────────────────────────────────────────────────────────
  {
    slug: "grafik-tasarim",
    label: "Grafik Tasarım",
    seoTitle: "Grafik Tasarım ve Kurumsal Kimlik",
    grup: "gorsel",
    heroSubtitle:
      "Logo'dan kurumsal kimliğe, ambalajdan basılı materyale — markanın görsel dilini sıfırdan kurarız ya da mevcut sistemini güçlendiririz.",
    metaDescription:
      "Kırmızı Erik Grafik Tasarım — logo, kurumsal kimlik, ambalaj, basılı materyal, sosyal medya görseli, UI/UX. Marka rehberi ve final dosyalar.",
    yapilanlarBaslik: "Görsel dil,",
    yapilanlarAltBaslik: "tutarlı sistem.",
    yapilanlar: [
      {
        icon: Type,
        baslik: "Logo & Wordmark",
        aciklama:
          "Marka analizi → 3 konsept yön → iterasyon → final. Ölçeklenebilir SVG + tüm formatlarda teslim.",
      },
      {
        icon: Palette,
        baslik: "Kurumsal Kimlik Sistemi",
        aciklama:
          "Logo varyasyonları, renk paleti, tipografi, marka rehberi (PDF). Tüm temas noktalarında tutarlı kullanım.",
      },
      {
        icon: Package,
        baslik: "Ambalaj Tasarımı",
        aciklama: "Ürün ambalajı tasarımı, mockup hazırlığı, dieline ve baskı dosyası teslimi.",
      },
      {
        icon: FileText,
        baslik: "Basılı Materyal",
        aciklama:
          "Broşür, katalog, kartvizit, antetli kağıt, dergi, kitap iç tasarım. Print-ready dosyalar.",
      },
      {
        icon: ImageIcon,
        baslik: "Sosyal Medya Görselleri",
        aciklama:
          "Markaya özel post template'leri, reels kapakları, story görselleri — tek seferde sistem kurulur.",
      },
      {
        icon: MonitorSmartphone,
        baslik: "UI/UX Tasarım",
        aciklama: "Web ve mobil uygulamalar için ekran tasarımı, prototip, kullanıcı akışı.",
      },
    ],
    surecBaslik: "Beş aşama,",
    surecAltBaslik: "marka rehberli teslim.",
    surec: [
      {
        no: "01",
        baslik: "Marka Analizi",
        aciklama: "Mevcut marka, hedef kitle, sektör, rakipler. Konsept yönleri için temel oluşur.",
      },
      {
        no: "02",
        baslik: "Konsept (3 yön)",
        aciklama:
          "Birbirinden farklı 3 konsept sunulur — birinin seçimi başlangıç, melez seçim de mümkün.",
      },
      {
        no: "03",
        baslik: "Tasarım & İterasyon",
        aciklama: "Seçilen yönde 2-3 tur iterasyon. Her tur müşteri onayıyla ilerler.",
      },
      {
        no: "04",
        baslik: "Marka Rehberi",
        aciklama:
          "Logo kullanımı, renk, tipografi, görsel dil, dont's. PDF olarak teslim, tüm ekibinde kullanılabilir.",
      },
      {
        no: "05",
        baslik: "Final Dosyalar",
        aciklama: "Tüm formatlarda (vector, raster, web, print) organize klasör yapısında teslim.",
      },
    ],
    stackBaslik: "Adobe, Figma,",
    stackAltBaslik: "ve detay.",
    stack: [
      {
        label: "Vector & Print",
        items: ["Adobe Illustrator", "Adobe InDesign", "Adobe Photoshop"],
      },
      {
        label: "UI / Dijital",
        items: ["Figma", "Sketch", "Adobe XD"],
      },
      {
        label: "Print Üretim",
        items: ["CMYK iş akışı", "Pantone matching", "Dieline ve mockup hazırlığı"],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // 9. 3D/2D ÇALIŞMALAR
  // ──────────────────────────────────────────────────────────────────
  {
    slug: "3d-2d-calismalar",
    label: "3D/2D Çalışmalar",
    seoTitle: "3D Animasyon ve Motion Graphics",
    grup: "gorsel",
    heroSubtitle:
      "Ürün render'dan motion graphics'e, mimari görselleştirmeden karakter animasyona — fikir cep telefonunda parıldayana kadar.",
    metaDescription:
      "Kırmızı Erik 3D/2D Çalışmalar — motion graphics, ürün render, karakter animasyon, mimari görselleştirme, mockup, logo animasyonu.",
    yapilanlarBaslik: "Hareket,",
    yapilanlarAltBaslik: "boyut, hayat.",
    yapilanlar: [
      {
        icon: Video,
        baslik: "2D Motion Graphics",
        aciklama:
          "Logo açılışı, infografik animasyon, sosyal medya video — After Effects + Cavalry workflow'u.",
      },
      {
        icon: Box,
        baslik: "3D Ürün Render",
        aciklama:
          "Fiziksel ürünün dijital ikizini oluştur — fotoğrafa gerek olmadan her açıdan, her renkte.",
      },
      {
        icon: Sparkles,
        baslik: "Karakter Animasyonu",
        aciklama:
          "Marka maskotu, açıklayıcı video karakteri — rigging'den animasyon'a tüm pipeline.",
      },
      {
        icon: Box,
        baslik: "Mimari Görselleştirme",
        aciklama: "İç ve dış mekan, ürün showroom render — gerçeküstü kalitede, fotorealistik.",
      },
      {
        icon: Smartphone,
        baslik: "Mockup Hazırlama",
        aciklama:
          "Ürün, ambalaj, web sitesi, basılı materyal mockup'ları — sunum ve PR kullanımı için.",
      },
      {
        icon: Wand2,
        baslik: "Logo Animasyonu",
        aciklama:
          "Statik logoyu video açılışlarında, sosyal medya story'lerde, sunumlarda hayata geçir.",
      },
    ],
    surecBaslik: "Beş aşama,",
    surecAltBaslik: "render hayata geçer.",
    surec: [
      {
        no: "01",
        baslik: "Brief & Storyboard",
        aciklama: "Anlatım hedefi, süre, dağıtım yeri (TV, sosyal, web) ve mood board.",
      },
      {
        no: "02",
        baslik: "Modelleme / Vektör",
        aciklama: "3D model veya 2D vektör kütüphane oluşumu. Asset'ler reusable.",
      },
      {
        no: "03",
        baslik: "Texture & Lighting",
        aciklama: "Materyaller, ışıklandırma, sahne kompozisyonu. Look-dev onayı.",
      },
      {
        no: "04",
        baslik: "Animasyon",
        aciklama: "Keyframe animasyonu, simülasyon (cloth, particle), hareket tasarımı.",
      },
      {
        no: "05",
        baslik: "Render & Compositing",
        aciklama: "GPU render, compositing, renk düzenleme, ses entegrasyonu, final export.",
      },
    ],
    stackBaslik: "3D + 2D",
    stackAltBaslik: "pipeline.",
    stack: [
      {
        label: "3D",
        items: ["Cinema 4D", "Blender", "Maya", "ZBrush (sculpt)"],
      },
      {
        label: "2D / Motion",
        items: ["After Effects", "Cavalry", "Adobe Illustrator"],
      },
      {
        label: "Render Engine",
        items: ["Octane", "Redshift", "Cycles", "Karma"],
      },
      {
        label: "Compositing",
        items: ["After Effects", "Nuke", "DaVinci Resolve Fusion"],
      },
    ],
  },
];

/**
 * Slug ile hizmet sayfasını bul. Bulunamazsa null.
 */
export function getServicePage(slug: string): ServicePageData | null {
  return servicePages.find((s) => s.slug === slug) ?? null;
}

/**
 * Chatbot system prompt için kompakt hizmet referansı.
 * Her hizmet için 4-5 satır özet — kapsam + süreç + temel araçlar.
 * Modül seviyesinde hesaplanır → her chat isteğinde yeniden çalışmaz, cache key sabit.
 */
// Hizmet sayfası ↔ kategori anahtarı (lead hizmet_kategori, blog kategori, iletişim formu seçenekleri)
export const kategoriByServiceSlug: Record<string, string> = {
  "video-produksiyon": "video",
  "fotograf-cekimleri": "fotograf",
  "dijital-pazarlama": "dijital",
  "sosyal-medya-yonetimi": "sosyal",
  "uygulama-gelistirme": "uygulama",
  "web-tasarim-yazilim": "web",
  "ai-kurulumlari": "ai",
  "grafik-tasarim": "grafik",
  "3d-2d-calismalar": "3d-2d",
};

export function serviceByKategori(kategori: string): ServicePageData | null {
  const slug = Object.keys(kategoriByServiceSlug).find(
    (s) => kategoriByServiceSlug[s] === kategori,
  );
  return slug ? getServicePage(slug) : null;
}

export const SERVICES_CONTEXT_FOR_AI = servicePages
  .map((s) => {
    const yapilanlarOzeti = s.yapilanlar.map((y) => y.baslik).join(" · ");
    const surecOzeti = s.surec.map((step) => step.baslik).join(" → ");
    const stackOzeti = s.stack
      .map((g) => `${g.label}: ${g.items.slice(0, 3).join(", ")}`)
      .join(" | ");

    return `## ${s.label} (slug: ${s.slug}, /hizmetler/${s.slug})
**Kapsam:** ${yapilanlarOzeti}
**Süreç:** ${surecOzeti}
**Stack/Araç:** ${stackOzeti}
**Açıklama:** ${s.heroSubtitle}`;
  })
  .join("\n\n");
