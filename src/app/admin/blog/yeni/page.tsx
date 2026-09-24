import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { createBlogPost } from "../actions";
import { BlogForm } from "../blog-form";

export const metadata = { title: "Yeni yazı" };

export default function YeniBlogPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/admin/blog">
          <ArrowLeft className="mr-1 size-4" />
          Blog
        </Link>
      </Button>
      <h1 className="text-2xl font-semibold tracking-tight">Yeni yazı</h1>
      <BlogForm action={createBlogPost} isNew />
    </div>
  );
}
