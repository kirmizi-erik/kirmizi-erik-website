import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { readingMinutes } from "@/lib/validations/blog";
import { kategoriOptions } from "@/lib/validations/case-study";

export const metadata = {
  title: "Blog — Reklam, Video, Web ve AI Rehberleri",
  description:
    "Reklam filmi, kurumsal web sitesi, sosyal medya ve şirketlere özel yapay zekâ üzerine pratik rehberler. 25 yıllık ajans deneyiminden, karar vermeden önce bilmen gerekenler.",
  alternates: { canonical: "/blog" },
};

function formatTarih(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, baslik, ozet, kapak_url, kategori, yayin_tarihi, icerik")
    .eq("durum", "yayinda")
    .order("yayin_tarihi", { ascending: false, nullsFirst: false });

  return (
    <article className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
      <header className="max-w-3xl">
        <div className="text-muted-foreground inline-flex items-center gap-3 text-xs tracking-widest">
          <span className="bg-brand size-1.5 rounded-full" />
          BLOG
        </div>
        <h1 className="font-heading mt-4 text-4xl leading-[0.95] font-black tracking-tight sm:text-5xl lg:text-6xl">
          Karar vermeden önce oku.
        </h1>
        <p className="text-muted-foreground mt-5 text-base leading-relaxed sm:text-lg">
          Reklam filmi, web sitesi, sosyal medya ve yapay zekâ projelerinde en çok sorulan soruların
          cevapları — 25 yıllık ajans deneyiminden.
        </p>
      </header>

      {!posts || posts.length === 0 ? (
        <p className="text-muted-foreground mt-16">Yakında ilk yazılarımız burada.</p>
      ) : (
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group border-border/60 hover:border-foreground/30 flex flex-col overflow-hidden rounded-2xl border transition-colors"
            >
              <div className="bg-muted relative aspect-[1200/630] overflow-hidden">
                {p.kapak_url ? (
                  <Image
                    src={p.kapak_url}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  {p.kategori?.[0] ? (
                    <span className="text-brand">
                      {kategoriOptions.find((k) => k.value === p.kategori[0])?.label}
                    </span>
                  ) : null}
                  <span>{formatTarih(p.yayin_tarihi)}</span>
                  <span>{readingMinutes(p.icerik)} dk okuma</span>
                </div>
                <h2 className="font-heading mt-3 text-xl leading-snug font-bold tracking-tight">
                  {p.baslik}
                </h2>
                {p.ozet ? (
                  <p className="text-muted-foreground mt-3 line-clamp-3 text-sm leading-relaxed">
                    {p.ozet}
                  </p>
                ) : null}
                <span className="text-foreground mt-auto inline-flex items-center gap-1 pt-5 text-sm font-medium">
                  Devamını oku
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
