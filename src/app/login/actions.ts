"use server";

import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations/auth";

export type LoginActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function loginWithMagicLink(formData: FormData): Promise<LoginActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Geçersiz giriş" };
  }

  const supabase = await createClient();
  const reqHeaders = await headers();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ?? `https://${reqHeaders.get("host") ?? "localhost:3000"}`;

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return {
    ok: true,
    message: "Giriş bağlantısı e-postanıza gönderildi. E-postanızı kontrol edin.",
  };
}
