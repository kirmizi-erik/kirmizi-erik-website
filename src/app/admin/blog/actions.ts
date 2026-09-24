"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { blogInputSchema, blogSlugify } from "@/lib/validations/blog";

export type BlogSaveState = { ok: boolean; message: string } | null;

function emptyToNull(s: string | undefined) {
  const t = s?.trim();
  return t ? t : null;
}

function parse(formData: FormData) {
  const baslik = String(formData.get("baslik") ?? "");
  return blogInputSchema.safeParse({
    baslik,
    slug: String(formData.get("slug") ?? "").trim() || blogSlugify(baslik),
    seo_baslik: String(formData.get("seo_baslik") ?? ""),
    ozet: String(formData.get("ozet") ?? ""),
    icerik: String(formData.get("icerik") ?? ""),
    kapak_url: String(formData.get("kapak_url") ?? ""),
    kategori: formData.getAll("kategori").map(String).filter(Boolean),
    durum: formData.get("durum") ?? "taslak",
  });
}

function revalidateBlog(slug?: string) {
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");
}

export async function createBlogPost(
  _prev: BlogSaveState,
  formData: FormData,
): Promise<BlogSaveState> {
  const parsed = parse(formData);
  if (!parsed.success)
    return { ok: false, message: parsed.error.errors[0]?.message ?? "Geçersiz veri" };
  const d = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      ...d,
      seo_baslik: emptyToNull(d.seo_baslik),
      ozet: emptyToNull(d.ozet),
      kapak_url: emptyToNull(d.kapak_url),
      yayin_tarihi: d.durum === "yayinda" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { ok: false, message: "Bu slug zaten kullanılıyor" };
    return { ok: false, message: error.message };
  }

  revalidateBlog(d.slug);
  redirect(`/admin/blog/${data.id}?kaydedildi=1`);
}

export async function updateBlogPost(
  id: string,
  _prev: BlogSaveState,
  formData: FormData,
): Promise<BlogSaveState> {
  const parsed = parse(formData);
  if (!parsed.success)
    return { ok: false, message: parsed.error.errors[0]?.message ?? "Geçersiz veri" };
  const d = parsed.data;

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("blog_posts")
    .select("slug, durum, yayin_tarihi")
    .eq("id", id)
    .single();

  // İlk yayına alındığı an tarih atanır; sonraki düzenlemeler tarihi değiştirmez
  const yayinTarihi =
    d.durum === "yayinda" && current?.durum !== "yayinda"
      ? new Date().toISOString()
      : (current?.yayin_tarihi ?? null);

  const { error } = await supabase
    .from("blog_posts")
    .update({
      ...d,
      seo_baslik: emptyToNull(d.seo_baslik),
      ozet: emptyToNull(d.ozet),
      kapak_url: emptyToNull(d.kapak_url),
      yayin_tarihi: yayinTarihi,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { ok: false, message: "Bu slug zaten kullanılıyor" };
    return { ok: false, message: error.message };
  }

  revalidateBlog(d.slug);
  if (current?.slug && current.slug !== d.slug) revalidatePath(`/blog/${current.slug}`);
  return {
    ok: true,
    message: d.durum === "yayinda" ? "Kaydedildi ve yayında" : "Kaydedildi (taslak)",
  };
}

export async function deleteBlogPost(id: string): Promise<void> {
  const supabase = await createClient();
  const { data } = await supabase.from("blog_posts").select("slug").eq("id", id).single();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateBlog(data?.slug);
  redirect("/admin/blog?silindi=1");
}
