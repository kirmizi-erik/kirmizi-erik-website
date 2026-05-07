import { z } from "zod";

// Chat mesaj — kullanıcı veya asistan
export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;

// Chat → lead'e dönüşüm: kullanıcı iletişim bilgilerini paylaşır
export const chatLeadInputSchema = z.object({
  ad_soyad: z
    .string()
    .min(3, "Ad soyad en az 3 karakter")
    .max(120)
    .regex(/^[a-zA-ZçğıöşüÇĞİÖŞÜ\s'.-]+$/, "Sadece harf"),
  eposta: z.string().email("Geçerli bir e-posta").max(200),
  telefon: z
    .string()
    .max(40)
    .regex(/^[\d\s\+\(\)\-]{7,}$/, "Geçerli telefon"),
  conversation: z.array(chatMessageSchema).min(1).max(50),
  iletisim_tercihi: z.enum(["telefon", "eposta", "ikisi"]).default("ikisi"),
});
export type ChatLeadInput = z.infer<typeof chatLeadInputSchema>;
