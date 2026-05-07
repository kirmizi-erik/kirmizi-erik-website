import { z } from "zod";

export const butceOptions = [
  { value: "konusalim", label: "Belirsiz · önce konuşalım" },
  { value: "10-50k", label: "10.000 ₺ – 50.000 ₺" },
  { value: "50-200k", label: "50.000 ₺ – 200.000 ₺" },
  { value: "200-500k", label: "200.000 ₺ – 500.000 ₺" },
  { value: "500k+", label: "500.000 ₺ +" },
] as const;

export const leadInputSchema = z.object({
  ad_soyad: z.string().min(2, "Adınızı yazın").max(120),
  eposta: z.string().email("Geçerli bir e-posta girin"),
  telefon: z.string().max(40).optional().or(z.literal("")),
  sirket: z.string().max(120).optional().or(z.literal("")),
  hizmet_kategori: z.array(z.string()).default([]),
  butce: z.string().optional().or(z.literal("")),
  brief: z.string().min(10, "En az 10 karakter").max(5000, "En fazla 5000 karakter"),
  kvkk_onay: z
    .union([z.boolean(), z.string()])
    .transform((v) => v === true || v === "on" || v === "true"),
  kaynak: z.string().optional().or(z.literal("")),
  user_agent: z.string().optional().or(z.literal("")),
});

export type LeadInput = z.infer<typeof leadInputSchema>;

export type AiAnalysis = {
  skor: number; // 0-100
  ozet: string; // 1-2 cümle
  eksikler: string[]; // kullanıcıya gösterilecek eksiklik listesi
  onerilenHizmetler: string[]; // kategori value'ları
};
