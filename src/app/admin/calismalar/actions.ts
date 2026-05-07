"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { MAX_IMAGE_SIZE_MB, MAX_VIDEO_SIZE_MB } from "@/lib/upload-limits";
import {
  caseStudyInputSchema,
  type CaseStudyInput,
} from "@/lib/validations/case-study";

export type ActionResult<T = void> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string };

function emptyToNull(s: unknown) {
  if (typeof s !== "string") return null;
  const t = s.trim();
  return t.length === 0 ? null : t;
}

function parseFromFormData(formData: FormData): CaseStudyInput {
  const metriklerRaw = formData.get("metrikler") as string | null;
  const ekipRaw = formData.get("ekip_krediler") as string | null;
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
    problem: String(formData.get("problem") ?? ""),
    cozum: String(formData.get("cozum") ?? ""),
    sonuc: String(formData.get("sonuc") ?? ""),
    metrikler: parseJsonArray(metriklerRaw),
    ekip_krediler: parseJsonArray(ekipRaw),
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
    problem: emptyToNull(input.problem),
    cozum: emptyToNull(input.cozum),
    sonuc: emptyToNull(input.sonuc),
    metrikler: input.metrikler,
    ekip_krediler: input.ekip_krediler,
    galeri_urls: input.galeri_urls,
    durum: input.durum,
    one_cikan: input.one_cikan,
    yayin_tarihi: input.durum === "yayinda" ? new Date().toISOString() : null,
  };
}

export async function createCaseStudy(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const input = parseFromFormData(formData);
  const parsed = caseStudyInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Geçersiz veri" };
  }

  const supabase = await createClient();
  const row = normalizeForDb(parsed.data);
  const { data, error } = await supabase
    .from("case_studies")
    .insert(row)
    .select("id")
    .single();

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

export async function updateCaseStudy(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
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
    yayin_tarihi: yayinDegisiyor
      ? new Date().toISOString()
      : (current?.yayin_tarihi ?? null),
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

export async function uploadMedia(
  formData: FormData,
): Promise<ActionResult<{ url: string; path: string }>> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Dosya bulunamadı" };
  }

  const isVideo = file.type.startsWith("video/");
  const maxMB = isVideo ? MAX_VIDEO_SIZE_MB : MAX_IMAGE_SIZE_MB;
  const maxBytes = maxMB * 1024 * 1024;
  if (file.size > maxBytes) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1);
    return {
      ok: false,
      error: `Dosya çok büyük (${sizeMB} MB). ${isVideo ? "Video" : "Görsel"} için maksimum ${maxMB} MB.`,
    };
  }

  const supabase = await createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const safe = file.name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const path = `${Date.now()}-${safe || "media"}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("case-media")
    .upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type || undefined,
    });
  if (upErr) return { ok: false, error: upErr.message };

  const { data: pub } = supabase.storage.from("case-media").getPublicUrl(path);
  return { ok: true, data: { url: pub.publicUrl, path } };
}
