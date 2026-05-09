import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { parseVideoUrl } from "@/lib/embed";
import { createClient } from "@/lib/supabase/server";
import { kategoriOptions } from "@/lib/validations/case-study";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Çalışmalar",
  description: "Kırmızı Erik portföyü — yayınlanan tüm çalışmalar.",
};

type SearchParams = Promise<{ kategori?: string }>;

export default async function CalismalarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const aktif = params.kategori;

  const supabase = await createClient();
  let query = supabase
    .from("case_studies")
    .select("slug, baslik, ozet, musteri_adi, kategori, kapak_url, kapak_video_url, sektor")
    .eq("durum", "yayinda")
    .order("yayin_tarihi", { ascending: false, nullsFirst: false });

  if (aktif) {
    query = query.contains("kategori", [aktif]);
  }

  const { data: works } = await query;

  return (
    <article>
      {/* Hero — banner görsel + text overlay (üst), filtre rozetleri (alt) */}
      <header>
        {/* Üst banner — cinema/film stripes atmosfer, sol-altta rozet + başlık */}
        <div className="relative h-56 w-full overflow-hidden sm:h-72 lg:h-96">
          <Image
            src="/hero/calismalar-hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Alt fade — okunabilirlik */}
          <div className="from-background/0 via-background/30 to-background absolute inset-0 bg-gradient-to-b" />
          {/* Sol fade — başlık keskin okunsun */}
          <div className="from-background/70 absolute inset-0 bg-gradient-to-r via-transparent to-transparent" />

          {/* Text overlay — sol-altta */}
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-screen-2xl px-4 pb-6 sm:px-6 lg:px-10 lg:pb-8">
              <div className="grid items-end gap-4 md:grid-cols-12">
                <div className="md:col-span-8">
                  <div className="text-muted-foreground inline-flex items-center gap-3 text-xs tracking-widest uppercase">
                    <span className="bg-brand size-1.5 rounded-full" />
                    Çalışmalar
                  </div>
                  <h1 className="font-heading mt-3 text-4xl leading-[0.95] font-black tracking-tight sm:text-5xl lg:text-6xl">
                    Yaptıklarımız.
                  </h1>
                  {aktif ? (
                    <div className="mt-3 inline-flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Filtre:</span>
                      <span className="bg-brand/10 text-brand border-brand/30 rounded-full border px-3 py-1 text-xs tracking-wider uppercase">
                        {kategoriOptions.find((k) => k.value === aktif)?.label ?? aktif}
                      </span>
                      <Link
                        href="/calismalar"
                        className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-2"
                      >
                        Temizle
                      </Link>
                    </div>
                  ) : null}
                </div>
                <p className="text-muted-foreground md:col-span-4 md:text-right md:text-base">
                  {works?.length ?? 0} çalışma
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Banner altı — filtre rozetleri */}
        <div className="border-border/40 mx-auto max-w-screen-2xl border-b px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div className="flex flex-wrap gap-2">
          <Link
            href="/calismalar"
            className={cn(
              "border-border rounded-full border px-4 py-1.5 text-xs tracking-wider uppercase transition-colors",
              !aktif
                ? "bg-foreground text-background border-foreground"
                : "text-muted-foreground hover:text-foreground hover:border-foreground/40",
            )}
          >
            Hepsi
          </Link>
          {kategoriOptions.map((k) => {
            const active = aktif === k.value;
            return (
              <Link
                key={k.value}
                href={`/calismalar?kategori=${k.value}`}
                className={cn(
                  "border-border rounded-full border px-4 py-1.5 text-xs tracking-wider uppercase transition-colors",
                  active
                    ? "bg-foreground text-background border-foreground"
                    : "text-muted-foreground hover:text-foreground hover:border-foreground/40",
                )}
              >
                {k.label}
              </Link>
            );
          })}
          </div>
        </div>
      </header>

      {/* Liste — açık BG */}
      <div className="bg-muted">
        <section className="mx-auto max-w-screen-2xl px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        {!works || works.length === 0 ? (
          <p className="text-muted-foreground">
            {aktif
              ? "Bu kategoride henüz çalışma yok."
              : "Henüz yayında çalışma yok. Admin panelden eklendikçe burada listelenecek."}
          </p>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {works.map((w) => {
              const video = parseVideoUrl(w.kapak_video_url);
              const directVideo = video?.kind === "direct" ? video.url : null;
              const ytThumb = video?.kind === "youtube" ? video.thumbnail : null;
              const cover = w.kapak_url ?? ytThumb;

              return (
                <Link
                  key={w.slug}
                  href={`/calismalar/${w.slug}`}
                  className="group"
                >
                  <div className="border-border/60 bg-muted/30 hover:border-foreground/30 relative aspect-video overflow-hidden rounded-2xl border transition-colors">
                    {directVideo ? (
                      <video
                        src={directVideo}
                        poster={cover ?? undefined}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                      />
                    ) : null}

                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover}
                        alt=""
                        className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="from-brand/10 absolute inset-0 bg-gradient-to-br to-transparent" />
                    )}

                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 sm:p-6">
                      {w.kategori && w.kategori.length ? (
                        <div className="text-foreground/70 text-[10px] tracking-widest uppercase">
                          {w.kategori.slice(0, 2).join(" · ")}
                        </div>
                      ) : null}
                      <div className="mt-2 flex items-end justify-between gap-3">
                        <div className="min-w-0">
                          {w.musteri_adi ? (
                            <div className="text-muted-foreground text-xs">{w.musteri_adi}</div>
                          ) : null}
                          <h2 className="text-foreground mt-0.5 truncate text-lg font-semibold tracking-tight sm:text-xl">
                            {w.baslik}
                          </h2>
                        </div>
                        <ArrowUpRight className="text-foreground size-5 shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        </section>
      </div>
    </article>
  );
}
