import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("case_studies")
    .select("baslik, ozet, kapak_url")
    .eq("slug", slug)
    .eq("durum", "yayinda")
    .single();
  if (!data) return { title: "Çalışma bulunamadı" };
  return {
    title: data.baslik,
    description: data.ozet ?? undefined,
    openGraph: data.kapak_url ? { images: [data.kapak_url] } : undefined,
  };
}

export default async function CalismaDetayPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: work } = await supabase
    .from("case_studies")
    .select("*")
    .eq("slug", slug)
    .eq("durum", "yayinda")
    .single();

  if (!work) notFound();

  return (
    <article className="mx-auto max-w-screen-lg px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
      <div className="text-muted-foreground text-xs tracking-widest uppercase">
        {work.musteri_adi}
      </div>
      <h1 className="font-heading mt-3 text-4xl leading-[1.05] font-black tracking-tight sm:text-6xl">
        {work.baslik}
      </h1>
      {work.ozet ? (
        <p className="text-muted-foreground mt-6 max-w-2xl text-base sm:text-lg">
          {work.ozet}
        </p>
      ) : null}

      <p className="text-muted-foreground mt-16 text-sm">
        Detaylı case study render (problem / çözüm / sonuç + galeri) Faz 2-3&apos;te
        gelecek.
      </p>
    </article>
  );
}
