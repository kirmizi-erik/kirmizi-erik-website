"use client";

import { useEffect } from "react";
import { Calendar, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/site/markdown";
import { parseVideoUrl } from "@/lib/embed";
import { kategoriOptions } from "@/lib/validations/case-study";

type PreviewData = {
  baslik: string;
  slug: string;
  ozet: string;
  musteri_adi: string;
  sektor: string;
  kategori: string[];
  kapak_url: string;
  kapak_video_url: string;
  aciklama: string;
  galeri_urls: string[];
};

type Props = {
  data: PreviewData;
  onClose: () => void;
};

function kategoriLabel(slug: string): string {
  return kategoriOptions.find((o) => o.value === slug)?.label ?? slug;
}

export function CasePreviewModal({ data, onClose }: Props) {
  // Esc ile kapat + body scroll lock
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const video = parseVideoUrl(data.kapak_video_url);
  const yayinTarihi = new Date().toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Üst bar */}
      <div className="border-border/60 bg-background flex items-center justify-between border-b px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="bg-brand size-1.5 rounded-full" />
          <span className="text-foreground text-sm font-medium tracking-wider uppercase">
            Önizleme — yayında nasıl görünür
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="mr-1 size-4" />
          Kapat
        </Button>
      </div>

      {/* Scroll edilebilir içerik */}
      <div
        className="bg-background flex-1 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <article className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
          {/* Video / kapak */}
          <div className="mx-auto max-w-4xl">
            {video || data.kapak_url ? (
              <div className="border-border bg-muted/30 relative aspect-video overflow-hidden rounded-2xl border">
                {video?.kind === "youtube" ? (
                  <iframe
                    src={video.embedUrl}
                    title={data.baslik}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 size-full"
                  />
                ) : video?.kind === "vimeo" ? (
                  <iframe
                    src={video.embedUrl}
                    title={data.baslik}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 size-full"
                  />
                ) : video?.kind === "direct" ? (
                  <video
                    src={video.url}
                    poster={data.kapak_url || undefined}
                    controls
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 size-full object-cover"
                  />
                ) : data.kapak_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={data.kapak_url}
                    alt={data.baslik}
                    className="absolute inset-0 size-full object-cover"
                  />
                ) : null}
              </div>
            ) : (
              <div className="border-border bg-muted/20 text-muted-foreground relative aspect-video overflow-hidden rounded-2xl border flex items-center justify-center text-sm">
                Kapak görseli/videosu yok
              </div>
            )}
          </div>

          {/* Başlık + meta */}
          <div className="mx-auto mt-6 max-w-4xl">
            <h1 className="font-heading text-2xl leading-tight font-bold tracking-tight sm:text-3xl lg:text-4xl">
              {data.baslik || "(Başlık yok)"}
            </h1>

            <div className="border-border/40 mt-4 flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {data.musteri_adi ? (
                  <span className="font-medium">{data.musteri_adi}</span>
                ) : null}
                {data.musteri_adi && data.kategori.length > 0 ? (
                  <span className="text-muted-foreground/40">·</span>
                ) : null}
                {data.kategori.map((k) => (
                  <span
                    key={k}
                    className="bg-muted text-foreground/80 rounded-full px-2.5 py-0.5 text-xs"
                  >
                    {kategoriLabel(k)}
                  </span>
                ))}
                <span className="text-muted-foreground/40">·</span>
                <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                  <Calendar className="size-3" />
                  {yayinTarihi}
                </span>
              </div>
            </div>

            {data.ozet ? (
              <div className="bg-muted/40 mt-4 rounded-2xl p-5">
                <p className="text-foreground/90 text-sm leading-relaxed sm:text-base">
                  {data.ozet}
                </p>
              </div>
            ) : null}
          </div>

          {/* Açıklama */}
          {data.aciklama ? (
            <section className="mx-auto mt-12 max-w-3xl">
              <Markdown>{data.aciklama}</Markdown>
            </section>
          ) : null}

          {/* Galeri */}
          {data.galeri_urls.length > 0 ? (
            <section className="border-border/40 mx-auto mt-16 max-w-5xl border-t pt-12">
              <div className="text-muted-foreground mb-6 inline-flex items-center gap-3 text-xs tracking-widest uppercase">
                <span className="bg-brand size-1.5 rounded-full" />
                Galeri
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {data.galeri_urls.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt=""
                    loading="lazy"
                    className="border-border w-full rounded-lg border"
                  />
                ))}
              </div>
            </section>
          ) : null}
        </article>
      </div>
    </div>
  );
}
