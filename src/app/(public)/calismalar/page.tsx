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
    <div className="mx-auto max-w-screen-2xl px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
      {/* Üst */}
      <div className="grid items-end gap-8 md:grid-cols-12">
        <div className="md:col-span-7">
          <div className="text-muted-foreground inline-flex items-center gap-3 text-xs tracking-widest uppercase">
            <span className="bg-brand size-1.5 rounded-full" />
            Çalışmalar
          </div>
          <h1 className="font-heading mt-5 max-w-3xl text-5xl leading-[0.95] font-black tracking-tight sm:text-7xl">
            Yaptıklarımız.
          </h1>
        </div>
        <p className="text-muted-foreground md:col-span-5 md:text-right md:text-base">
          {works?.length ?? 0} çalışma
        </p>
      </div>

      {/* Filtre rozetleri */}
      <div className="mt-10 flex flex-wrap gap-2">
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

      {/* Liste */}
      <div className="mt-14">
        {!works || works.length === 0 ? (
          <p className="text-muted-foreground">
            {aktif
              ? "Bu kategoride henüz çalışma yok."
              : "Henüz yayında çalışma yok. Admin panelden eklendikçe burada listelenecek."}
          </p>
        ) : (
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            {works.map((w, i) => {
              // Asimetrik 12-grid: 2'li gruplar (8/4, 4/8, 6/6)
              const pattern = [8, 4, 4, 8, 6, 6];
              const span = pattern[i % pattern.length];

              const video = parseVideoUrl(w.kapak_video_url);
              const directVideo = video?.kind === "direct" ? video.url : null;
              const ytThumb = video?.kind === "youtube" ? video.thumbnail : null;
              const cover = w.kapak_url ?? ytThumb;

              return (
                <Link
                  key={w.slug}
                  href={`/calismalar/${w.slug}`}
                  className={cn(
                    "group col-span-12 md:col-span-6",
                    span === 4 ? "lg:col-span-4" : span === 8 ? "lg:col-span-8" : "lg:col-span-6",
                  )}
                >
                  <div className="border-border/60 bg-muted/30 hover:border-foreground/30 relative aspect-[4/3] overflow-hidden rounded-2xl border transition-colors">
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

                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6">
                      {w.kategori && w.kategori.length ? (
                        <div className="text-foreground/70 text-[10px] tracking-widest uppercase">
                          {w.kategori.slice(0, 2).join(" · ")}
                        </div>
                      ) : null}
                      <div className="mt-2 flex items-end justify-between gap-3">
                        <div>
                          {w.musteri_adi ? (
                            <div className="text-muted-foreground text-xs">{w.musteri_adi}</div>
                          ) : null}
                          <h2 className="text-foreground mt-0.5 text-xl font-semibold tracking-tight sm:text-2xl">
                            {w.baslik}
                          </h2>
                        </div>
                        <ArrowUpRight className="text-foreground size-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
