import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/site/markdown";
import { createClient } from "@/lib/supabase/server";
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

  return (
    <article>
      {/* Hero — kapak + başlık */}
      <header className="border-border/40 mx-auto max-w-screen-2xl border-b px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-24">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link href="/calismalar">
            <ArrowLeft className="mr-1 size-4" />
            Tüm çalışmalar
          </Link>
        </Button>

        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            {w.musteri_adi ? (
              <div className="text-muted-foreground text-xs tracking-widest uppercase">
                {w.musteri_adi}
                {w.sektor ? ` · ${w.sektor}` : ""}
              </div>
            ) : null}
            <h1 className="font-heading mt-3 text-4xl leading-[1.05] font-black tracking-tight sm:text-6xl lg:text-7xl">
              {w.baslik}
            </h1>
            {w.ozet ? (
              <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed">
                {w.ozet}
              </p>
            ) : null}
            {w.kategori && w.kategori.length ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {w.kategori.map((k: string) => (
                  <span
                    key={k}
                    className="border-border text-muted-foreground rounded-full border px-3 py-1 text-xs tracking-wider uppercase"
                  >
                    {k}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {/* Metrikler sağda */}
          {metrikler.length > 0 ? (
            <aside className="md:col-span-5 md:self-end">
              <div className="grid gap-3 sm:grid-cols-2">
                {metrikler.map((m, i) => (
                  <div
                    key={i}
                    className="border-border/60 from-card/60 rounded-2xl border bg-gradient-to-br to-transparent p-5"
                  >
                    <div className="text-brand text-3xl font-bold tracking-tight">
                      {m.value}
                    </div>
                    <div className="text-muted-foreground mt-1 text-xs tracking-wider uppercase">
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          ) : null}
        </div>
      </header>

      {/* Kapak görsel/video */}
      {w.kapak_url || w.kapak_video_url ? (
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10">
          <div className="border-border bg-muted/30 relative -mt-px aspect-[16/9] overflow-hidden">
            {w.kapak_video_url ? (
              <video
                src={w.kapak_video_url}
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
        </div>
      ) : null}

      {/* Problem / Çözüm / Sonuç (markdown) */}
      <section className="mx-auto max-w-screen-md space-y-16 px-4 py-20 sm:px-6 lg:py-28">
        {w.problem ? (
          <div>
            <div className="text-muted-foreground mb-4 inline-flex items-center gap-3 text-xs tracking-widest uppercase">
              <span className="bg-brand size-1.5 rounded-full" />
              Problem
            </div>
            <Markdown>{w.problem}</Markdown>
          </div>
        ) : null}

        {w.cozum ? (
          <div>
            <div className="text-muted-foreground mb-4 inline-flex items-center gap-3 text-xs tracking-widest uppercase">
              <span className="bg-brand-mor size-1.5 rounded-full" />
              Çözüm
            </div>
            <Markdown>{w.cozum}</Markdown>
          </div>
        ) : null}

        {w.sonuc ? (
          <div>
            <div className="text-muted-foreground mb-4 inline-flex items-center gap-3 text-xs tracking-widest uppercase">
              <span className="bg-brand-yaprak size-1.5 rounded-full" />
              Sonuç
            </div>
            <Markdown>{w.sonuc}</Markdown>
          </div>
        ) : null}
      </section>

      {/* Galeri */}
      {w.galeri_urls && w.galeri_urls.length > 0 ? (
        <section className="border-border/40 border-t">
          <div className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-10">
            <div className="text-muted-foreground mb-8 inline-flex items-center gap-3 text-xs tracking-widest uppercase">
              <span className="bg-brand size-1.5 rounded-full" />
              Galeri
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
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
          </div>
        </section>
      ) : null}

      {/* Ekip kredileri */}
      {w.ekip_krediler && w.ekip_krediler.length > 0 ? (
        <section className="border-border/40 border-t">
          <div className="mx-auto max-w-screen-md px-4 py-16 sm:px-6">
            <div className="text-muted-foreground mb-6 inline-flex items-center gap-3 text-xs tracking-widest uppercase">
              <span className="bg-brand size-1.5 rounded-full" />
              Ekip
            </div>
            <ul className="divide-border/40 divide-y">
              {w.ekip_krediler.map((k: string, i: number) => (
                <li key={i} className="text-foreground py-3 text-sm">
                  {k}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="border-border/40 border-t">
        <div className="mx-auto flex max-w-screen-2xl flex-col items-start justify-between gap-6 px-4 py-16 sm:flex-row sm:items-center sm:px-6 lg:px-10">
          <h2 className="font-heading max-w-xl text-2xl leading-tight font-black tracking-tight sm:text-3xl">
            Sıradaki büyük fikir <span className="text-brand-mor">senin mi?</span>
          </h2>
          <Button asChild size="lg">
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
