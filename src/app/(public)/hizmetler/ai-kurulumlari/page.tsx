import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "AI Kurulumları",
  description:
    "Şirketlere özel AI kurulumları — markaya uygun chatbot, içerik üretim asistanı, müşteri hizmetleri otomasyonu. Brief sürecinde canlı AI deneyimi.",
};

export default function AIKurulumlariPage() {
  return (
    <article className="mx-auto max-w-screen-lg px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
      <div className="text-muted-foreground inline-flex items-center gap-3 text-xs tracking-widest uppercase">
        <Sparkles className="text-brand size-3.5" />
        Vurgu Hizmet
      </div>
      <h1 className="font-heading mt-4 text-5xl leading-[0.95] font-black tracking-tight sm:text-7xl">
        AI Kurulumları
      </h1>
      <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed">
        Markanızın sesiyle konuşan, müşterinizin ihtiyacını anlayan, içerik
        üreten ve operasyonu sadeleştiren AI sistemleri kuruyoruz. Tek bir
        chatbot değil; markanın dilini bilen, datayı sahip olduğunuz yerde
        tutan, sürdürülebilir bir kurulum.
      </p>

      <p className="text-muted-foreground mt-16 text-sm">
        Detaylı içerik (ne yapıyoruz, süreç, stack şeffaflığı, canlı demo
        widget) Faz 1 son haftasında gelecek.
      </p>

      <div className="mt-12">
        <Button asChild size="lg" className="h-12 px-7">
          <Link href="/iletisim">
            Bir brief paylaş
            <ArrowUpRight className="ml-1 size-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
