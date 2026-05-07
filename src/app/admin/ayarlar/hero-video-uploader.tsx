"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { IMAGE_GUIDELINES, MAX_VIDEO_SIZE_MB } from "@/lib/upload-limits";

import { uploadMedia } from "../calismalar/actions";

type Props = {
  name: string;
  defaultValue?: string | null;
};

/**
 * Site Settings'te kullanılan birleşik medya alanı:
 * - URL girilebilir (YouTube/Vimeo/direct mp4)
 * - Veya dosya yüklenir (Supabase Storage 'case-media' bucket'ına)
 */
export function HeroVideoUploader({ name, defaultValue }: Props) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadMedia(fd);
    setBusy(false);

    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setUrl(res.data!.url);
    toast.success("Video yüklendi");
  };

  return (
    <div className="space-y-2">
      <Input
        type="url"
        name={name}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://youtube.com/watch?v=... veya https://...mp4"
      />
      <div className="text-muted-foreground space-y-0.5 text-xs">
        <div>
          <strong>Önerilen:</strong> {IMAGE_GUIDELINES.hero.recommended} ·{" "}
          {IMAGE_GUIDELINES.hero.aspect}
        </div>
        <div>
          Max {MAX_VIDEO_SIZE_MB} MB · mp4/webm · YouTube/Vimeo URL de kabul edilir.{" "}
          {IMAGE_GUIDELINES.hero.note}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="bg-muted/40 hover:bg-muted/60 inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-xs">
          <Upload className="size-3.5" />
          {busy ? "Yükleniyor..." : "Video yükle"}
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleUpload}
            disabled={busy}
          />
        </label>
        {url ? (
          <button
            type="button"
            onClick={() => setUrl("")}
            className="text-muted-foreground hover:text-destructive inline-flex items-center gap-1 text-xs"
          >
            <X className="size-3.5" />
            Temizle
          </button>
        ) : null}
      </div>
    </div>
  );
}
