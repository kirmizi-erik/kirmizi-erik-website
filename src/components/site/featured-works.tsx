import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { parseVideoUrl } from "@/lib/embed";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

type WorkCardProps = {
  baslik?: string;
  musteri_adi?: string | null;
  kategori?: string[] | null;
  kapak_url?: string | null;
  kapak_video_url?: string | null;
  slug?: string;
  placeholder?: boolean;
};

/**
 * Tek standart kart: 16:9 aspect, hover'da mp4 oynar (varsa) veya zoom efekti.
 * Tüm kartlar aynı boyut → desktop'ta yan yana 2 kart, mobilde 1 kart.
 */
function WorkCard({
  baslik,
  musteri_adi,
  kategori,
  kapak_url,
  kapak_video_url,
  slug,
  placeholder,
}: WorkCardProps) {
  const v = parseVideoUrl(kapak_video_url);
  const ytThumb = v?.kind === "youtube" ? v.thumbnail : null;
  const directVideo = v?.kind === "direct" ? v.url : null;
  const effectiveKapak = kapak_url ?? ytThumb;

  const inner = (
    <div
      className={cn(
        "group relative aspect-video overflow-hidden rounded-2xl border",
        placeholder
          ? "border-border/40 bg-card/30"
          : "border-border/60 bg-muted/40 hover:border-foreground/30 transition-colors",
      )}
    >
      {directVideo ? (
        <video
          src={directVideo}
          poster={effectiveKapak ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        />
      ) : null}

      {effectiveKapak && !placeholder ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={effectiveKapak}
          alt={baslik ?? ""}
          className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          loading="lazy"
        />
      ) : null}

      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 sm:p-6">
        {placeholder ? (
          <div className="text-muted-foreground/70 inline-flex items-center gap-2 text-[10px] tracking-widest uppercase">
            <span className="bg-muted-foreground/40 size-1.5 rounded-full" />
            Yakında
          </div>
        ) : (
          <>
            {kategori && kategori.length > 0 ? (
              <div className="text-foreground/70 text-[10px] tracking-widest uppercase">
                {kategori.slice(0, 2).join(" · ")}
              </div>
            ) : null}
            <div className="mt-2 flex items-end justify-between gap-3">
              <div className="min-w-0">
                {musteri_adi ? (
                  <div className="text-muted-foreground text-xs">{musteri_adi}</div>
                ) : null}
                <h3 className="text-foreground mt-0.5 truncate text-lg font-semibold tracking-tight sm:text-xl">
                  {baslik}
                </h3>
              </div>
              <ArrowUpRight className="text-foreground size-5 shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            </div>
          </>
        )}
      </div>
    </div>
  );

  if (placeholder || !slug) return inner;
  return (
    <Link href={`/calismalar/${slug}`} aria-label={baslik}>
      {inner}
    </Link>
  );
}

export async function FeaturedWorks() {
  const supabase = await createClient();
  const { data: works } = await supabase
    .from("case_studies")
    .select("slug, baslik, musteri_adi, kategori, kapak_url, kapak_video_url")
    .eq("durum", "yayinda")
    .eq("one_cikan", true)
    .order("yayin_tarihi", { ascending: false, nullsFirst: false })
    .limit(4);

  // 4 slot — boş olanlar placeholder
  const placeholderSayisi = Math.max(0, 4 - (works?.length ?? 0));
  const placeholders = Array.from({ length: placeholderSayisi });
  const hicYok = (works?.length ?? 0) === 0;

  return (
    <section
      id="calismalar"
      className="border-border/40 mx-auto max-w-screen-2xl border-t px-4 py-24 sm:px-6 lg:px-10 lg:py-32"
    >
      <div className="mb-14 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-7">
          <div className="text-muted-foreground inline-flex items-center gap-3 text-xs tracking-widest uppercase">
            <span className="bg-brand size-1.5 rounded-full" />
            Çalışmalarımız
          </div>
          <h2 className="font-heading mt-5 text-4xl leading-tight font-black sm:text-5xl lg:text-6xl">
            Son <span className="text-brand">işlerimiz</span>
            <br />
            kendileri konuşur.
          </h2>
        </div>
        <div className="flex md:col-span-5 md:items-end md:justify-end">
          <Button asChild variant="ghost" size="lg">
            <Link href="/calismalar">
              Hepsini gör
              <ArrowUpRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Standart 2-sütun grid — desktop'ta yan yana 2 kart, mobil 1 */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {works?.map((w) => (
          <WorkCard
            key={w.slug}
            baslik={w.baslik}
            musteri_adi={w.musteri_adi}
            kategori={w.kategori}
            kapak_url={w.kapak_url}
            kapak_video_url={w.kapak_video_url}
            slug={w.slug}
          />
        ))}
        {placeholders.map((_, i) => (
          <WorkCard key={`ph-${i}`} placeholder />
        ))}
      </div>

      {hicYok ? (
        <p className="text-muted-foreground mt-10 text-center text-sm">
          Çalışmalar admin panelinden yayına alındıkça bu alanı doldurur.
        </p>
      ) : null}
    </section>
  );
}
