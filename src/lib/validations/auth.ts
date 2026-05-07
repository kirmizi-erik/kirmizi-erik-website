import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
});

export type LoginInput = z.infer<typeof loginSchema>;
