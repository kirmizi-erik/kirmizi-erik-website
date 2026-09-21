import Link from "next/link";
import { ArrowUpRight, Radar, Sparkles } from "lucide-react";

import { BrandsStrip } from "@/components/site/brands-strip";
import { FeaturedWorks } from "@/components/site/featured-works";
import { HeroSection } from "@/components/site/hero-section";
import { OpenChatButton } from "@/components/site/open-chat-button";
import { ServicesSection } from "@/components/site/services-section";
import { Button } from "@/components/ui/button";
import { faqPageSchema, homeFaq, jsonLdScript } from "@/lib/schema";

export default function HomePage() {
  return (
    <>
      {/* Hero — koyu (kendi gradient'i) */}
      <HeroSection />

      {/* AI bölümü — iki vurgu kart: Asistan + Görünürlük Testi */}
      <section className="border-border/40 border-t">
        <div className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* AI Asistan */}
            <div className="border-brand/40 from-brand/[0.08] relative flex flex-col overflow-hidden rounded-3xl border bg-gradient-to-br via-transparent to-transparent p-8 sm:p-10">
              <div className="from-brand/20 pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-gradient-to-br to-transparent blur-3xl" />
              <div className="relative flex flex-1 flex-col">
                <div className="text-brand inline-flex items-center gap-2 text-xs tracking-widest">
                  <Sparkles className="size-3.5" />
                  AI ASİSTAN
                </div>
                <h2 className="font-heading mt-4 text-2xl leading-[1.1] font-black tracking-tight sm:text-3xl">
                  Reklam ihtiyaçlarınızı <span className="text-brand">saniyeler içinde</span>{" "}
                  konuşun.
                </h2>
                <p className="text-muted-foreground mt-4 text-base leading-relaxed">
                  25 yıllık birikim, brief odaklı, 7/24 ulaşılabilir akıllı asistanımız hazır.
                </p>
                <div className="mt-6 flex flex-1 items-end">
                  <OpenChatButton size="lg" className="h-12 w-full px-7 sm:w-auto">
                    <Sparkles className="mr-1 size-4" />
                    Asistanla konuş
                    <ArrowUpRight className="ml-1 size-4" />
                  </OpenChatButton>
                </div>
              </div>
            </div>

            {/* AI Görünürlük Testi */}
            <div className="border-brand-mor/40 from-brand-mor/[0.1] relative flex flex-col overflow-hidden rounded-3xl border bg-gradient-to-br via-transparent to-transparent p-8 sm:p-10">
              <div className="from-brand-mor/25 pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-gradient-to-br to-transparent blur-3xl" />
              <div className="relative flex flex-1 flex-col">
                <div className="text-brand-mor inline-flex items-center gap-2 text-xs tracking-widest">
                  <Radar className="size-3.5" />
                  ÜCRETSİZ ARAÇ
                </div>
                <h2 className="font-heading mt-4 text-2xl leading-[1.1] font-black tracking-tight sm:text-3xl">
                  Siteniz yapay zekâya <span className="text-brand-mor">görünüyor mu?</span>
                </h2>
                <p className="text-muted-foreground mt-4 text-base leading-relaxed">
                  ChatGPT, Claude ve Perplexity&apos;nin cevaplarında yer alıp almadığınızı 20
                  saniyede ölçün — beş katmanlı puan, bulgular ve çözüm listesi ücretsiz.
                </p>
                <div className="mt-6 flex flex-1 items-end">
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 w-full px-7 sm:w-auto"
                  >
                    <Link href="/ai-gorunurluk">
                      <Radar className="mr-1 size-4" />
                      Sitemi test et
                      <ArrowUpRight className="ml-1 size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services — hafif açık */}
      <div className="bg-muted">
        <ServicesSection />
      </div>

      {/* Öne çıkan işler — koyu (default) */}
      <FeaturedWorks />

      {/* Markalar — hafif açık */}
      <div className="bg-muted">
        <BrandsStrip />
      </div>

      {/* SSS — bot-okunur, alıntılanabilir pasajlar (FAQPage şemasıyla aynı kaynak) */}
      <section className="border-border/40 border-t">
        <div className="mx-auto max-w-screen-2xl px-4 py-20 sm:px-6 lg:px-10 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="font-heading text-3xl leading-[0.95] font-black tracking-tight sm:text-4xl">
                Sık sorulan
                <br />
                <span className="text-brand">sorular</span>
              </h2>
              <p className="text-muted-foreground mt-4 text-base leading-relaxed">
                Kısa ve net: ajans, hizmetler ve çalışma biçimi hakkında en çok merak edilenler.
              </p>
            </div>
            <div className="space-y-8 lg:col-span-8">
              {homeFaq.map((f) => (
                <div key={f.soru} className="border-border/40 border-b pb-8 last:border-0">
                  <h3 className="font-heading text-lg font-bold sm:text-xl">{f.soru}</h3>
                  <p className="text-muted-foreground mt-3 text-base leading-relaxed">{f.cevap}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faqPageSchema)} />

      {/* Alt CTA bandı — koyu */}
      <section className="border-border/40 mx-auto max-w-screen-2xl border-t px-4 py-24 sm:px-6 lg:px-10 lg:py-28">
        <div className="grid items-end gap-8 md:grid-cols-12">
          <h2 className="font-heading text-4xl leading-[0.95] font-black tracking-tight sm:text-5xl md:col-span-8 lg:text-6xl">
            Sıradaki büyük fikir
            <br />
            <span className="text-brand-mor">senin mi?</span>
          </h2>
          <div className="md:col-span-4 md:flex md:justify-end">
            <Button asChild size="lg" className="h-12 px-7">
              <Link href="/iletisim">
                Brief paylaş
                <ArrowUpRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
