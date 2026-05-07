import { z } from "zod";

export const durumSchema = z.enum(["taslak", "yayinda", "arsiv"]);
export type CaseStudyDurum = z.infer<typeof durumSchema>;

export const durumLabel: Record<CaseStudyDurum, string> = {
  taslak: "Taslak",
  yayinda: "Yayında",
  arsiv: "Arşiv",
};

export const kategoriOptions = [
  { value: "video", label: "Video Prodüksiyon" },
  { value: "fotograf", label: "Fotoğraf" },
  { value: "dijital", label: "Dijital Pazarlama" },
  { value: "sosyal", label: "Sosyal Medya" },
  { value: "uygulama", label: "Uygulama" },
  { value: "web", label: "Web" },
  { value: "ai", label: "AI Kurulumu" },
  { value: "grafik", label: "Grafik Tasarım" },
  { value: "3d-2d", label: "3D/2D" },
] as const;

export const metrikSchema = z.object({
  label: z.string().min(1, "Etiket gerekli"),
  value: z.string().min(1, "Değer gerekli"),
});

export type Metrik = z.infer<typeof metrikSchema>;

export const caseStudyInputSchema = z.object({
  baslik: z.string().min(2, "En az 2 karakter").max(200),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Sadece küçük harf, rakam ve tire"),
  ozet: z.string().max(600).optional().or(z.literal("")),
  musteri_adi: z.string().max(120).optional().or(z.literal("")),
  sektor: z.string().max(80).optional().or(z.literal("")),
  kategori: z.array(z.string()).default([]),
  kapak_url: z.string().url().optional().or(z.literal("")),
  kapak_video_url: z.string().url().optional().or(z.literal("")),
  problem: z.string().optional().or(z.literal("")),
  cozum: z.string().optional().or(z.literal("")),
  sonuc: z.string().optional().or(z.literal("")),
  metrikler: z.array(metrikSchema).default([]),
  ekip_krediler: z.array(z.string().min(1)).default([]),
  galeri_urls: z.array(z.string().url()).default([]),
  durum: durumSchema.default("taslak"),
  one_cikan: z.boolean().default(false),
});

export type CaseStudyInput = z.infer<typeof caseStudyInputSchema>;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
