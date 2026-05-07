"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const settingsSchema = z.object({
  meta_title: z.string().max(160).optional().or(z.literal("")),
  meta_description: z.string().max(400).optional().or(z.literal("")),
  hero_title: z.string().max(300).optional().or(z.literal("")),
  hero_subtitle: z.string().max(800).optional().or(z.literal("")),
  hero_video_url: z.string().url().optional().or(z.literal("")),
  contact_email: z.string().email("Geçerli e-posta").optional().or(z.literal("")),
  contact_phone: z.string().max(40).optional().or(z.literal("")),
  contact_address: z.string().max(300).optional().or(z.literal("")),
  social_instagram: z.string().url().optional().or(z.literal("")),
  social_twitter: z.string().url().optional().or(z.literal("")),
  social_facebook: z.string().url().optional().or(z.literal("")),
  social_youtube: z.string().url().optional().or(z.literal("")),
  social_linkedin: z.string().url().optional().or(z.literal("")),
  social_behance: z.string().url().optional().or(z.literal("")),
  kvkk_text: z.string().max(20000).optional().or(z.literal("")),
  cookie_text: z.string().max(2000).optional().or(z.literal("")),
});

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

const emptyToNull = (s: unknown) => {
  if (typeof s !== "string") return null;
  const t = s.trim();
  return t.length ? t : null;
};

export async function updateSiteSettings(formData: FormData): Promise<ActionResult> {
  const raw = {
    meta_title: formData.get("meta_title"),
    meta_description: formData.get("meta_description"),
    hero_title: formData.get("hero_title"),
    hero_subtitle: formData.get("hero_subtitle"),
    hero_video_url: formData.get("hero_video_url"),
    contact_email: formData.get("contact_email"),
    contact_phone: formData.get("contact_phone"),
    contact_address: formData.get("contact_address"),
    social_instagram: formData.get("social_instagram"),
    social_twitter: formData.get("social_twitter"),
    social_facebook: formData.get("social_facebook"),
    social_youtube: formData.get("social_youtube"),
    social_linkedin: formData.get("social_linkedin"),
    social_behance: formData.get("social_behance"),
    kvkk_text: formData.get("kvkk_text"),
    cookie_text: formData.get("cookie_text"),
  };

  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Geçersiz veri" };
  }
  const v = parsed.data;

  const social: Record<string, string> = {};
  if (v.social_instagram) social.instagram = v.social_instagram;
  if (v.social_twitter) social.twitter = v.social_twitter;
  if (v.social_facebook) social.facebook = v.social_facebook;
  if (v.social_youtube) social.youtube = v.social_youtube;
  if (v.social_linkedin) social.linkedin = v.social_linkedin;
  if (v.social_behance) social.behance = v.social_behance;

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      meta_title: emptyToNull(v.meta_title),
      meta_description: emptyToNull(v.meta_description),
      hero_title: emptyToNull(v.hero_title),
      hero_subtitle: emptyToNull(v.hero_subtitle),
      hero_video_url: emptyToNull(v.hero_video_url),
      contact_email: emptyToNull(v.contact_email),
      contact_phone: emptyToNull(v.contact_phone),
      contact_address: emptyToNull(v.contact_address),
      social,
      kvkk_text: emptyToNull(v.kvkk_text),
      cookie_text: emptyToNull(v.cookie_text),
    })
    .eq("id", 1);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/ayarlar");
  revalidatePath("/", "layout"); // header/footer her sayfada — layout düzeyinde refresh
  return { ok: true, message: "Ayarlar kaydedildi" };
}
