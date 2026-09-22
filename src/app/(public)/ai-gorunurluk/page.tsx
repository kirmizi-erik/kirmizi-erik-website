import Link from "next/link";
import { ArrowUpRight, Radar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LAYER_COLORS, LAYER_LABELS, LAYER_WEIGHTS } from "@/lib/ai-scan/types";

import { ScanClient } from "./scan-client";

export const metadata = {
  title: "KeScan — Ücretsiz AI Görünürlük Testi",
  description:
    "Google için SEO ne ise, yapay zekâ için de GEO (Generative Engine Optimization) odur; KeScan onu ölçer. Sitenizi ücretsiz tarayın: ChatGPT, Claude, Perplexity ve Google'ın AI cevaplarında yer almak için taranabilirlik, okunabilirlik ve alıntılanabilirlik puanınızı görün.",
};

// Tarama 5 bot kimliği + altyapı dosyalarını gerçek isteklerle çeker
export const maxDuration = 60;

const AI_ASISTANLAR = ["ChatGPT", "Claude", "Perplexity", "Gemini"];

const KATMAN_ACIKLAMA: Record<string, string> = {
  erisim:
    'robots.txt AI botları için ayrı ayrı çözümlenir; sonra aynı sayfaya o botların kimliğiyle gerçek istek atılır. Kural dosyası "buyurun" derken sunucunun kapıyı kapattığı durumu böyle yakalıyoruz.',
  cikarilabilirlik:
    "AI tarayıcılarının çoğu JavaScript çalıştırmaz. Ham HTML alınır, script ve stil iskeleti düşülür, geriye kalan gerçek metin ölçülür: sayfanızın kaç KB'ının içerik olduğu ve bir modelin sizi kaç token olarak okuduğu.",
  altyapi:
    "robots.txt, sitemap.xml ve AI araçlarına site rehberi sunan llms.txt kontrol edilir — tarama altyapınızın üç temel dosyası.",
  anlam:
    "JSON-LD var mı, düğümler @id ile birbirine bağlı mı, sameAs ile dış otoritelere çapa atılmış mı? Makineye sitenizin ne olduğunu anlatan katman budur.",
  alintilanabilirlik:
    "Cevap motoru sayfanızı değil, pasajınızı alıntılar. Başlık altında kendi kendine yeten net cevaplar ve marka adının metinde geçmesi ölçülür.",
};

export default function AiGorunurlukPage() {
  return (
    <article>
      {/* Hero + tarama kutusu */}
      <header className="border-border/40 border-b">
        <div className="mx-auto max-w-screen-2xl px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-24 lg:pb-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-brand inline-flex items-center gap-2 text-xs tracking-widest">
              <Radar className="size-3.5" />
              KeScan · ÜCRETSİZ AI GÖRÜNÜRLÜK TESTİ
            </div>
            <h1 className="font-heading mt-4 text-4xl leading-[0.95] font-black tracking-tight sm:text-5xl lg:text-6xl">
              Siteniz yapay zekâya <span className="text-brand">görünüyor mu?</span>
            </h1>
            <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-base leading-relaxed sm:text-lg">
              <strong className="text-foreground font-medium">
                Google&apos;da SEO ne işe yarıyorsa, yapay zekâda da{" "}
                <abbr title="Generative Engine Optimization" className="no-underline">
                  GEO
                </abbr>{" "}
                o işi yapar.
              </strong>{" "}
              GEO, <em>Generative Engine Optimization</em> — yani üretken yapay zekâ motorları için
              optimizasyon — markanızın yapay zekâ cevaplarında önerilmesini sağlayan çalışmadır.
              Artık müşteriniz ürününüzü Google&apos;da aramadan önce ChatGPT&apos;ye soruyor. Orada
              önerilebilmek için siteniz önce taranabilir, sonra okunabilir, en sonunda
              alıntılanabilir olmalı. KeScan bu beş katmanı ölçüp puanlar.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-muted-foreground text-xs tracking-widest">
                BU ASİSTANLAR SİTENİZE ERİŞEBİLİYOR MU?
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {AI_ASISTANLAR.map((a) => (
                  <span
                    key={a}
                    className="border-border/60 text-foreground rounded-full border px-3 py-1 text-xs font-medium"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10">
            <ScanClient />
          </div>

          <div className="border-border/60 bg-muted/30 mx-auto mt-10 max-w-2xl rounded-2xl border p-5 text-center">
            <p className="text-muted-foreground text-xs tracking-widest">FARKIMIZ</p>
            <p className="mt-2 text-sm leading-relaxed">
              robots.txt ve sitemap&apos;e bakan araçlardan farklı olarak, sayfanıza{" "}
              <strong>botların kimliğiyle gerçek istek atarız</strong>. Kural dosyanızın söylediği
              ile sunucunuzun yaptığı aynı mı, onu ölçeriz.
            </p>
          </div>
        </div>
      </header>

      {/* Beş katman açıklaması */}
      <section className="bg-muted">
        <div className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
          <h2 className="font-heading text-3xl font-black tracking-tight sm:text-4xl">
            Neyi, nasıl ölçüyoruz?
          </h2>
          <div className="mt-8 space-y-0">
            {(Object.keys(LAYER_LABELS) as (keyof typeof LAYER_LABELS)[]).map((key, i) => (
              <div
                key={key}
                className="border-border/40 grid gap-3 border-t py-6 md:grid-cols-12 md:gap-6"
              >
                <div className="flex items-center gap-4 md:col-span-4">
                  <span
                    className={`${LAYER_COLORS[key].ring} ${LAYER_COLORS[key].text} flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-heading text-lg font-bold">
                      {LAYER_LABELS[key].baslik}{" "}
                      <span className="text-muted-foreground text-xs font-normal">
                        %{LAYER_WEIGHTS[key]}
                      </span>
                    </h3>
                    <p className={`${LAYER_COLORS[key].text} text-sm`}>{LAYER_LABELS[key].soru}</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed md:col-span-8">
                  {KATMAN_ACIKLAMA[key]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-screen-2xl px-4 py-20 sm:px-6 lg:px-10 lg:py-24">
        <div className="grid items-end gap-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <h2 className="font-heading text-3xl leading-[0.95] font-black tracking-tight sm:text-4xl lg:text-5xl">
              Puanınız düşük mü çıktı?
              <br />
              <span className="text-brand-mor">Bizim işimiz bu.</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-relaxed">
              Web sitesi, SEO ve şirketlere özel AI kurulumları Kırmızı Erik&apos;in dokuz
              hizmetinden üçü. Raporunuzdaki her maddeyi biz uygular, sitenizi yapay zekâ
              cevaplarında görünür hale getiririz.
            </p>
          </div>
          <div className="md:col-span-4 md:flex md:justify-end">
            <Button asChild size="lg" className="h-12 px-7">
              <Link href="/iletisim">
                Görüşme planla
                <ArrowUpRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </article>
  );
}
