import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

import { updateBlogPost } from "../actions";
import { BlogForm } from "../blog-form";
import { DeletePostButton } from "../delete-post-button";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ kaydedildi?: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("blog_posts").select("baslik").eq("id", id).single();
  return { title: data?.baslik ?? "Yazı" };
}

export default async function BlogDuzenlePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { kaydedildi } = await searchParams;
  const supabase = await createClient();
  const { data: post } = await supabase.from("blog_posts").select("*").eq("id", id).single();
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/blog">
            <ArrowLeft className="mr-1 size-4" />
            Blog
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {post.durum === "yayinda" ? (
            <Button asChild variant="ghost" size="sm">
              <Link href={`/blog/${post.slug}`} target="_blank">
                <ExternalLink className="mr-1 size-4" />
                Sitede aç
              </Link>
            </Button>
          ) : null}
          <DeletePostButton id={post.id} baslik={post.baslik} />
        </div>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">{post.baslik}</h1>
      <BlogForm
        action={updateBlogPost.bind(null, post.id)}
        initial={post}
        isNew={false}
        justSaved={kaydedildi === "1"}
      />
    </div>
  );
}
