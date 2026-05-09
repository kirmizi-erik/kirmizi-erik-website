import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Sparkles, Zap } from "lucide-react";

import { OpenChatButton } from "@/components/site/open-chat-button";
import { RelatedWorks } from "@/components/site/related-works";
import { Button } from "@/components/ui/button";
import {
  getServicePage,
  servicePages,
  type ServicePageData,
} from "@/lib/services-data";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return servicePages.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const data = getServicePage(slug);
  if (!data) return { title: "Hizmet bulunamadı" };
  return {
    title: data.label,
    description: data.metaDescription,
  };
}

export default async function HizmetDetayPage({ params }: PageProps) {
  const { slug } = await params;
  const data = getServicePage(slug);
  if (!data) notFound();

  return <ServicePageContent data={data} />;
}

function ServicePageContent({ data }: { data: ServicePageData }) {
  const isAi = data.slug === "ai-kurulumlari";

  return (
    <article>
      {/* Hero — banner görsel + text overlay (üst), subtitle + CTA (alt) */}
      <header>
        {/* Üst banner — hizmete özel atmospheric görsel, sol-altta rozet + başlık */}
        <div className="relative h-56 w-full overflow-hidden sm:h-72 lg:h-96">
          <Image
            src={`/hero/services/${data.slug}.jpg`}
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
                {data.oneCikan ? (
                  <>
                    <Sparkles className="text-brand size-3.5" />
                    Vurgu Hizmet
                  </>
                ) : (
                  <>
                    <span className="bg-brand size-1.5 rounded-full" />
                    Hizmet
                  </>
                )}
              </div>
              <h1 className="font-heading mt-3 max-w-4xl text-4xl leading-[0.95] font-black tracking-tight sm:text-5xl lg:text-6xl">
                {data.label}
              </h1>
            </div>
          </div>
        </div>

        {/* Banner altı — subtitle + CTA */}
        <div className="border-border/40 mx-auto max-w-screen-2xl border-b px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed sm:text-lg">
            {data.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-7">
              <Link href="/iletisim">
                Bir brief paylaş
                <ArrowUpRight className="ml-1 size-4" />
              </Link>
            </Button>
            {isAi ? (
              <OpenChatButton size="lg" variant="ghost">
                <Sparkles className="mr-1 size-4" />
                Canlı AI demo dene
              </OpenChatButton>
            ) : null}
          </div>
        </div>
      </header>

      {/* Ne yapıyoruz — açık BG */}
      <div className="bg-muted">
        <section className="border-border/40 mx-auto max-w-screen-2xl border-b px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <div className="grid gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <div className="text-muted-foreground inline-flex items-center gap-3 text-xs tracking-widest uppercase">
              <span className="bg-brand size-1.5 rounded-full" />
              Ne Yapıyoruz
            </div>
            <h2 className="font-heading mt-5 text-4xl leading-tight font-black sm:text-5xl">
              {data.yapilanlarBaslik}
              <br />
              <span className="text-brand-mor">{data.yapilanlarAltBaslik}</span>
            </h2>
          </div>
          <p className="text-muted-foreground md:col-span-7 md:self-end md:text-lg">
            Hazır paket satmıyoruz. Her proje, markanın sektörü, bütçesi ve hedeflerine
            göre yeniden tasarlanır. Aşağıdakiler genel kategoriler — gerçek brief&apos;inle
            net çalışma planı çıkar.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.yapilanlar.map((y) => {
            const Icon = y.icon;
            return (
              <div
                key={y.baslik}
                className="border-border/60 hover:border-foreground/30 bg-card/40 group rounded-2xl border p-6 transition-colors"
              >
                <div className="bg-brand/10 text-brand inline-flex size-10 items-center justify-center rounded-lg">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{y.baslik}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {y.aciklama}
                </p>
              </div>
            );
          })}
        </div>
      </section>
      </div>

      {/* Süreç — koyu (default) */}
      <section className="border-border/40 mx-auto max-w-screen-2xl border-b px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="text-muted-foreground inline-flex items-center gap-3 text-xs tracking-widest uppercase">
              <span className="bg-brand-mor size-1.5 rounded-full" />
              Süreç
            </div>
            <h2 className="font-heading mt-5 text-4xl leading-tight font-black sm:text-5xl">
              {data.surecBaslik}
              <br />
              <span className="text-brand">{data.surecAltBaslik}</span>
            </h2>
            <p className="text-muted-foreground mt-6 max-w-xl">
              Süreler ve aşamalar projenin karmaşıklığına göre değişir. Aşağıdakiler
              tipik bir orta ölçek iş için yol haritası.
            </p>
          </div>
          <ol className="md:col-span-7 md:space-y-6">
            {data.surec.map((s) => (
              <li
                key={s.no}
                className="border-border/60 bg-card/30 hover:border-foreground/30 group flex gap-5 rounded-2xl border p-5 transition-colors sm:p-6"
              >
                <div className="text-foreground/30 group-hover:text-brand font-mono text-2xl font-bold transition-colors">
                  {s.no}
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight sm:text-xl">
                    {s.baslik}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {s.aciklama}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Stack / yaklaşım — açık BG */}
      <div className="bg-muted">
        <section className="border-border/40 mx-auto max-w-screen-2xl border-b px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="text-muted-foreground inline-flex items-center gap-3 text-xs tracking-widest uppercase">
              <Zap className="text-brand-yaprak size-3.5" />
              Yaklaşım
            </div>
            <h2 className="font-heading mt-5 text-4xl leading-tight font-black sm:text-5xl">
              {data.stackBaslik}
              <br />
              <span className="text-brand-yaprak">{data.stackAltBaslik}</span>
            </h2>
            <p className="text-muted-foreground mt-6 max-w-xl">
              Doğru araç doğru iş için. Her projede stack briefe göre seçilir — biz
              vendor lock-in yapmayız, sen değiştirmek istersen yanındayız.
            </p>
          </div>
          <div className="md:col-span-7 grid gap-5 sm:grid-cols-2">
            {data.stack.map((g) => (
              <div
                key={g.label}
                className="border-border/60 bg-card/40 rounded-xl border p-5"
              >
                <div className="text-muted-foreground text-xs tracking-wider uppercase">
                  {g.label}
                </div>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {g.items.map((i) => (
                    <li key={i} className="text-foreground/90">
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
      </div>

      {/* İlgili çalışmalar — koyu (default) */}
      <RelatedWorks serviceSlug={data.slug} serviceLabel={data.label} />

      {/* AI Kurulumları için özel canlı demo CTA */}
      {data.customCta ? (
        <section className="bg-noise relative overflow-hidden">
          <div className="from-brand/[0.04] absolute inset-0 -z-10 bg-gradient-to-br to-transparent" />
          <div className="mx-auto max-w-screen-2xl px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
            <div className="grid items-end gap-10 md:grid-cols-12">
              <div className="md:col-span-7">
                <div className="text-brand inline-flex items-center gap-2 text-xs tracking-widest uppercase">
                  <Sparkles className="size-3.5" />
                  {data.customCta.rozet}
                </div>
                <h2 className="font-heading mt-5 text-4xl leading-[0.95] font-black tracking-tight sm:text-5xl lg:text-6xl">
                  {data.customCta.baslik}
                </h2>
                <p className="text-muted-foreground mt-6 max-w-xl text-base leading-relaxed sm:text-lg">
                  {data.customCta.aciklama}
                </p>
              </div>
              <div className="md:col-span-5 md:justify-self-end">
                <Button asChild size="lg" className="h-12 px-7">
                  <Link href="/iletisim">
                    Brief paylaş + AI&apos;ı dene
                    <ArrowUpRight className="ml-1 size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        // Normal hizmetler için standart CTA bandı — açık BG
        <section className="bg-muted border-border/40 border-t">
          <div className="mx-auto flex max-w-screen-2xl flex-col items-start justify-between gap-6 px-4 py-16 sm:flex-row sm:items-center sm:px-6 lg:px-10">
            <h2 className="font-heading max-w-xl text-2xl leading-tight font-black tracking-tight sm:text-3xl">
              {data.label} ihtiyacın mı var?{" "}
              <span className="text-brand-mor">Konuşalım.</span>
            </h2>
            <Button asChild size="lg">
              <Link href="/iletisim">
                Brief paylaş
                <ArrowUpRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </section>
      )}
    </article>
  );
}
