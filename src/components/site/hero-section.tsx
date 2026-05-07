import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Soyut motion arkaplan — CSS animation ile, video yok (lokal-first, perf dostu) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Yumuşak red glow */}
        <div className="absolute -top-1/4 left-1/2 size-[120%] -translate-x-1/2 animate-[heroGlow_18s_ease-in-out_infinite] rounded-full bg-[radial-gradient(closest-side,rgba(220,14,24,0.18),transparent_70%)] blur-3xl" />
        {/* Yumuşak mor glow, kontra hareket */}
        <div className="absolute top-1/4 left-0 size-[80%] animate-[heroGlow2_22s_ease-in-out_infinite] rounded-full bg-[radial-gradient(closest-side,rgba(107,27,69,0.16),transparent_70%)] blur-3xl" />

        {/* Grain overlay — premium hissi */}
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
        {/* Üst etiket */}
        <div className="text-muted-foreground mb-8 inline-flex items-center gap-3 text-xs tracking-widest uppercase">
          <span className="bg-brand size-1.5 rounded-full" />
          360° Kreatif Reklam Ajansı
        </div>

        {/* Devasa display başlık */}
        <h1 className="font-heading display max-w-[18ch] text-5xl leading-[0.95] font-black sm:text-7xl lg:text-[clamp(4rem,9vw,9rem)]">
          Bir fikir,
          <br />
          dokuz disiplin,
          <br />
          <span className="text-brand">sıfır sınır.</span>
        </h1>

        {/* Alt yazı */}
        <p className="text-muted-foreground mt-8 max-w-2xl text-base leading-relaxed sm:text-lg">
          Video, fotoğraf, dijital pazarlama, sosyal medya, yazılım, AI, grafik
          ve 3D — markanı bir nokta gibi sınırlandıran şeyleri yıkıyoruz.
        </p>

        {/* CTA'lar */}
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

        {/* Aşağı kaydır ipucu */}
        <div className="text-muted-foreground mt-16 flex items-center gap-3 text-xs tracking-wider uppercase">
          <ArrowDown className="size-4 animate-bounce" />
          Aşağı kaydır
        </div>
      </div>
    </section>
  );
}
