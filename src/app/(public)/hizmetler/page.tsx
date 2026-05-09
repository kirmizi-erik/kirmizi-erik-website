import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { servicePages } from "@/lib/services-data";
import { hizmetGrupBilgi, hizmetler, type HizmetGrup } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Hizmetler",
  description:
    "Dokuz hizmet, tek çatı. Video, fotoğraf, dijital pazarlama, sosyal medya, web/uygulama, AI kurulumları, grafik ve 3D/2D — her disiplin aynı ekiple.",
};

const gruplar: HizmetGrup[] = ["gorsel", "dijital", "yazilim"];

export default function HizmetlerHubPage() {
  return (
    <article>
      {/* Hero — banner görsel + text overlay (üst), subtitle (alt) */}
      <header>
        {/* Üst banner — layered surfaces atmosfer, sol-altta rozet + başlık */}
        <div className="relative h-56 w-full overflow-hidden sm:h-72 lg:h-96">
          <Image
            src="/hero/hizmetler-hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="from-background/0 via-background/30 to-background absolute inset-0 bg-gradient-to-b" />
          <div className="from-background/70 absolute inset-0 bg-gradient-to-r via-transparent to-transparent" />

          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-screen-2xl px-4 pb-6 sm:px-6 lg:px-10 lg:pb-8">
              <div className="text-muted-foreground inline-flex items-center gap-3 text-xs tracking-widest uppercase">
                <span className="bg-brand size-1.5 rounded-full" />
                Hizmetler
              </div>
              <h1 className="font-heading mt-3 max-w-4xl text-4xl leading-[0.95] font-black tracking-tight sm:text-5xl lg:text-6xl">
                Dokuz hizmet.{" "}
                <span className="text-brand-mor">Tek çatı.</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Banner altı — subtitle paragraf */}
        <div className="border-border/40 mx-auto max-w-screen-2xl border-b px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed sm:text-lg">
            Reklam ajansları çoğu zaman ya kreatife ya performansa odaklanır. Biz
            ikisini de aynı çatı altında, aynı ekiple yapıyoruz. Aşağıdan
            ilgilendiğin hizmeti seç — her birinin kendi sayfası, kendi süreci
            ve örnek işleri var.
          </p>
        </div>
      </header>

      {/* 3 grup × hizmetler — alterne BG (gri / siyah / gri) */}
      {gruplar.map((g, gIdx) => {
        const bilgi = hizmetGrupBilgi[g];
        // Vurgu hizmet (AI Kurulumları) bulunuyorsa ortaya al
        const grupHizmetleri = (() => {
          const arr = hizmetler.filter((h) => h.grup === g);
          const vurgu = arr.find((h) => "oneCikan" in h && h.oneCikan);
          if (!vurgu) return arr;
          const others = arr.filter((h) => h !== vurgu);
          const first = others[0];
          if (!first || others.length < 2) return arr;
          // Sıra: [ilk, vurgu, kalan...]
          return [first, vurgu, ...others.slice(1)];
        })();
        const acik = gIdx % 2 === 0; // 01 ve 03 → gri; 02 → siyah

        return (
          <div key={g} className={acik ? "bg-muted" : undefined}>
            <section className="border-border/40 mx-auto max-w-screen-2xl border-b px-4 py-20 sm:px-6 lg:px-10 lg:py-24">
              {/* Grup başlık — 3-col, kart grid ile hizalı */}
              <div className="border-border/40 grid items-start gap-6 border-b pb-6 md:grid-cols-3">
                <div className="md:col-span-1">
                  <div className="text-brand inline-flex items-center gap-3 text-sm font-bold tracking-widest uppercase">
                    <span className="font-mono">0{gIdx + 1}</span>
                    {bilgi.baslik}
                  </div>
                </div>
                <p className="text-foreground font-heading md:col-span-1 text-lg font-bold tracking-tight md:text-center md:text-xl lg:text-2xl">
                  {bilgi.aciklama}
                </p>
                {/* Sağ kolon — boş, hizalama için */}
                <div className="hidden md:block md:col-span-1" />
              </div>

              {/* Hizmet kartları */}
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {grupHizmetleri.map((h) => {
                  const detail = servicePages.find((s) => s.slug === h.slug);
                  const isStar = "oneCikan" in h && h.oneCikan;
                  const subtitle =
                    detail?.heroSubtitle ?? "Detay yakında eklenecek.";

                  return (
                    <Link
                      key={h.slug}
                      href={`/hizmetler/${h.slug}`}
                      className={cn(
                        "group relative flex flex-col rounded-2xl border p-6 transition-all",
                        isStar
                          ? "border-brand/40 bg-gradient-to-br from-brand/[0.08] to-transparent hover:border-brand/60"
                          : acik
                            ? "border-border/60 bg-background/50 hover:border-foreground/30 hover:bg-background/70"
                            : "border-border/60 bg-muted hover:border-foreground/30 hover:bg-muted/80",
                      )}
                    >
                      {isStar ? (
                        <div className="text-brand inline-flex items-center gap-1.5 text-[10px] tracking-widest uppercase">
                          <Sparkles className="size-3" />
                          Vurgu Hizmet
                        </div>
                      ) : null}

                      <h3
                        className={cn(
                          "font-heading text-2xl leading-tight font-bold tracking-tight",
                          isStar ? "mt-2" : "",
                        )}
                      >
                        {h.label}
                      </h3>

                      <p className="text-muted-foreground mt-3 line-clamp-3 text-sm leading-relaxed">
                        {subtitle}
                      </p>

                      <div className="mt-6 flex items-center gap-1.5 text-sm font-medium">
                        <span className="text-foreground group-hover:text-brand transition-colors">
                          Detay
                        </span>
                        <ArrowUpRight className="text-muted-foreground group-hover:text-brand size-4 transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>
        );
      })}

      {/* CTA — koyu (default) */}
      <section className="border-border/40 border-t">
        <div className="mx-auto flex max-w-screen-2xl flex-col items-start justify-between gap-6 px-4 py-16 sm:flex-row sm:items-center sm:px-6 lg:px-10">
          <h2 className="font-heading max-w-xl text-2xl leading-tight font-black tracking-tight sm:text-3xl">
            Birden fazla disiplin mi gerek?{" "}
            <span className="text-brand-mor">Tek brief, tek ekip.</span>
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
