// Tip bazlı dosya boyutu limitleri (Supabase Free tier single-file limit ~50 MB).
// Server action ve client component'lerde ortak kullanılır.

export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_VIDEO_SIZE_MB = 50;

export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
export const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

/**
 * Görsel boyut standartları — kullanıcıya UI'da öneri olarak gösterilir.
 * Sitedeki kartlar 16:9 aspect kullanıyor (anasayfa & liste); galeri grid 4:3.
 * Tarayıcı görseli object-cover ile kırpıyor; kullanıcı önerilen oranda yüklerse
 * kırpılma olmadan tam görüntülenir.
 */
export const IMAGE_GUIDELINES = {
  cover: {
    label: "Kapak görseli",
    aspect: "16:9",
    recommended: "1600 × 900 px",
    note: "Anasayfa ve liste kartlarında 16:9 oranında kullanılır.",
  },
  gallery: {
    label: "Galeri görseli",
    aspect: "4:3 veya esnek",
    recommended: "1200 × 900 px (veya yatay)",
    note: "Detay sayfası galerisinde orijinal oranıyla görünür.",
  },
  videoPreview: {
    label: "Kapak preview videosu",
    aspect: "16:9",
    recommended: "1280 × 720 (HD), 5-15 saniye loop",
    note: "Kart hover'ında otomatik oynar. Ses gerekmez (sessiz).",
  },
  hero: {
    label: "Hero arkaplan videosu",
    aspect: "16:9",
    recommended: "1920 × 1080 (Full HD), 8-15 saniye loop",
    note: "Anasayfa hero'da arkaplan olarak %50 opaklıkta oynar.",
  },
} as const;
