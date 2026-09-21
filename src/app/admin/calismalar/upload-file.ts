import { createClient } from "@/lib/supabase/client";

import { createUploadUrl, finalizeUpload, type ActionResult } from "./actions";

/**
 * Dosyayı Vercel'i atlayarak doğrudan Supabase'e yükler, ardından sunucuda
 * optimize ettirir (görsel → webp, uzun kenar ≤ 2000 px). Video olduğu gibi kalır.
 */
export async function uploadFile(file: File): Promise<ActionResult<{ url: string; path: string }>> {
  const contentType = file.type || "application/octet-stream";

  const ticket = await createUploadUrl(file.name, contentType, file.size);
  if (!ticket.ok) return ticket;

  const { path, token } = ticket.data!;
  const { error } = await createClient()
    .storage.from("case-media")
    .uploadToSignedUrl(path, token, file, { contentType, cacheControl: "31536000" });
  if (error) return { ok: false, error: `Yüklenemedi: ${error.message}` };

  return finalizeUpload(path, contentType);
}
