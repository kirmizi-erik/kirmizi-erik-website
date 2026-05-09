import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Award, Globe, Sparkles, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Biz Kimiz",
  description:
    "2001'de YouTube yokken kurulduk. 25 yıl, 300'e yakın marka, 6 ülke. Reklam tarlasının kırmızı eriği — Özkan Kurt'un yönetiminde, her brief'e özel uzman ekiple devam ediyoruz.",
};

const ozkanManifesto = [
  {
    no: "01",
    baslik: "25 yıl ayakta kalmak şanstan değil, inattan.",
    metin:
      "Ajans kurmak kolaydır, kapatmak daha kolay. Bu sektörde 25 yıl masa başında durmak; her sezon başkasının “bu yıl trend” dediği şeye atlamayı reddetmekle olur.",
  },
  {
    no: "02",
    baslik: "AI'a şimdi başlayan ajansa hoş geldin demiyorum.",
    metin:
      "2001'de YouTube yokken dijitalin içindeydim. Her teknolojinin ilk versiyonunu denedim — çoğu çöp çıktı, gerisi iş yaptı. “Bu yıl AI yılı” diyenler, bizim 5 yıl önce öğrendiğimiz şeyi yeni keşfediyor.",
  },
  {
    no: "03",
    baslik: "Brief getirip cevap bekleyene değil, soru sorana çalışırım.",
    metin:
      "“Yarına logo lazım” brief değildir; “neden, kime, ne için”in cevabıdır. Cevabını sen de bilmiyorsan birlikte oturalım. Hazır şablon istiyorsan kapı bu değil.",
  },
  {
    no: "04",
    baslik: "Güzel tasarım çok, satan fikir az.",
    metin:
      "AI artık tasarımı 5 saniyede üretiyor. Geriye kalan ne? Doğru fikir. Çerçeveletilecek post yapmıyorum, akılda kalan iş yapıyorum — fark burada.",
  },
  {
    no: "05",
    baslik: "Marka emanettir, müşteri değil iş ortağıdır.",
    metin:
      "Bir markayı alırken bir sonraki ajansı düşünmüyorum, beş yıl sonrasını düşünüyorum. Sezonluk kazanç için 25 yıllık tecrübeyi yakmam.",
  },
];

const ajansManifesto = [
  {
    no: "01",
    baslik: "Üç ajans aramaktan vazgeç. Tek çatı, tek brief.",
    metin:
      "Çekim bir yerden, dijital başka yerden, yazılım üçüncü yerden — bu modeli 2001'de bıraktık. Hâlâ böyle çalışan ajansla iş yapıyorsan zamanını boşa harcıyorsun.",
  },
  {
    no: "02",
    baslik: "Ödüllü iş güzeldir, satan iş şarttır.",
    metin:
      "Cesur tasarım yapacağız ama çerçeveye girsin diye değil. Konsept de ölçü de bizde — birini kurban edenle çalışmayız.",
  },
  {
    no: "03",
    baslik: "AI'dan korkan ajansa gitme.",
    metin:
      "2001'de YouTube yokken dijitalin içindeydik. Her teknoloji dalgasını erken yakaladık. AI bugün sadece bir araç; “kullanıyoruz” diyenler değil, 5 yıldır kuruyoruz diyenleriz.",
  },
  {
    no: "04",
    baslik: "Brief alıp kaybolan değil, yan yana yürüyen ajansız.",
    metin:
      "İhale kültürü bizde yok. ~300 markayla, 6 ülkede yıllarca yürüdük; çoğu hâlâ aynı masada.",
  },
  {
    no: "05",
    baslik: "Sürpriz fatura yok. Olmayacak da.",
    metin:
      "Süreç şeffaf, fatura net. “Ekstra revizyon”, “gizli kalem”, “yine geliriz” yok. 25 yıllık iş, gizli kalem üzerine kurulmaz.",
  },
];

const surec = [
  {
    no: "01",
    baslik: "Brief & Keşif",
    quote: "Anlat, sonra biraz daha anlat.",
    metin:
      "Markanın hikâyesi, hedefi, takvimi, bütçesi. İyi brief 1 saatlik konuşmadan çıkmaz; gerekirse iki sefer otururuz, zorlu soruları erken sorarız.",
  },
  {
    no: "02",
    baslik: "Strateji & Konsept",
    quote: "Önce 'neden', sonra 'nasıl'.",
    metin:
      "Yarın Instagram reklamı çekmek değil; markanın 6 ay sonra nerede olacağını planlamak. Strateji yoksa kreatif sadece güzel görseldir.",
  },
  {
    no: "03",
    baslik: "Kreatif & Üretim",
    quote: "Cesur düşün, dürüst yap.",
    metin:
      "Çekim, tasarım, kod — hepsi aynı çatı, aynı brief'le. Ödün vermediğimiz iki şey: konsept bütünlüğü ve teslim tarihi.",
  },
  {
    no: "04",
    baslik: "Test & Onay",
    quote: "Düzeltme süreçten önce.",
    metin:
      "Sürpriz teslim sevmeyiz. Ara mockup, prototip, A/B test — son güne bırakmadan birlikte yön düzeltiriz.",
  },
  {
    no: "05",
    baslik: "Lansman & Ölçüm",
    quote: "Yayında biten iş yoktur.",
    metin:
      "Performans verisi, kullanıcı geri bildirimi, dönüşüm raporu. Birinci sürüm yayına çıktığında işin yarısı yeni başlamıştır.",
  },
];

const rakamlar = [
  { sayi: "25", birim: "yıl", aciklama: "Masa başında, ayakta." },
  { sayi: "300+", birim: "marka", aciklama: "Yan yana yürüdük." },
  { sayi: "6", birim: "ülke", aciklama: "Türkiye'den dışarı." },
  { sayi: "Binlerce", birim: "proje", aciklama: "Tamamlandı, teslim edildi." },
];

export default function BizKimizPage() {
  return (
    <article>
      {/* 1. Hero — banner görsel + text overlay (üst), subtitle (alt) */}
      <header>
        {/* Üst banner — atmospheric arka plan, sol-alt'ta rozet + başlık */}
        <div className="relative h-72 w-full overflow-hidden sm:h-80 lg:h-96">
          <Image
            src="/hero/biz-kimiz-hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Alt fade — okunabilirlik */}
          <div className="from-background/0 via-background/30 to-background absolute inset-0 bg-gradient-to-b" />
          {/* Sol fade — başlık keskin okunsun */}
          <div className="from-background/70 absolute inset-0 bg-gradient-to-r via-transparent to-transparent" />

          {/* Text overlay — sol-altta */}
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-screen-2xl px-4 pb-8 sm:px-6 lg:px-10 lg:pb-12">
              <div className="text-muted-foreground inline-flex items-center gap-3 text-xs tracking-widest uppercase">
                <span className="bg-brand size-1.5 rounded-full" />
                Biz Kimiz
              </div>
              <h1 className="font-heading mt-4 max-w-5xl text-4xl leading-[0.95] font-black tracking-tight sm:text-6xl lg:text-7xl">
                25 yıldır aynı tarlada.
                <br />
                Aynı <span className="text-brand">erik</span>.
              </h1>
            </div>
          </div>
        </div>

        {/* Banner altı — subtitle paragraf */}
        <div className="border-border/40 mx-auto max-w-screen-2xl border-b px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
          <p className="text-muted-foreground max-w-3xl text-base leading-relaxed sm:text-lg">
            2001'de YouTube yokken kurulduk. Reklam tarlasının kırmızı eriği olduk
            — taze, dinamik, gözden kaçmayan. Bugün 25 yıllık birikim, 300'e
            yakın marka, 6 ülke ve hâlâ aynı masada bizimle yürüyen müşterilerle
            devam ediyoruz.
          </p>
        </div>
      </header>

      {/* 2. Özkan Kurt — bg-muted (Kurucu öne) */}
      <div className="bg-muted">
        <section className="border-border/40 mx-auto max-w-screen-2xl border-b px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
          <div className="grid gap-10 md:grid-cols-12 md:gap-12 lg:gap-16">
            {/* Sol — portre */}
            <div className="md:col-span-5">
              <div className="bg-background border-border/60 relative aspect-[4/5] overflow-hidden rounded-2xl border">
                <Image
                  src="/team/ozkan.jpg"
                  alt="Özkan Kurt — Kırmızı Erik kurucusu"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover object-[center_30%]"
                  priority
                />
              </div>
            </div>

            {/* Sağ — profil + kişisel manifesto */}
            <div className="md:col-span-7">
              <div className="text-muted-foreground inline-flex items-center gap-3 text-xs tracking-widest uppercase">
                <Sparkles className="text-brand size-3.5" />
                Kurucu
              </div>
              <h2 className="font-heading mt-5 text-4xl leading-[1] font-black tracking-tight sm:text-5xl lg:text-6xl">
                Bugün masanın başında,
                <br />
                <span className="text-brand">Özkan Kurt</span> var.
              </h2>
              <p className="text-muted-foreground mt-6 max-w-2xl text-base leading-relaxed sm:text-lg">
                Kırmızı Erik'i kuran dört arkadaştan biriydi. 25 yıl boyunca her
                dalgayı erken yakalamaya çalıştı; YouTube'dan AI'ya, kreatiften
                yazılıma geçişlerde markanın yanında durdu. Bugün ajansı tek
                başına yönetiyor — her brief'e o işe özel uzman ekip kuruyor.
                Yapay sosyallik değil, gerçek kontrol.
              </p>

              <div className="mt-12">
                <div className="text-muted-foreground inline-flex items-center gap-3 text-xs tracking-widest uppercase">
                  <span className="bg-brand-mor size-1.5 rounded-full" />
                  Özkan'ın 5 maddesi
                </div>

                <ol className="mt-6 space-y-4">
                  {ozkanManifesto.map((m) => (
                    <li
                      key={m.no}
                      className="border-border/60 bg-background/50 hover:border-foreground/30 group flex gap-5 rounded-2xl border p-5 transition-colors sm:p-6"
                    >
                      <div className="text-foreground/30 group-hover:text-brand font-mono text-xl font-bold transition-colors">
                        {m.no}
                      </div>
                      <div>
                        <h3 className="font-heading text-lg font-bold leading-tight tracking-tight sm:text-xl">
                          {m.baslik}
                        </h3>
                        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                          {m.metin}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 3. Hikâye — koyu */}
      <section className="border-border/40 mx-auto max-w-screen-2xl border-b px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="text-muted-foreground inline-flex items-center gap-3 text-xs tracking-widest uppercase">
              <span className="bg-brand size-1.5 rounded-full" />
              Hikâye
            </div>
            <h2 className="font-heading mt-5 text-4xl leading-tight font-black sm:text-5xl">
              2001'de bir tarla,
              <br />
              <span className="text-brand-mor">dört kurucu, bir isim.</span>
            </h2>
          </div>
          <div className="md:col-span-7 space-y-6 md:text-lg">
            <p className="text-muted-foreground leading-relaxed">
              Kırmızı Erik, 2001'de İstanbul'da dört arkadaşın kurduğu bir
              kreatif ajans olarak başladı. Reklam sektörü o yıllarda dijitale
              geçiş aşamasındaydı — YouTube bile henüz yoktu, dijital pazarlama
              &ldquo;yeni&rdquo; diye fısıldanan bir kavramdı.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              İsim de o günlerin ruhundan doğdu: Reklam tarlasında, dijitalin
              filiz verdiği ilk yıllarda yetişen taze, kırmızı bir erik.{" "}
              <span className="text-foreground">
                Erik = tazelik, hızlı büyüme, doğallık. Kırmızı = enerji, cesaret,
                dikkat çekme.
              </span>
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Aradan 25 yıl geçti. Sektör değişti, teknolojiler birkaç kez
              yeniden doğdu, ajanslar geldi geçti. Biz hâlâ buradayız —{" "}
              <span className="text-foreground">
                aynı isim, aynı tarla, daha keskin meyveler.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* 4. Ajans Manifestosu — bg-muted */}
      <div className="bg-muted">
        <section className="border-border/40 mx-auto max-w-screen-2xl border-b px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <div className="text-muted-foreground inline-flex items-center gap-3 text-xs tracking-widest uppercase">
                <span className="bg-brand-mor size-1.5 rounded-full" />
                Manifesto
              </div>
              <h2 className="font-heading mt-5 text-4xl leading-tight font-black sm:text-5xl">
                Nasıl çalıştığımızı
                <br />
                <span className="text-brand">açık söyleyelim.</span>
              </h2>
              <p className="text-muted-foreground mt-6 max-w-xl">
                25 yıllık iş tarzımızın özeti. Beş madde, eğip bükmeden.
              </p>
            </div>
            <ol className="md:col-span-7 space-y-5">
              {ajansManifesto.map((m) => (
                <li
                  key={m.no}
                  className="border-border/60 bg-background/50 hover:border-foreground/30 group flex gap-5 rounded-2xl border p-6 transition-colors"
                >
                  <div className="text-foreground/30 group-hover:text-brand font-mono text-2xl font-bold transition-colors">
                    {m.no}
                  </div>
                  <div>
                    <h3 className="font-heading text-xl leading-tight font-bold tracking-tight sm:text-2xl">
                      {m.baslik}
                    </h3>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed sm:text-base">
                      {m.metin}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>

      {/* 5. Sayılarla Biz — koyu */}
      <section className="border-border/40 mx-auto max-w-screen-2xl border-b px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="text-muted-foreground inline-flex items-center gap-3 text-xs tracking-widest uppercase">
              <Award className="text-brand-yaprak size-3.5" />
              25 yıl, rakamlar
            </div>
            <h2 className="font-heading mt-5 text-4xl leading-tight font-black sm:text-5xl">
              Sayılarla
              <br />
              <span className="text-brand-yaprak">biz.</span>
            </h2>
            <p className="text-muted-foreground mt-6 max-w-xl">
              Pazarlama dilinde değil, gerçek rakamlarla. Her sayı bir hikâye,
              her hikâyenin sonunda devam eden bir marka var.
            </p>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 gap-4 sm:gap-5">
            {rakamlar.map((r) => (
              <div
                key={r.birim}
                className="border-border/60 bg-card/40 rounded-2xl border p-6 sm:p-7"
              >
                <div className="font-heading text-foreground text-5xl leading-none font-black tracking-tight sm:text-6xl">
                  {r.sayi}
                </div>
                <div className="text-muted-foreground mt-3 text-xs tracking-widest uppercase">
                  {r.birim}
                </div>
                <p className="text-foreground/80 mt-3 text-sm">{r.aciklama}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ödüller */}
        <div className="border-border/40 mt-14 grid gap-6 border-t pt-10 md:grid-cols-2">
          <div className="border-border/60 bg-card/30 rounded-2xl border p-6">
            <Award className="text-brand size-6" />
            <h3 className="mt-4 text-lg font-semibold tracking-tight">
              Google Dijital Pazarlama Ödülleri
            </h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Kampanya etkinliği ve performans metriklerinde Google tarafından
              tanınan iş.
            </p>
          </div>
          <div className="border-border/60 bg-card/30 rounded-2xl border p-6">
            <Users className="text-brand-mor size-6" />
            <h3 className="mt-4 text-lg font-semibold tracking-tight">
              Üniversite Ödülleri
            </h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Akademik camiada referans gösterilen ve yarışmalarda
              ödüllendirilen kreatif çalışmalar.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Nasıl Çalışıyoruz — bg-muted */}
      <div className="bg-muted">
        <section className="border-border/40 mx-auto max-w-screen-2xl border-b px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <div className="text-muted-foreground inline-flex items-center gap-3 text-xs tracking-widest uppercase">
                <span className="bg-brand size-1.5 rounded-full" />
                Süreç
              </div>
              <h2 className="font-heading mt-5 text-4xl leading-tight font-black sm:text-5xl">
                Brief'ten ölçüme,
                <br />
                <span className="text-brand-mor">beş duraklı yolculuk.</span>
              </h2>
              <p className="text-muted-foreground mt-6 max-w-xl">
                Her hizmetin kendi tekniği var ama yaklaşımımız aynı. Hangi işi
                yaptığımızdan bağımsız, masaya oturduğumuzda izlediğimiz beş
                aşama.
              </p>
            </div>
            <ol className="md:col-span-7 space-y-5">
              {surec.map((s) => (
                <li
                  key={s.no}
                  className="border-border/60 bg-background/50 hover:border-foreground/30 group flex gap-5 rounded-2xl border p-5 transition-colors sm:p-6"
                >
                  <div className="text-foreground/30 group-hover:text-brand font-mono text-2xl font-bold transition-colors">
                    {s.no}
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold tracking-tight sm:text-xl">
                      {s.baslik}
                    </h3>
                    <p className="text-brand mt-1 font-mono text-xs tracking-wide">
                      &ldquo;{s.quote}&rdquo;
                    </p>
                    <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                      {s.metin}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Çalışma modeli */}
          <div className="border-border/60 from-brand/[0.05] mt-14 rounded-2xl border bg-gradient-to-br to-transparent p-6 sm:p-8">
            <div className="text-muted-foreground inline-flex items-center gap-3 text-xs tracking-widest uppercase">
              <Globe className="text-brand-yaprak size-3.5" />
              Çalışma Modeli
            </div>
            <h3 className="font-heading mt-4 text-2xl leading-tight font-black tracking-tight sm:text-3xl">
              Kalıcı koltuk yok. Doğru iş, doğru ekip.
            </h3>
            <p className="text-muted-foreground mt-4 max-w-3xl text-base leading-relaxed sm:text-lg">
              Her brief için Özkan Kurt'un yönetiminde o işe özel uzman ekip
              kuruyoruz — kreatif yönetmen, prodüksiyon, dijital, yazılım. Sabit
              kadronun maliyeti yerine, her projeye en doğru profesyoneli dahil
              ediyoruz. Senin gördüğün arayüz Özkan; arkasındaki ekip her brief'le
              değişiyor.
            </p>
          </div>
        </section>
      </div>

      {/* 7. CTA — koyu */}
      <section className="border-border/40 border-t">
        <div className="mx-auto flex max-w-screen-2xl flex-col items-start justify-between gap-6 px-4 py-16 sm:flex-row sm:items-center sm:px-6 lg:px-10">
          <h2 className="font-heading max-w-xl text-2xl leading-tight font-black tracking-tight sm:text-3xl">
            25 yıllık masaya{" "}
            <span className="text-brand-mor">bir brief ekle.</span>
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
