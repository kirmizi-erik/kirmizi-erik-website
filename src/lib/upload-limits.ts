// Tip bazlı dosya boyutu limitleri (Supabase Free tier single-file limit ~50 MB).
// Server action ve client component'lerde ortak kullanılır.

export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_VIDEO_SIZE_MB = 50;

export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
export const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;
