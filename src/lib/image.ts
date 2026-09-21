import sharp from "sharp";

/**
 * Panelden yüklenen her görsel bu helper'dan geçer: EXIF oryantasyonu uygulanır,
 * uzun kenar 2000 px'e sığdırılır (büyütmeden) ve webp'e çevrilir.
 * Boyut belirgin düşer, gözle görülür kalite kaybı olmaz.
 *
 * PDF/SVG/GIF'e dokunulmaz. Optimizasyon patlarsa orijinal dosya kaydedilir —
 * yükleme hiçbir durumda bu yüzden başarısız olmaz.
 */
export async function optimizeUpload(
  buffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
  if (!mimeType.startsWith("image/") || mimeType === "image/svg+xml" || mimeType === "image/gif") {
    return { buffer, filename, contentType: mimeType };
  }

  try {
    const out = await sharp(buffer)
      .rotate()
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    return {
      buffer: out,
      filename: `${filename.replace(/\.[^.]+$/, "")}.webp`,
      contentType: "image/webp",
    };
  } catch (err) {
    console.warn("[optimizeUpload] optimize edilemedi, orijinal kaydediliyor", err);
    return { buffer, filename, contentType: mimeType };
  }
}
