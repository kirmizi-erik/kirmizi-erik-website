import Link from "next/link";
import { Plus, Sparkles, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import {
  durumLabel,
  type CaseStudyDurum,
} from "@/lib/validations/case-study";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Çalışmalar",
};

type SearchParams = Promise<{ durum?: string }>;

const durumVariant: Record<CaseStudyDurum, "default" | "secondary" | "outline"> = {
  yayinda: "default",
  taslak: "secondary",
  arsiv: "outline",
};

const filtreler: { value: "all" | CaseStudyDurum; label: string }[] = [
  { value: "all", label: "Hepsi" },
  { value: "taslak", label: "Taslak" },
  { value: "yayinda", label: "Yayında" },
  { value: "arsiv", label: "Arşiv" },
];

export default async function AdminCalismalarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const durum = params.durum;

  const supabase = await createClient();
  let query = supabase
    .from("case_studies")
    .select("id, baslik, slug, musteri_adi, kategori, durum, one_cikan, yayin_tarihi, updated_at")
    .order("updated_at", { ascending: false });

  if (durum && ["taslak", "yayinda", "arsiv"].includes(durum)) {
    query = query.eq("durum", durum);
  }

  const { data: works, error } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Çalışmalar</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Toplam {works?.length ?? 0} kayıt
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/calismalar/yeni">
            <Plus className="mr-2 size-4" />
            Yeni çalışma
          </Link>
        </Button>
      </div>

      {/* Filtre */}
      <div className="flex flex-wrap gap-2">
        {filtreler.map((f) => {
          const active = (f.value === "all" && !durum) || f.value === durum;
          return (
            <Link
              key={f.value}
              href={f.value === "all" ? "/admin/calismalar" : `/admin/calismalar?durum=${f.value}`}
              className={cn(
                "border-border rounded-full border px-4 py-1.5 text-xs transition-colors",
                active
                  ? "bg-foreground text-background border-foreground"
                  : "text-muted-foreground hover:text-foreground hover:border-foreground/40",
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {error ? (
        <Card>
          <CardHeader>
            <CardTitle>Veri yüklenemedi</CardTitle>
          </CardHeader>
          <CardContent className="text-destructive text-sm">{error.message}</CardContent>
        </Card>
      ) : !works || works.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Henüz çalışma yok</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            İlk çalışmayı eklemek için sağ üstteki <strong>Yeni çalışma</strong> butonunu kullan.
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[260px]">Başlık</TableHead>
                <TableHead>Müşteri</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Öne çıkan</TableHead>
                <TableHead className="text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {works.map((w) => (
                <TableRow key={w.id} className="hover:bg-muted/30">
                  <TableCell>
                    <Link
                      href={`/admin/calismalar/${w.id}/duzenle`}
                      className="block font-medium hover:underline"
                    >
                      {w.baslik}
                    </Link>
                    <div className="text-muted-foreground text-xs">
                      {w.kategori?.length ? w.kategori.join(" · ") : w.slug}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{w.musteri_adi ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={durumVariant[w.durum as CaseStudyDurum]}>
                      {durumLabel[w.durum as CaseStudyDurum]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {w.one_cikan ? (
                      <Sparkles className="text-brand size-4" />
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {w.durum === "yayinda" ? (
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/calismalar/${w.slug}`} target="_blank">
                          <ExternalLink className="mr-1 size-3.5" />
                          Görüntüle
                        </Link>
                      </Button>
                    ) : null}
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
