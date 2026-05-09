import Image from "next/image";

type Brand = {
  isim: string;
  logo: string;
};

const markalar: Brand[] = [
  { isim: "Harley-Davidson", logo: "/markalar/harley-davidson.png" },
  { isim: "Atlantis Pub & Bistro", logo: "/markalar/atlantis.png" },
  { isim: "Novawood", logo: "/markalar/novawood.png" },
  { isim: "HGR Hasar Restorasyonu", logo: "/markalar/hgr.png" },
  { isim: "Uludağ Marine", logo: "/markalar/uludag-marine.png" },
  { isim: "Target Poligon", logo: "/markalar/target-poligon.png" },
];

export function BrandsStrip() {
  return (
    <section
      id="markalar"
      className="border-border/40 mx-auto max-w-screen-2xl border-t px-4 py-20 sm:px-6 lg:px-10 lg:py-28"
    >
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="text-muted-foreground inline-flex items-center gap-3 text-xs tracking-widest uppercase">
            <span className="bg-brand size-1.5 rounded-full" />
            Markalarımız
          </div>
          <h2 className="font-heading mt-5 text-4xl leading-tight font-black sm:text-5xl lg:text-6xl">
            Birlikte <span className="text-brand-mor">çalıştığımız</span>
            <br />
            markalar.
          </h2>
        </div>
        <p className="text-muted-foreground max-w-xl text-base leading-relaxed md:col-span-7 md:self-end md:text-lg">
          Reklam ajansını seçerken &ldquo;daha önce kim&apos;in işini yaptın?&rdquo; sorusu
          haklı. İşte birlikte yol aldığımız bazı markalar — sektör çeşitliliği,
          ölçek farkı ve uzun soluklu işbirlikleri.
        </p>
      </div>

      {/* Logo şeridi — desktop'ta tek sıra, mobilde 3 sütun */}
      <div className="border-border/40 mt-12 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border bg-border/40 md:grid-cols-6">
        {markalar.map((m) => (
          <div
            key={m.isim}
            className="bg-background hover:bg-card group relative flex aspect-[3/2] items-center justify-center p-4 transition-colors sm:p-5 md:aspect-[4/3]"
          >
            <Image
              src={m.logo}
              alt={m.isim}
              width={180}
              height={90}
              loading="lazy"
              className="h-auto max-h-12 w-auto max-w-[85%] object-contain opacity-60 grayscale transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0 sm:max-h-14 md:max-h-16"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
