import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { parseVideoUrl } from "@/lib/embed";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

/**
 * Hizmet slug → case_studies.kategori değeri eşlemesi.
 * services-data.ts'deki hizmet slug'ları ile case-study.ts kategoriOptions
 * `value` alanı arasında kullanılır.
 */
const SERVICE_TO_CATEGORY: Record<string, string> = {
  "video-produksiyon": "video",
  "fotograf-cekimleri": "fotograf",
  "dijital-pazarlama": "dijital",
  "sosyal-medya-yonetimi": "sosyal",
  "uygulama-gelistirme": "uygulama",
  "web-tasarim-yazilim": "web",
  "ai-kurulumlari": "ai",
  "grafik-tasarim": "grafik",
  "3d-2d-calismalar": "3d-2d",
};

type Props = {
  serviceSlug: string;
  serviceLabel: string;
  /** Maksimum kart sayısı (varsayılan 6) */
  limit?: number;
};

type WorkRow = {
  slug: string;
  baslik: string;
  musteri_adi: string | null;
  kategori: string[] | null;
  kapak_url: string | null;
  kapak_video_url: string | null;
};

function MiniWorkCard({ w }: { w: WorkRow }) {
  const v = parseVideoUrl(w.kapak_video_url);
  const ytThumb = v?.kind === "youtube" ? v.thumbnail : null;
  const directVideo = v?.kind === "direct" ? v.url : null;
  const effectiveKapak = w.kapak_url ?? ytThumb;

  return (
    <Link
      href={`/calismalar/${w.slug}`}
      aria-label={w.baslik}
      className="group relative block aspect-video overflow-hidden rounded-xl border border-border/60 bg-muted/40 transition-colors hover:border-foreground/30"
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

      {effectiveKapak ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={effectiveKapak}
          alt={w.baslik}
          className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          loading="lazy"
        />
      ) : null}

      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/20 to-transparent p-4">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            {w.musteri_adi ? (
              <div className="text-muted-foreground text-[11px]">
                {w.musteri_adi}
              </div>
            ) : null}
            <h3 className="text-foreground mt-0.5 truncate text-sm font-semibold tracking-tight sm:text-base">
              {w.baslik}
            </h3>
          </div>
          <ArrowUpRight className="text-foreground size-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

export async function RelatedWorks({
  serviceSlug,
  serviceLabel,
  limit = 6,
}: Props) {
  const categoryValue = SERVICE_TO_CATEGORY[serviceSlug];
  if (!categoryValue) return null;

  const supabase = await createClient();
  const { data: works } = await supabase
    .from("case_studies")
    .select("slug, baslik, musteri_adi, kategori, kapak_url, kapak_video_url")
    .eq("durum", "yayinda")
    .contains("kategori", [categoryValue])
    .order("yayin_tarihi", { ascending: false, nullsFirst: false })
    .limit(limit);

  const liste = (works ?? []) as WorkRow[];

  return (
    <section className="border-border/40 mx-auto max-w-screen-2xl border-t px-4 py-20 sm:px-6 lg:px-10 lg:py-24">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="text-muted-foreground inline-flex items-center gap-3 text-xs tracking-widest uppercase">
            <span className="bg-brand size-1.5 rounded-full" />
            Referanslar
          </div>
          <h2 className="font-heading mt-5 text-4xl leading-tight font-black sm:text-5xl">
            {serviceLabel}
            <br />
            <span className="text-brand">çalışmalarımız.</span>
          </h2>
        </div>
        <div className="flex md:col-span-7 md:items-end md:justify-end">
          <Link
            href="/calismalar"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            Tüm çalışmalar
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>

      {liste.length > 0 ? (
        <div
          className={cn(
            "mt-10 grid gap-4 sm:gap-5",
            "sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {liste.map((w) => (
            <MiniWorkCard key={w.slug} w={w} />
          ))}
        </div>
      ) : (
        <div className="border-border/40 bg-card/30 mt-10 rounded-2xl border p-10 text-center">
          <p className="text-muted-foreground text-sm">
            Bu kategoride yayınlanmış çalışma henüz yok. Admin panelden bir
            çalışmayı bu kategoriye ekleyince burada otomatik görünecek.
          </p>
        </div>
      )}
    </section>
  );
}
