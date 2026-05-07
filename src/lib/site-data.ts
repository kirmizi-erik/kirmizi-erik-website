/**
 * Site genelinde kullanılan statik veri.
 * Dinamik veri (site_settings DB tablosu) admin panelden yönetiliyor;
 * burası ise navigation, hizmet kataloğu, manifest gibi statikler.
 */

export const siteConfig = {
  name: "Kırmızı Erik",
  tagline: "360° Kreatif Reklam Ajansı",
  description:
    "Video, fotoğraf, dijital pazarlama, sosyal medya, web/uygulama, AI kurulumları, grafik ve 3D/2D — dokuz hizmet tek çatı altında.",
  url: "https://kirmizierik.com.tr",
} as const;

export const navItems = [
  { href: "/", label: "Anasayfa" },
  { href: "/calismalar", label: "Çalışmalar" },
  { href: "/hizmetler/ai-kurulumlari", label: "Hizmetler" },
  { href: "/iletisim", label: "İletişim" },
] as const;

/** Ajansın 9 hizmeti, kullanıcının verdiği resmi sıra. */
export const hizmetler = [
  {
    slug: "video-produksiyon",
    label: "Video Prodüksiyon",
    grup: "gorsel",
    aktif: false, // Faz 1'de detay sayfası yok
  },
  {
    slug: "fotograf-cekimleri",
    label: "Fotoğraf Çekimleri",
    grup: "gorsel",
    aktif: false,
  },
  {
    slug: "dijital-pazarlama",
    label: "Dijital Pazarlama",
    grup: "dijital",
    aktif: false,
  },
  {
    slug: "sosyal-medya-yonetimi",
    label: "Sosyal Medya Yönetimi",
    grup: "dijital",
    aktif: false,
  },
  {
    slug: "uygulama-gelistirme",
    label: "Uygulama Geliştirme",
    grup: "yazilim",
    aktif: false,
  },
  {
    slug: "web-tasarim-yazilim",
    label: "Web Sitesi Tasarım ve Yazılımı",
    grup: "yazilim",
    aktif: false,
  },
  {
    slug: "ai-kurulumlari",
    label: "AI Kurulumları",
    grup: "yazilim",
    aktif: true, // Faz 1'in vurgu hizmeti — detay sayfa açık
    oneCikan: true,
  },
  {
    slug: "grafik-tasarim",
    label: "Grafik Tasarım",
    grup: "gorsel",
    aktif: false,
  },
  {
    slug: "3d-2d-calismalar",
    label: "3D/2D Çalışmalar",
    grup: "gorsel",
    aktif: false,
  },
] as const;

export type HizmetGrup = "gorsel" | "dijital" | "yazilim";

export const hizmetGrupBilgi: Record<
  HizmetGrup,
  { baslik: string; aciklama: string }
> = {
  gorsel: {
    baslik: "Görsel İçerik & Tasarım",
    aciklama: "Video, fotoğraf, grafik tasarım ve 3D/2D animasyon.",
  },
  dijital: {
    baslik: "Dijital Pazarlama & Yönetim",
    aciklama: "Performans pazarlaması, SEO, sosyal medya yönetimi.",
  },
  yazilim: {
    baslik: "Yazılım & AI",
    aciklama:
      "Web sitesi, mobil uygulama ve şirketlere özel AI kurulumları.",
  },
};
