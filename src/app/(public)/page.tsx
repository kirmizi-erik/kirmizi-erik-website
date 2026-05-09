import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

import { BrandsStrip } from "@/components/site/brands-strip";
import { FeaturedWorks } from "@/components/site/featured-works";
import { HeroSection } from "@/components/site/hero-section";
import { OpenChatButton } from "@/components/site/open-chat-button";
import { ServicesSection } from "@/components/site/services-section";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <>
      {/* Hero — koyu (kendi gradient'i) */}
      <HeroSection />

      {/* AI Asistan bandı — vurgu kart, koyu zemin */}
      <section className="border-border/40 border-t">
        <div className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
          <div className="border-brand/40 from-brand/[0.08] relative overflow-hidden rounded-3xl border bg-gradient-to-br via-transparent to-transparent p-8 sm:p-12 lg:p-16">
            {/* Dekoratif ışık */}
            <div className="from-brand/20 pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-gradient-to-br to-transparent blur-3xl" />

            <div className="relative grid items-center gap-8 md:grid-cols-12">
              <div className="md:col-span-8">
                <div className="text-brand inline-flex items-center gap-2 text-xs tracking-widest uppercase">
                  <Sparkles className="size-3.5" />
                  AI Asistan
                </div>
                <h2 className="font-heading mt-4 text-3xl leading-[1.1] font-black tracking-tight sm:text-4xl lg:text-5xl">
                  Reklam ihtiyaçlarınızı{" "}
                  <span className="text-brand">saniyeler içinde</span>{" "}
                  konuşabileceğiniz akıllı asistanımız hazır.
                </h2>
                <p className="text-muted-foreground mt-5 max-w-2xl text-base leading-relaxed sm:text-lg">
                  25 yıllık birikim, brief odaklı, 7/24 ulaşılabilir.
                </p>
              </div>

              <div className="md:col-span-4 md:flex md:justify-end">
                <OpenChatButton size="lg" className="h-12 w-full px-7 sm:w-auto">
                  <Sparkles className="mr-1 size-4" />
                  Asistanla konuş
                  <ArrowUpRight className="ml-1 size-4" />
                </OpenChatButton>
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

      {/* Alt CTA bandı — koyu */}
      <section className="border-border/40 mx-auto max-w-screen-2xl border-t px-4 py-24 sm:px-6 lg:px-10 lg:py-28">
        <div className="grid items-end gap-8 md:grid-cols-12">
          <h2 className="font-heading text-4xl leading-[0.95] font-black tracking-tight sm:text-5xl lg:text-6xl md:col-span-8">
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
