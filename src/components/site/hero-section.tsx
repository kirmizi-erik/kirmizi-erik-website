import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { parseVideoUrl } from "@/lib/embed";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_TITLE = "Bir fikir,\ndokuz hizmet,\nsıfır sınır.";
const DEFAULT_SUBTITLE =
  "Video, fotoğraf, dijital pazarlama, sosyal medya, yazılım, AI, grafik ve 3D — markanı bir nokta gibi sınırlandıran şeyleri yıkıyoruz.";

async function getHero() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("hero_title, hero_subtitle, hero_video_url")
    .eq("id", 1)
    .single();
  return {
    title: data?.hero_title?.trim() || DEFAULT_TITLE,
    subtitle: data?.hero_subtitle?.trim() || DEFAULT_SUBTITLE,
    videoUrl: data?.hero_video_url ?? null,
  };
}

export async function HeroSection() {
  const hero = await getHero();
  const lines = hero.title.split("\n").filter((l) => l.trim().length > 0);
  const lastIdx = lines.length - 1;
  const video = parseVideoUrl(hero.videoUrl);

  return (
    <section className="relative isolate overflow-hidden">
      {/* Arkaplan: video varsa video, yoksa animasyonlu gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {video?.kind === "direct" ? (
          <video
            src={video.url}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 size-full object-cover opacity-50"
          />
        ) : video?.kind === "youtube" ? (
          <iframe
            // YouTube autoplay+mute (sessiz başlatır), loop için playlist=ID hilesi
            src={`${video.embedUrl}&autoplay=1&mute=1&controls=0&loop=1&playlist=${video.videoId}&playsinline=1`}
            allow="autoplay; encrypted-media"
            className="absolute top-1/2 left-1/2 size-full min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover opacity-40"
          />
        ) : video?.kind === "vimeo" ? (
          <iframe
            src={`${video.embedUrl}&autoplay=1&muted=1&loop=1&background=1`}
            allow="autoplay; encrypted-media"
            className="absolute top-1/2 left-1/2 size-full min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover opacity-40"
          />
        ) : (
          <>
            {/* Video yok — animasyonlu gradient + grain */}
            <div className="absolute -top-1/4 left-1/2 size-[120%] -translate-x-1/2 animate-[heroGlow_18s_ease-in-out_infinite] rounded-full bg-[radial-gradient(closest-side,rgba(220,14,24,0.18),transparent_70%)] blur-3xl" />
            <div className="absolute top-1/4 left-0 size-[80%] animate-[heroGlow2_22s_ease-in-out_infinite] rounded-full bg-[radial-gradient(closest-side,rgba(107,27,69,0.16),transparent_70%)] blur-3xl" />
          </>
        )}

        {/* Karartma overlay (video üzerinde okunabilirlik) */}
        {video ? (
          <div className="absolute inset-0 bg-black/55" />
        ) : null}

        {/* Grain (her zaman) */}
        <div className="bg-noise absolute inset-0 opacity-[0.06]" />
      </div>

      <style>{`
        @keyframes heroGlow {
          0%, 100% { transform: translate(-50%, 0) scale(1); opacity: 0.9; }
          50%      { transform: translate(-45%, 4%) scale(1.08); opacity: 1; }
        }
        @keyframes heroGlow2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.85; }
          50%      { transform: translate(6%, -3%) scale(1.06); opacity: 1; }
        }
      `}</style>

      <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-screen-2xl flex-col justify-center px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="text-muted-foreground mb-8 inline-flex items-center gap-3 text-xs tracking-widest uppercase">
          <span className="bg-brand size-1.5 rounded-full" />
          360° Kreatif Reklam Ajansı
        </div>

        <h1 className="font-heading display max-w-[18ch] text-5xl leading-[0.95] font-black sm:text-7xl lg:text-[clamp(4rem,9vw,9rem)]">
          {lines.map((line, i) => (
            <span key={i} className={i === lastIdx ? "text-brand" : ""}>
              {line}
              {i < lastIdx ? <br /> : null}
            </span>
          ))}
        </h1>

        <p className="text-muted-foreground mt-8 max-w-2xl text-base leading-relaxed sm:text-lg">
          {hero.subtitle}
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg" className="h-12 px-7">
            <Link href="/iletisim">
              Bir brief paylaş
              <ArrowUpRight className="ml-1 size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="ghost" className="h-12 px-5">
            <Link href="/calismalar">Çalışmalarımıza bak</Link>
          </Button>
        </div>

        <a
          href="#hizmetler"
          className="text-muted-foreground hover:text-foreground mt-16 inline-flex items-center gap-3 text-xs tracking-wider uppercase transition-colors"
        >
          <ArrowDown className="size-4 animate-bounce" />
          Aşağı kaydır
        </a>
      </div>
    </section>
  );
}
