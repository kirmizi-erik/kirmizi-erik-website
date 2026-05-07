import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/site/markdown";
import { ShareButtons } from "@/components/site/share-buttons";
import { parseVideoUrl } from "@/lib/embed";
import { createClient } from "@/lib/supabase/server";
import { kategoriOptions } from "@/lib/validations/case-study";
import type { Metrik } from "@/lib/validations/case-study";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("case_studies")
    .select("baslik, ozet, kapak_url")
    .eq("slug", slug)
    .eq("durum", "yayinda")
    .single();
  if (!data) return { title: "Çalışma bulunamadı" };
  return {
    title: data.baslik,
    description: data.ozet ?? undefined,
    openGraph: data.kapak_url ? { images: [data.kapak_url] } : undefined,
  };
}

function kategoriLabel(slug: string): string {
  return kategoriOptions.find((o) => o.value === slug)?.label ?? slug;
}

function formatTarih(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function CalismaDetayPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: w } = await supabase
    .from("case_studies")
    .select("*")
    .eq("slug", slug)
    .eq("durum", "yayinda")
    .single();

  if (!w) notFound();

  const metrikler = (w.metrikler ?? []) as Metrik[];
  const video = parseVideoUrl(w.kapak_video_url);
  const yayinTarihi = formatTarih(w.yayin_tarihi);

  return (
    <article className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
      {/* Geri linki */}
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href="/calismalar">
          <ArrowLeft className="mr-1 size-4" />
          Tüm çalışmalar
        </Link>
      </Button>

      {/* VİDEO — büyük, ortalı, max-w-4xl (YouTube watch sayfası ölçüsü) */}
      <div className="mx-auto max-w-4xl">
        {video || w.kapak_url ? (
          <div className="border-border bg-muted/30 relative aspect-video overflow-hidden rounded-2xl border">
            {video?.kind === "youtube" ? (
              <iframe
                src={video.embedUrl}
                title={w.baslik}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 size-full"
              />
            ) : video?.kind === "vimeo" ? (
              <iframe
                src={video.embedUrl}
                title={w.baslik}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 size-full"
              />
            ) : video?.kind === "direct" ? (
              <video
                src={video.url}
                poster={w.kapak_url ?? undefined}
                controls
                playsInline
                preload="metadata"
                className="absolute inset-0 size-full object-cover"
              />
            ) : w.kapak_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={w.kapak_url}
                alt={w.baslik}
                className="absolute inset-0 size-full object-cover"
              />
            ) : null}
          </div>
        ) : null}
      </div>

      {/* YouTube tarzı info row: başlık + müşteri/kategori + paylaş butonları */}
      <div className="mx-auto mt-6 max-w-4xl">
        <h1 className="font-heading text-2xl leading-tight font-bold tracking-tight sm:text-3xl lg:text-4xl">
          {w.baslik}
        </h1>

        <div className="border-border/40 mt-4 flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Sol: müşteri + kategori chip'leri */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {w.musteri_adi ? (
              <span className="font-medium">{w.musteri_adi}</span>
            ) : null}
            {w.musteri_adi && w.kategori && w.kategori.length > 0 ? (
              <span className="text-muted-foreground/40">·</span>
            ) : null}
            {w.kategori && w.kategori.length > 0
              ? w.kategori.map((k: string) => (
                  <span
                    key={k}
                    className="bg-muted text-foreground/80 rounded-full px-2.5 py-0.5 text-xs"
                  >
                    {kategoriLabel(k)}
                  </span>
                ))
              : null}
            {yayinTarihi ? (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                  <Calendar className="size-3" />
                  {yayinTarihi}
                </span>
              </>
            ) : null}
          </div>

          {/* Sağ: paylaş butonları */}
          <ShareButtons
            title={w.baslik}
            description={w.ozet ?? undefined}
            path={`/calismalar/${w.slug}`}
          />
        </div>

        {/* Özet — YouTube açıklama paneli gibi */}
        {w.ozet ? (
          <div className="bg-muted/40 mt-4 rounded-2xl p-5">
            <p className="text-foreground/90 text-sm leading-relaxed sm:text-base">
              {w.ozet}
            </p>
          </div>
        ) : null}

        {/* Metrikler — varsa kompakt grid */}
        {metrikler.length > 0 ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metrikler.map((m, i) => (
              <div
                key={i}
                className="border-border/60 from-card/60 rounded-xl border bg-gradient-to-br to-transparent p-4"
              >
                <div className="text-brand text-2xl font-bold tracking-tight">
                  {m.value}
                </div>
                <div className="text-muted-foreground mt-0.5 text-xs tracking-wider uppercase">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Problem / Çözüm / Sonuç — okunabilir kolon */}
      {w.problem || w.cozum || w.sonuc ? (
        <section className="mx-auto mt-16 max-w-3xl space-y-12">
          {w.problem ? (
            <div>
              <div className="text-muted-foreground mb-3 inline-flex items-center gap-3 text-xs tracking-widest uppercase">
                <span className="bg-brand size-1.5 rounded-full" />
                Problem
              </div>
              <Markdown>{w.problem}</Markdown>
            </div>
          ) : null}
          {w.cozum ? (
            <div>
              <div className="text-muted-foreground mb-3 inline-flex items-center gap-3 text-xs tracking-widest uppercase">
                <span className="bg-brand-mor size-1.5 rounded-full" />
                Çözüm
              </div>
              <Markdown>{w.cozum}</Markdown>
            </div>
          ) : null}
          {w.sonuc ? (
            <div>
              <div className="text-muted-foreground mb-3 inline-flex items-center gap-3 text-xs tracking-widest uppercase">
                <span className="bg-brand-yaprak size-1.5 rounded-full" />
                Sonuç
              </div>
              <Markdown>{w.sonuc}</Markdown>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Galeri */}
      {w.galeri_urls && w.galeri_urls.length > 0 ? (
        <section className="border-border/40 mx-auto mt-20 max-w-5xl border-t pt-12">
          <div className="text-muted-foreground mb-6 inline-flex items-center gap-3 text-xs tracking-widest uppercase">
            <span className="bg-brand size-1.5 rounded-full" />
            Galeri
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {w.galeri_urls.map((url: string) => (
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

      {/* Ekip */}
      {w.ekip_krediler && w.ekip_krediler.length > 0 ? (
        <section className="border-border/40 mx-auto mt-12 max-w-3xl border-t pt-10">
          <div className="text-muted-foreground mb-4 inline-flex items-center gap-3 text-xs tracking-widest uppercase">
            <span className="bg-brand size-1.5 rounded-full" />
            Ekip
          </div>
          <ul className="divide-border/40 divide-y">
            {w.ekip_krediler.map((k: string, i: number) => (
              <li key={i} className="text-foreground py-2.5 text-sm">
                {k}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Alt CTA */}
      <section className="border-border/40 mx-auto mt-16 max-w-4xl border-t pt-12">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="font-heading text-xl leading-tight font-black tracking-tight sm:text-2xl">
            Sıradaki büyük fikir <span className="text-brand-mor">senin mi?</span>
          </h2>
          <Button asChild>
            <Link href="/iletisim">
              Brief paylaş
              <ArrowUpRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </article>
  );
}
