"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { optimizeUpload } from "@/lib/image";
import { createClient } from "@/lib/supabase/server";
import { MAX_IMAGE_SIZE_MB, MAX_VIDEO_SIZE_MB } from "@/lib/upload-limits";
import { caseStudyInputSchema, type CaseStudyInput } from "@/lib/validations/case-study";

export type ActionResult<T = void> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string };

function emptyToNull(s: unknown) {
  if (typeof s !== "string") return null;
  const t = s.trim();
  return t.length === 0 ? null : t;
}

function parseFromFormData(formData: FormData): CaseStudyInput {
  const galeriRaw = formData.get("galeri_urls") as string | null;

  const parseJsonArray = (raw: string | null) => {
    if (!raw) return [];
    try {
      const v = JSON.parse(raw);
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  };

  return {
    baslik: String(formData.get("baslik") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    ozet: String(formData.get("ozet") ?? "").trim(),
    musteri_adi: String(formData.get("musteri_adi") ?? "").trim(),
    sektor: String(formData.get("sektor") ?? "").trim(),
    kategori: formData.getAll("kategori").map(String).filter(Boolean),
    kapak_url: String(formData.get("kapak_url") ?? "").trim(),
    kapak_video_url: String(formData.get("kapak_video_url") ?? "").trim(),
    aciklama: String(formData.get("aciklama") ?? ""),
    galeri_urls: parseJsonArray(galeriRaw),
    durum: (formData.get("durum") as CaseStudyInput["durum"]) ?? "taslak",
    one_cikan: formData.get("one_cikan") === "on" || formData.get("one_cikan") === "true",
  };
}

function normalizeForDb(input: CaseStudyInput) {
  return {
    baslik: input.baslik,
    slug: input.slug,
    ozet: emptyToNull(input.ozet),
    musteri_adi: emptyToNull(input.musteri_adi),
    sektor: emptyToNull(input.sektor),
    kategori: input.kategori,
    kapak_url: emptyToNull(input.kapak_url),
    kapak_video_url: emptyToNull(input.kapak_video_url),
    aciklama: emptyToNull(input.aciklama),
    galeri_urls: input.galeri_urls,
    durum: input.durum,
    one_cikan: input.one_cikan,
    yayin_tarihi: input.durum === "yayinda" ? new Date().toISOString() : null,
  };
}

export async function createCaseStudy(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const input = parseFromFormData(formData);
  const parsed = caseStudyInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Geçersiz veri" };
  }

  const supabase = await createClient();
  const row = normalizeForDb(parsed.data);
  const { data, error } = await supabase.from("case_studies").insert(row).select("id").single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Bu slug zaten kullanılıyor" };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/calismalar");
  revalidatePath("/calismalar");
  revalidatePath("/");
  redirect(`/admin/calismalar/${data.id}/duzenle`);
}

export async function updateCaseStudy(id: string, formData: FormData): Promise<ActionResult> {
  const input = parseFromFormData(formData);
  const parsed = caseStudyInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Geçersiz veri" };
  }

  const supabase = await createClient();
  const row = normalizeForDb(parsed.data);

  // yayin_tarihi'ni sadece taslak → yayinda geçişinde set et
  const { data: current } = await supabase
    .from("case_studies")
    .select("durum, yayin_tarihi")
    .eq("id", id)
    .single();

  const yayinDegisiyor = current?.durum !== "yayinda" && row.durum === "yayinda";
  const finalRow = {
    ...row,
    yayin_tarihi: yayinDegisiyor ? new Date().toISOString() : (current?.yayin_tarihi ?? null),
  };

  const { error } = await supabase.from("case_studies").update(finalRow).eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Bu slug zaten kullanılıyor" };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/calismalar");
  revalidatePath(`/admin/calismalar/${id}/duzenle`);
  revalidatePath("/calismalar");
  revalidatePath(`/calismalar/${parsed.data.slug}`);
  revalidatePath("/");
  return { ok: true, message: "Çalışma kaydedildi" };
}

export async function deleteCaseStudy(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("case_studies").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/calismalar");
  revalidatePath("/calismalar");
  revalidatePath("/");
  redirect("/admin/calismalar");
}

/*
 * Yükleme iki adımda: dosya baytları Vercel'den GEÇMEZ.
 * Vercel fonksiyonları istek gövdesini 4.5 MB'ta keser (413) — bu yüzden
 * tarayıcı dosyayı imzalı URL ile doğrudan Supabase'e yükler, sunucu ardından
 * görseli Supabase'den çekip optimize eder. Böylece büyük kamera fotoğrafları
 * ve videolar da sorunsuz yüklenir.
 */

const BUCKET = "case-media";
const STORAGE_PATH = /^\d{13}-[a-z0-9-]{1,60}\.[a-z0-9]{1,5}$/;

export async function createUploadUrl(
  filename: string,
  contentType: string,
  size: number,
): Promise<ActionResult<{ path: string; token: string }>> {
  const isVideo = contentType.startsWith("video/");
  const isImage = contentType.startsWith("image/");
  if (!isVideo && !isImage) {
    return { ok: false, error: "Yalnızca görsel veya video yüklenebilir." };
  }

  const maxMB = isVideo ? MAX_VIDEO_SIZE_MB : MAX_IMAGE_SIZE_MB;
  if (size <= 0 || size > maxMB * 1024 * 1024) {
    const sizeMB = (size / 1024 / 1024).toFixed(1);
    return {
      ok: false,
      error: `Dosya çok büyük (${sizeMB} MB). ${isVideo ? "Video" : "Görsel"} için maksimum ${maxMB} MB.`,
    };
  }

  const safe =
    filename
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "media";
  const ext =
    (filename.split(".").pop() ?? "bin")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 5) || "bin";
  const path = `${Date.now()}-${safe}.${ext}`;

  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) {
    console.error("[createUploadUrl]", error?.message);
    return { ok: false, error: `Yükleme başlatılamadı: ${error?.message ?? "bilinmeyen hata"}` };
  }
  return { ok: true, data: { path: data.path, token: data.token } };
}

export async function finalizeUpload(
  path: string,
  contentType: string,
): Promise<ActionResult<{ url: string; path: string }>> {
  if (!STORAGE_PATH.test(path)) {
    return { ok: false, error: "Geçersiz dosya yolu." };
  }

  const supabase = await createClient();
  const publicUrl = (p: string) => supabase.storage.from(BUCKET).getPublicUrl(p).data.publicUrl;

  if (!contentType.startsWith("image/")) {
    return { ok: true, data: { url: publicUrl(path), path } };
  }

  try {
    const { data: blob, error: dlErr } = await supabase.storage.from(BUCKET).download(path);
    if (dlErr || !blob) throw new Error(dlErr?.message ?? "indirilemedi");

    const original = Buffer.from(await blob.arrayBuffer());
    const optimized = await optimizeUpload(original, path, contentType);

    // SVG/GIF veya optimize edilemeyen görsel: yüklenen dosya olduğu gibi kalır.
    if (optimized.buffer === original) {
      return { ok: true, data: { url: publicUrl(path), path } };
    }

    // Zaten webp yüklendiyse ad değişmez — aynı yolun üzerine yazılır.
    const sameFile = optimized.filename === path;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(optimized.filename, optimized.buffer, {
        cacheControl: "31536000",
        upsert: sameFile,
        contentType: optimized.contentType,
      });
    if (upErr) throw new Error(upErr.message);

    if (!sameFile)
      await supabase.storage
        .from(BUCKET)
        .remove([path])
        .catch(() => {});

    return { ok: true, data: { url: publicUrl(optimized.filename), path: optimized.filename } };
  } catch (err) {
    // Optimizasyon patlasa bile ham dosya zaten yüklü — onu kullan, yükleme boşa gitmesin.
    console.warn("[finalizeUpload] optimize edilemedi, orijinal kullanılıyor", err);
    return { ok: true, data: { url: publicUrl(path), path } };
  }
}
