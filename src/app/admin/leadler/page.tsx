import Link from "next/link";

import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Lead'ler",
};

type SearchParams = Promise<{ durum?: string }>;

const durumlar = [
  { value: "yeni", label: "Yeni" },
  { value: "iletisim", label: "İletişimde" },
  { value: "teklif", label: "Teklif" },
  { value: "kazandi", label: "Kazandı" },
  { value: "kaybetti", label: "Kaybetti" },
] as const;

const filtreler = [{ value: "all", label: "Hepsi" }, ...durumlar];

const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  yeni: "default",
  iletisim: "secondary",
  teklif: "secondary",
  kazandi: "outline",
  kaybetti: "destructive",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminLeadlerPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const durum = params.durum;

  const supabase = await createClient();
  let query = supabase
    .from("leads")
    .select("id, ad_soyad, eposta, telefon, sirket, hizmet_kategori, butce, durum, kaynak, created_at")
    .order("created_at", { ascending: false });

  if (durum && durumlar.some((d) => d.value === durum)) {
    query = query.eq("durum", durum);
  }

  const { data: leads, error } = await query;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Lead&apos;ler</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Toplam {leads?.length ?? 0} kayıt
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filtreler.map((f) => {
          const active = (f.value === "all" && !durum) || f.value === durum;
          return (
            <Link
              key={f.value}
              href={f.value === "all" ? "/admin/leadler" : `/admin/leadler?durum=${f.value}`}
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
      ) : !leads || leads.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Henüz lead yok</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            İletişim formundan gelen brief&apos;ler burada listelenecek. AI Brief Asistanı Faz 4&apos;te
            iletişim sayfasına geliyor.
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kişi / Şirket</TableHead>
                <TableHead>İletişim</TableHead>
                <TableHead>İlgilendiği</TableHead>
                <TableHead>Bütçe</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">Tarih</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((l) => (
                <TableRow key={l.id} className="hover:bg-muted/30">
                  <TableCell>
                    <Link
                      href={`/admin/leadler/${l.id}`}
                      className="block font-medium hover:underline"
                    >
                      {l.ad_soyad}
                    </Link>
                    {l.sirket ? (
                      <div className="text-muted-foreground text-xs">{l.sirket}</div>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>{l.eposta}</div>
                    {l.telefon ? (
                      <div className="text-muted-foreground text-xs">{l.telefon}</div>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-sm">
                    {l.hizmet_kategori?.length ? l.hizmet_kategori.join(", ") : "—"}
                  </TableCell>
                  <TableCell className="text-sm">{l.butce ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={variants[l.durum] ?? "default"}>
                      {durumlar.find((d) => d.value === l.durum)?.label ?? l.durum}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right text-xs">
                    {formatDate(l.created_at)}
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
