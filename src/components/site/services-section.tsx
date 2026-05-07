import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

import { hizmetler, hizmetGrupBilgi, type HizmetGrup } from "@/lib/site-data";
import { cn } from "@/lib/utils";

const gruplar: HizmetGrup[] = ["gorsel", "dijital", "yazilim"];

export function ServicesSection() {
  return (
    <section
      id="hizmetler"
      className="border-border/40 mx-auto max-w-screen-2xl border-t px-4 py-24 sm:px-6 lg:px-10 lg:py-32"
    >
      {/* Bölüm başlığı */}
      <div className="grid gap-10 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-5">
          <div className="text-muted-foreground inline-flex items-center gap-3 text-xs tracking-widest uppercase">
            <span className="bg-brand size-1.5 rounded-full" />
            Hizmetler
          </div>
          <h2 className="font-heading mt-5 text-4xl leading-tight font-black sm:text-5xl lg:text-6xl">
            Dokuz hizmet.
            <br />
            <span className="text-brand-mor">Tek çatı.</span>
          </h2>
        </div>
        <p className="text-muted-foreground max-w-xl text-base leading-relaxed md:col-span-7 md:self-end md:text-lg">
          Reklam ajansları çoğu zaman ya kreatife ya performansa odaklanır. Biz
          ikisini de aynı çatı altında, aynı ekiple yapıyoruz. Brief tek
          gelir, çıktı bütün olur.
        </p>
      </div>

      {/* 3 sütun grup */}
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {gruplar.map((g, idx) => {
          const grupHizmetleri = hizmetler.filter((h) => h.grup === g);
          const bilgi = hizmetGrupBilgi[g];
          const oneCikanGrupMu = g === "yazilim"; // AI Kurulumları öne çıkıyor

          return (
            <div
              key={g}
              className={cn(
                "group relative flex flex-col rounded-2xl border p-7 transition-colors",
                oneCikanGrupMu
                  ? "border-brand/40 bg-gradient-to-b from-brand/[0.05] to-transparent"
                  : "border-border/60 hover:border-foreground/30 bg-card/40",
              )}
            >
              <div className="text-muted-foreground inline-flex items-center gap-2 text-xs tracking-widest uppercase">
                <span className="text-foreground/60 font-mono">
                  0{idx + 1}
                </span>
                {bilgi.baslik}
              </div>

              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {bilgi.aciklama}
              </p>

              <ul className="mt-8 flex-1 space-y-1">
                {grupHizmetleri.map((h) => {
                  const isStar = "oneCikan" in h && h.oneCikan;
                  const Tag = h.aktif ? Link : "span";
                  return (
                    <li key={h.slug}>
                      <Tag
                        href={h.aktif ? `/hizmetler/${h.slug}` : "#"}
                        className={cn(
                          "group/item flex items-center justify-between gap-2 rounded-md py-2.5",
                          h.aktif
                            ? "hover:bg-muted/40 -mx-3 px-3 transition-colors"
                            : "",
                        )}
                      >
                        <span
                          className={cn(
                            "text-base font-medium tracking-tight",
                            isStar
                              ? "text-foreground"
                              : h.aktif
                                ? "text-foreground"
                                : "text-muted-foreground",
                          )}
                        >
                          {h.label}
                          {isStar ? (
                            <Sparkles className="text-brand ml-2 inline size-3.5" />
                          ) : null}
                        </span>
                        {h.aktif ? (
                          <ArrowUpRight className="text-muted-foreground group-hover/item:text-foreground size-4 transition-colors" />
                        ) : (
                          <span className="text-muted-foreground/50 text-[10px] tracking-widest uppercase">
                            Yakında
                          </span>
                        )}
                      </Tag>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
