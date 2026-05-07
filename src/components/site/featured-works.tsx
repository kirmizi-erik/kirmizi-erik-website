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
  spanLg?: number; // grid kaç kolon kaplasın (lg: 4 / 8 / 12 üzerinden)
};

function WorkCard({
  baslik,
  musteri_adi,
  kategori,
  kapak_url,
  kapak_video_url,
  slug,
  placeholder,
  spanLg = 6,
}: WorkCardProps) {
  const v = parseVideoUrl(kapak_video_url);
  const ytThumb = v?.kind === "youtube" ? v.thumbnail : null;
  // YouTube/Vimeo embed liste/grid'de hover preview olarak otomatik oynatılmaz —
  // thumbnail göster, klik ile detay sayfada izlenir. Sadece direct mp4 hover'da oynar.
  const directVideo = v?.kind === "direct" ? v.url : null;
  const effectiveKapak = kapak_url ?? ytThumb;

  const inner = (
    <div
      className={cn(
        "group relative aspect-[4/3] overflow-hidden rounded-2xl border",
        placeholder
          ? "border-border/40 bg-card/30"
          : "border-border/60 bg-muted/40 hover:border-foreground/30 transition-colors",
      )}
    >
      {/* Direct mp4 → hover'da oynat */}
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

      {/* Karartma + içerik */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6">
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
              <div>
                {musteri_adi ? (
                  <div className="text-muted-foreground text-xs">
                    {musteri_adi}
                  </div>
                ) : null}
                <h3 className="text-foreground mt-0.5 text-xl font-semibold tracking-tight sm:text-2xl">
                  {baslik}
                </h3>
              </div>
              <ArrowUpRight className="text-foreground size-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        spanLg === 4
          ? "lg:col-span-4"
          : spanLg === 8
            ? "lg:col-span-8"
            : spanLg === 12
              ? "lg:col-span-12"
              : "lg:col-span-6",
        "col-span-12 md:col-span-6",
      )}
    >
      {placeholder || !slug ? (
        inner
      ) : (
        <Link href={`/calismalar/${slug}`} aria-label={baslik}>
          {inner}
        </Link>
      )}
    </div>
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
    .limit(6);

  // Asimetrik grid layout — kaç placeholder veya gerçek olduğuna göre.
  const layoutSpans = [8, 4, 4, 8, 6, 6]; // 6 slot

  const placeholderSayisi = Math.max(0, 6 - (works?.length ?? 0));
  const placeholders = Array.from({ length: placeholderSayisi });

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

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {works?.map((w, i) => (
          <WorkCard
            key={w.slug}
            baslik={w.baslik}
            musteri_adi={w.musteri_adi}
            kategori={w.kategori}
            kapak_url={w.kapak_url}
            kapak_video_url={w.kapak_video_url}
            slug={w.slug}
            spanLg={layoutSpans[i] ?? 6}
          />
        ))}
        {placeholders.map((_, i) => (
          <WorkCard
            key={`ph-${i}`}
            placeholder
            spanLg={layoutSpans[(works?.length ?? 0) + i] ?? 6}
          />
        ))}
      </div>

      {placeholderSayisi === 6 ? (
        <p className="text-muted-foreground mt-10 text-center text-sm">
          Çalışmalar admin panelinden yayına alındıkça bu alanı doldurur.
        </p>
      ) : null}
    </section>
  );
}
