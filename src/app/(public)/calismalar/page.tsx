import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Çalışmalar",
  description: "Kırmızı Erik portföyü — yayınlanan tüm çalışmalar.",
};

export default async function CalismalarPage() {
  const supabase = await createClient();
  const { data: works } = await supabase
    .from("case_studies")
    .select("slug, baslik, musteri_adi, kategori, kapak_url")
    .eq("durum", "yayinda")
    .order("yayin_tarihi", { ascending: false, nullsFirst: false });

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
      <div className="text-muted-foreground mb-6 inline-flex items-center gap-3 text-xs tracking-widest uppercase">
        <span className="bg-brand size-1.5 rounded-full" />
        Çalışmalar
      </div>
      <h1 className="font-heading max-w-3xl text-5xl leading-[0.95] font-black tracking-tight sm:text-7xl">
        Yaptıklarımız.
      </h1>
      <p className="text-muted-foreground mt-6 max-w-2xl text-base sm:text-lg">
        {works?.length ?? 0} yayında çalışma. Filtre + detay sayfaları yakında.
      </p>

      <div className="mt-14">
        {!works || works.length === 0 ? (
          <p className="text-muted-foreground">
            Henüz yayında çalışma yok. Admin panelden eklendikçe burada listelenecek.
          </p>
        ) : (
          <ul className="divide-border/40 divide-y">
            {works.map((w) => (
              <li key={w.slug} className="py-6">
                <div className="text-muted-foreground text-xs tracking-wider uppercase">
                  {w.musteri_adi}
                </div>
                <div className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {w.baslik}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
