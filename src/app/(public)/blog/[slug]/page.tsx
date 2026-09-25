import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Sparkles } from "lucide-react";

import { Markdown } from "@/components/site/markdown";
import { OpenChatButton } from "@/components/site/open-chat-button";
import { QuickLeadForm } from "@/components/site/quick-lead-form";
import { breadcrumbSchema, blogPostingSchema, jsonLdScript } from "@/lib/schema";
import { serviceByKategori } from "@/lib/services-data";
import { createClient } from "@/lib/supabase/server";
import { readingMinutes } from "@/lib/validations/blog";
import { kategoriOptions } from "@/lib/validations/case-study";

type PageProps = { params: Promise<{ slug: string }> };

async function getPost(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("durum", "yayinda")
    .single();
  return data;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Yazı bulunamadı" };
  return {
    title: post.seo_baslik || post.baslik,
    description: post.ozet ?? undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.seo_baslik || post.baslik,
      description: post.ozet ?? undefined,
      images: post.kapak_url ? [post.kapak_url] : undefined,
      publishedTime: post.yayin_tarihi ?? undefined,
      modifiedTime: post.updated_at,
    },
  };
}

function formatTarih(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogYaziPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const anaKategori = post.kategori[0];
  const hizmet = anaKategori ? serviceByKategori(anaKategori) : null;

  const supabase = await createClient();
  const { data: digerleri } = await supabase
    .from("blog_posts")
    .select("slug, baslik")
    .eq("durum", "yayinda")
    .neq("slug", post.slug)
    .order("yayin_tarihi", { ascending: false })
    .limit(3);

  return (
    <article className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(blogPostingSchema(post))}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          breadcrumbSchema([
            { name: "Ana Sayfa", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.baslik, path: `/blog/${post.slug}` },
          ]),
        )}
      />

      <Link
        href="/blog"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" />
        Blog
      </Link>

      <header className="mx-auto mt-8 max-w-3xl">
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {anaKategori ? (
            <span className="text-brand">
              {kategoriOptions.find((k) => k.value === anaKategori)?.label}
            </span>
          ) : null}
          <span>{formatTarih(post.yayin_tarihi)}</span>
          <span>{readingMinutes(post.icerik)} dk okuma</span>
        </div>
        <h1 className="font-heading mt-4 text-3xl leading-tight font-black tracking-tight sm:text-4xl lg:text-5xl">
          {post.baslik}
        </h1>
        {post.ozet ? (
          <p className="text-muted-foreground mt-5 text-lg leading-relaxed">{post.ozet}</p>
        ) : null}
      </header>

      {post.kapak_url ? (
        <div className="border-border relative mx-auto mt-10 aspect-[1200/630] max-w-4xl overflow-hidden rounded-2xl border">
          <Image
            src={post.kapak_url}
            alt={post.baslik}
            fill
            priority
            sizes="(min-width: 1024px) 896px, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="mx-auto mt-10 max-w-3xl">
        <Markdown>{post.icerik}</Markdown>

        {hizmet ? (
          <Link
            href={`/hizmetler/${hizmet.slug}`}
            className="border-border hover:border-foreground/30 group mt-12 flex items-center justify-between gap-4 rounded-2xl border p-6 transition-colors"
          >
            <div>
              <div className="text-muted-foreground text-xs tracking-widest">İLGİLİ HİZMET</div>
              <div className="font-heading mt-1 text-xl font-bold">{hizmet.seoTitle}</div>
              <p className="text-muted-foreground mt-1 text-sm">{hizmet.metaDescription}</p>
            </div>
            <ArrowUpRight className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        ) : null}
      </div>

      <section
        id="teklif-al"
        className="mx-auto mt-16 grid max-w-5xl scroll-mt-20 gap-8 md:grid-cols-12"
      >
        <div className="md:col-span-5">
          <h2 className="font-heading text-2xl leading-tight font-black tracking-tight sm:text-3xl">
            Projen için konuşalım.
          </h2>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed">
            Formu bırak, aynı gün dönüş yapalım. Önce soru sormak istersen asistanımız 7/24 burada.
          </p>
          <OpenChatButton variant="ghost" className="mt-4 cursor-pointer">
            <Sparkles className="mr-1 size-4" />
            Asistana sor
          </OpenChatButton>
        </div>
        <div className="md:col-span-7">
          <QuickLeadForm
            kaynak={`/blog/${post.slug}`}
            konu={hizmet?.label ?? "Projen"}
            kategori={anaKategori ?? ""}
          />
        </div>
      </section>

      {digerleri && digerleri.length > 0 ? (
        <nav className="border-border/60 mx-auto mt-16 max-w-3xl border-t pt-8">
          <div className="text-muted-foreground text-xs tracking-widest">DİĞER YAZILAR</div>
          <ul className="mt-4 space-y-3">
            {digerleri.map((d) => (
              <li key={d.slug}>
                <Link href={`/blog/${d.slug}`} className="hover:text-brand font-medium">
                  {d.baslik}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </article>
  );
}
