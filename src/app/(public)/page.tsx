import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { BrandsStrip } from "@/components/site/brands-strip";
import { FeaturedWorks } from "@/components/site/featured-works";
import { HeroSection } from "@/components/site/hero-section";
import { ServicesSection } from "@/components/site/services-section";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <>
      {/* Hero — koyu (kendi gradient'i) */}
      <HeroSection />

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
