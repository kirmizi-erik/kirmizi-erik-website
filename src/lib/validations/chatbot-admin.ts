import { z } from "zod";

// Panel → bilgi bankası Q&A girişi
export const knowledgeInputSchema = z
  .object({
    question_tr: z.string().min(3).max(1000),
    answer_tr: z.string().min(3).max(8000),
    question_en: z.string().max(1000).nullish(),
    answer_en: z.string().max(8000).nullish(),
    source_url: z.string().max(500).nullish(),
  })
  .refine((v) => !!v.question_en === !!v.answer_en, {
    message: "EN soru ve cevap birlikte doldurulmalı (veya ikisi de boş)",
  });
export type KnowledgeInput = z.infer<typeof knowledgeInputSchema>;
