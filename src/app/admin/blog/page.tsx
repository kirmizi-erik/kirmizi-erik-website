import Image from "next/image";
import Link from "next/link";
import { ExternalLink, ImageIcon, Pencil, Plus, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { durumLabel, type CaseStudyDurum } from "@/lib/validations/case-study";

import { DeletePostButton } from "./delete-post-button";

export const metadata = { title: "Blog" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string; silindi?: string }>;

const durumVariant: Record<string, "default" | "secondary" | "outline"> = {
  yayinda: "default",
  taslak: "secondary",
  arsiv: "outline",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminBlogPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, silindi } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, slug, baslik, kapak_url, durum, yayin_tarihi, updated_at")
    .order("updated_at", { ascending: false });

  const query = q?.trim().toLocaleLowerCase("tr-TR");
  const posts = (data ?? []).filter(
    (p) => !query || p.baslik.toLocaleLowerCase("tr-TR").includes(query),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Blog</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {posts.length} yazı{query ? ` · "${q}" araması` : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/yeni">
            <Plus className="mr-1 size-4" />
            Yeni yazı
          </Link>
        </Button>
      </div>

      {silindi ? (
        <p className="rounded-md border border-emerald-600/30 bg-emerald-600/10 px-4 py-2 text-sm text-emerald-600">
          Yazı silindi.
        </p>
      ) : null}

      <form method="get" className="flex max-w-sm items-center gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input name="q" defaultValue={q} placeholder="Başlıkta ara…" className="pl-8" />
        </div>
        {q ? (
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/blog">Temizle</Link>
          </Button>
        ) : null}
      </form>

      {error ? (
        <Card className="text-destructive p-6 text-sm">Veri yüklenemedi: {error.message}</Card>
      ) : posts.length === 0 ? (
        <Card className="text-muted-foreground p-6 text-sm">
          {query ? "Aramaya uyan yazı yok." : "Henüz yazı yok. İlk yazıyı ekleyerek başla."}
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16" />
                <TableHead>Başlık</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Yayın</TableHead>
                <TableHead className="text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link
                      href={`/admin/blog/${p.id}`}
                      className="bg-muted relative block size-12 overflow-hidden rounded"
                    >
                      {p.kapak_url ? (
                        <Image
                          src={p.kapak_url}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <ImageIcon className="text-muted-foreground absolute inset-0 m-auto size-5" />
                      )}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/blog/${p.id}`} className="font-medium hover:underline">
                      {p.baslik}
                    </Link>
                    <div className="text-muted-foreground text-xs">/blog/{p.slug}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={durumVariant[p.durum] ?? "secondary"}>
                      {durumLabel[p.durum as CaseStudyDurum] ?? p.durum}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatDate(p.yayin_tarihi)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {p.durum === "yayinda" ? (
                        <Button asChild variant="ghost" size="sm" aria-label="Sitede aç">
                          <Link href={`/blog/${p.slug}`} target="_blank">
                            <ExternalLink className="size-4" />
                          </Link>
                        </Button>
                      ) : null}
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/blog/${p.id}`}>
                          <Pencil className="mr-1 size-4" />
                          Düzenle
                        </Link>
                      </Button>
                      <DeletePostButton id={p.id} baslik={p.baslik} compact />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
