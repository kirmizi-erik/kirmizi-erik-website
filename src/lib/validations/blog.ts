import { z } from "zod";

import { durumSchema } from "@/lib/validations/case-study";

export const blogInputSchema = z.object({
  baslik: z.string().trim().min(5, "Başlık en az 5 karakter").max(200),
  slug: z
    .string()
    .trim()
    .min(3, "Slug en az 3 karakter")
    .max(120)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug yalnız küçük harf, rakam ve tire içerebilir"),
  seo_baslik: z
    .string()
    .trim()
    .max(70, "SEO başlığı en fazla 70 karakter")
    .optional()
    .or(z.literal("")),
  ozet: z.string().trim().max(300, "Özet en fazla 300 karakter").optional().or(z.literal("")),
  icerik: z.string().max(50000),
  kapak_url: z.string().url().optional().or(z.literal("")),
  kategori: z.array(z.string()).default([]),
  durum: durumSchema.default("taslak"),
});

export type BlogInput = z.infer<typeof blogInputSchema>;

// Türkçe karakterler ASCII'ye çevrilir (İ → i, ı → i …); URL'de %C4%B1 gibi kodlar oluşmaz.
export function blogSlugify(text: string): string {
  return text
    .toLocaleLowerCase("tr-TR")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);
}

// Okuma süresi: Türkçe için ~200 kelime/dk
export function readingMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
