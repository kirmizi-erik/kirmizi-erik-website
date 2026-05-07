import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  FileText,
  Headphones,
  Layers,
  ScanText,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "AI Kurulumları",
  description:
    "Şirketlere özel AI kurulumları — markaya uygun chatbot, içerik üretim asistanı, müşteri hizmetleri otomasyonu, doküman analizi. Markanın sesiyle konuşan, datayı sahip olduğun yerde tutan, sürdürülebilir AI sistemleri.",
};

const yapilanlar = [
  {
    icon: Bot,
    baslik: "Markaya Özel Chatbot",
    aciklama:
      "Ürün katalogun, SSS'in, marka tonun üzerine eğitilmiş, web sitende veya WhatsApp'ta çalışan asistan.",
  },
  {
    icon: FileText,
    baslik: "İçerik Üretim Asistanı",
    aciklama:
      "Sosyal medya post'u, e-posta, blog yazısı, ürün açıklaması — markanın sesi ve hedef kitlesine göre üreten ekip aracı.",
  },
  {
    icon: Headphones,
    baslik: "Müşteri Hizmetleri Otomasyonu",
    aciklama:
      "Sıkça gelen soruları otomatik yanıtla, karmaşık olanları doğru takıma yönlendir. CRM/destek sistemine bağlanır.",
  },
  {
    icon: ScanText,
    baslik: "Doküman / PDF Analizi",
    aciklama:
      "Sözleşme, fatura, rapor, başvuru — büyük doküman havuzlarını okuyan, özet/karşılaştırma çıkaran, ilgili bilgiyi anlık bulan asistan.",
  },
  {
    icon: Workflow,
    baslik: "İş Akışı Otomasyonu",
    aciklama:
      "E-posta tasnifi, lead skorlama, rapor üretimi, içerik onay süreçleri — manuel işleri AI ile sadeleştir, ekibin gerçek işe odaklansın.",
  },
  {
    icon: Layers,
    baslik: "Mevcut Ürüne AI Entegrasyonu",
    aciklama:
      "Web sitende veya uygulamanda akıllı arama, öneri sistemi, otomatik etiketleme — kullanıcı deneyimini AI ile zenginleştir.",
  },
];

const surec = [
  {
    no: "01",
    baslik: "Keşif",
    aciklama:
      "İhtiyacını dinleriz, mevcut süreçleri haritalandırırız. AI'nın gerçekten fark yaratacağı 1-2 noktayı belirler, kapsamı netleştiririz.",
  },
  {
    no: "02",
    baslik: "Veri & Stratejii",
    aciklama:
      "Kurumsal veri (kataloğun, SSS, dokümanlar, marka rehberi) toplanır. Hangi modelin/akışın doğru olacağı kararlaştırılır.",
  },
  {
    no: "03",
    baslik: "Prototip",
    aciklama:
      "1-2 hafta içinde çalışan bir prototip teslim edilir. Demo üzerinde birlikte iyileştirme turları yapılır.",
  },
  {
    no: "04",
    baslik: "Entegrasyon",
    aciklama:
      "Mevcut sistemlerine (web, CRM, Slack, WhatsApp, e-posta) bağlarız. Erişim kontrolü, log, izleme dahil.",
  },
  {
    no: "05",
    baslik: "Bakım & Geliştirme",
    aciklama:
      "Aylık paket: kullanım izleme, modeli güncelleme, yeni feature'lar, ekibinin eğitimi. Sistem yaşar, geriye düşmez.",
  },
];

const stack = [
  {
    label: "Foundation Models",
    items: ["Anthropic Claude (Opus, Sonnet, Haiku)", "OpenAI GPT serisi", "Google Gemini"],
  },
  {
    label: "Geliştirme",
    items: ["Anthropic SDK", "LangChain / LangGraph", "Vercel AI SDK", "Custom orchestration"],
  },
  {
    label: "Veri & Vektör",
    items: ["pgvector (Postgres)", "Pinecone / Weaviate", "Supabase, kurumsal DB'ler"],
  },
  {
    label: "Entegrasyon",
    items: ["WhatsApp Business API", "Slack, Microsoft Teams", "n8n, Make, Zapier", "Custom REST/GraphQL"],
  },
];

export default function AIKurulumlariPage() {
  return (
    <article>
      {/* Hero */}
      <header className="border-border/40 mx-auto max-w-screen-2xl border-b px-4 pt-16 pb-12 sm:px-6 lg:px-10 lg:pt-24">
        <div className="text-muted-foreground inline-flex items-center gap-3 text-xs tracking-widest uppercase">
          <Sparkles className="text-brand size-3.5" />
          Vurgu Hizmet
        </div>
        <h1 className="font-heading mt-5 max-w-4xl text-5xl leading-[0.95] font-black tracking-tight sm:text-7xl lg:text-[clamp(3.5rem,8vw,8rem)]">
          AI <span className="text-brand">Kurulumları</span>
        </h1>
        <p className="text-muted-foreground mt-8 max-w-2xl text-base leading-relaxed sm:text-lg">
          Markanın sesiyle konuşan, müşterinin ihtiyacını anlayan, içerik üreten
          ve operasyonu sadeleştiren AI sistemleri kuruyoruz. Tek bir chatbot
          değil — markanın dilini bilen, datayı sahip olduğun yerde tutan,
          sürdürülebilir bir kurulum.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 px-7">
            <Link href="/iletisim">
              Bir brief paylaş
              <ArrowUpRight className="ml-1 size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <Link href="/iletisim">
              <Sparkles className="mr-1 size-4" />
              Canlı AI demo dene
            </Link>
          </Button>
        </div>
      </header>

      {/* Ne yapıyoruz */}
      <section className="border-border/40 mx-auto max-w-screen-2xl border-b px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <div className="grid gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <div className="text-muted-foreground inline-flex items-center gap-3 text-xs tracking-widest uppercase">
              <span className="bg-brand size-1.5 rounded-full" />
              Ne Yapıyoruz
            </div>
            <h2 className="font-heading mt-5 text-4xl leading-tight font-black sm:text-5xl">
              Sıradan değil,
              <br />
              <span className="text-brand-mor">markana özgü.</span>
            </h2>
          </div>
          <p className="text-muted-foreground md:col-span-7 md:self-end md:text-lg">
            Hazır bir SaaS satmıyoruz. Her kurulum senin operasyonunu, kanallarını,
            dilini öğreniyor. Aşağıdakiler kategoriler — gerçek proje brief&apos;inle
            spesifik tasarlanır.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {yapilanlar.map((y) => {
            const Icon = y.icon;
            return (
              <div
                key={y.baslik}
                className="border-border/60 hover:border-foreground/30 bg-card/40 group rounded-2xl border p-6 transition-colors"
              >
                <div className="bg-brand/10 text-brand inline-flex size-10 items-center justify-center rounded-lg">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">
                  {y.baslik}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {y.aciklama}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Süreç */}
      <section className="border-border/40 mx-auto max-w-screen-2xl border-b px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="text-muted-foreground inline-flex items-center gap-3 text-xs tracking-widest uppercase">
              <span className="bg-brand-mor size-1.5 rounded-full" />
              Süreç
            </div>
            <h2 className="font-heading mt-5 text-4xl leading-tight font-black sm:text-5xl">
              Beş hafta,
              <br />
              <span className="text-brand">üç hafta sonra çalışan demo.</span>
            </h2>
            <p className="text-muted-foreground mt-6 max-w-xl">
              Süre proje karmaşıklığına göre değişir. Tipik bir orta ölçek kurulum
              4-6 hafta. Karmaşık entegrasyon/eğitim varsa daha uzun.
            </p>
          </div>
          <ol className="md:col-span-7 md:space-y-6">
            {surec.map((s) => (
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

      {/* Stack şeffaflığı */}
      <section className="border-border/40 mx-auto max-w-screen-2xl border-b px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="text-muted-foreground inline-flex items-center gap-3 text-xs tracking-widest uppercase">
              <Zap className="text-brand-yaprak size-3.5" />
              Stack Şeffaflığı
            </div>
            <h2 className="font-heading mt-5 text-4xl leading-tight font-black sm:text-5xl">
              Neyle
              <br />
              <span className="text-brand-yaprak">çalışıyoruz?</span>
            </h2>
            <p className="text-muted-foreground mt-6 max-w-xl">
              Doğru araç, doğru ihtiyaç için. Her projede stack briefe göre seçilir
              — biz vendor lock-in yapmayız, sen değiştirmek isterse senin yanındayız.
            </p>
          </div>
          <div className="md:col-span-7 grid gap-5 sm:grid-cols-2">
            {stack.map((g) => (
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

      {/* Canlı demo CTA */}
      <section className="bg-noise relative overflow-hidden">
        <div className="from-brand/[0.04] absolute inset-0 -z-10 bg-gradient-to-br to-transparent" />
        <div className="mx-auto max-w-screen-2xl px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
          <div className="grid items-end gap-10 md:grid-cols-12">
            <div className="md:col-span-7">
              <div className="text-brand inline-flex items-center gap-2 text-xs tracking-widest uppercase">
                <Sparkles className="size-3.5" />
                Canlı Demo
              </div>
              <h2 className="font-heading mt-5 text-4xl leading-[0.95] font-black tracking-tight sm:text-5xl lg:text-6xl">
                Bu sayfayı
                <br />
                <span className="text-brand">yazan AI</span>&apos;ı şu anda dene.
              </h2>
              <p className="text-muted-foreground mt-6 max-w-xl text-base leading-relaxed sm:text-lg">
                İletişim sayfasındaki <strong>AI Brief Asistanı</strong>, Claude
                Haiku 4.5 üzerine kurduğumuz sistemin canlı bir örneği. Brief&apos;ini
                yazarken anlık değerlendiriyor, eksik gördüklerini söylüyor, en
                uygun hizmetleri öneriyor.
              </p>
              <p className="text-muted-foreground/80 mt-3 max-w-xl text-sm">
                Bunun gibi bir asistanı senin için de kuruyoruz — markanın
                verisiyle, markanın diliyle.
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
    </article>
  );
}
