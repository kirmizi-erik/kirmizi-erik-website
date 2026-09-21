import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  ImageIcon,
  Pencil,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { parseVideoUrl } from "@/lib/embed";
import { createClient } from "@/lib/supabase/server";
import { durumLabel, kategoriOptions, type CaseStudyDurum } from "@/lib/validations/case-study";
import { cn } from "@/lib/utils";

import { DeleteCaseButton } from "./delete-case-button";

export const metadata = {
  title: "Çalışmalar",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  durum?: string;
  q?: string;
  kategori?: string;
  sort?: string;
  dir?: string;
}>;

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

const lower = (s: string) => s.toLocaleLowerCase("tr-TR");

type Sortable = "baslik" | "musteri" | "durum" | "guncelleme";

type ListState = {
  sort: Sortable;
  dir: "asc" | "desc";
  durum?: string;
  q: string;
  kategori: string;
};

/** Sıralama başlığı — mevcut filtreleri koruyarak yön değiştirir. */
function SortTh({
  alan,
  label,
  className,
  state,
}: {
  alan: Sortable;
  label: string;
  className?: string;
  state: ListState;
}) {
  const aktif = state.sort === alan;
  const next = new URLSearchParams();
  if (state.durum) next.set("durum", state.durum);
  if (state.q) next.set("q", state.q);
  if (state.kategori) next.set("kategori", state.kategori);
  next.set("sort", alan);
  next.set("dir", aktif && state.dir === "asc" ? "desc" : "asc");

  return (
    <TableHead className={className}>
      <Link
        href={`/admin/calismalar?${next.toString()}`}
        className={cn(
          "inline-flex items-center gap-1 transition-colors",
          aktif ? "text-foreground" : "hover:text-foreground",
        )}
      >
        {label}
        {aktif ? (
          state.dir === "asc" ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowDown className="size-3.5" />
          )
        ) : null}
      </Link>
    </TableHead>
  );
}

export default async function AdminCalismalarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const durum = params.durum;
  const q = params.q?.trim() ?? "";
  const kategori = params.kategori ?? "";
  const sort = (params.sort ?? "guncelleme") as Sortable;
  const dir = params.dir === "asc" ? "asc" : "desc";

  const supabase = await createClient();
  let query = supabase
    .from("case_studies")
    .select(
      "id, baslik, slug, musteri_adi, sektor, kategori, kapak_url, kapak_video_url, durum, one_cikan, yayin_tarihi, updated_at",
    )
    .order("updated_at", { ascending: false });

  if (durum && ["taslak", "yayinda", "arsiv"].includes(durum)) {
    query = query.eq("durum", durum);
  }
  if (kategori) {
    query = query.contains("kategori", [kategori]);
  }

  const { data, error } = await query;

  // Arama ve sıralama Türkçe harf kurallarına göre burada yapılır —
  // Postgres ilike'ı i/İ ve ı/I çiftlerinde beklendiği gibi davranmıyor.
  let works = data ?? [];
  if (q) {
    const needle = lower(q);
    works = works.filter((w) =>
      [w.baslik, w.musteri_adi, w.sektor, w.slug]
        .filter(Boolean)
        .some((f) => lower(String(f)).includes(needle)),
    );
  }

  works = [...works].sort((a, b) => {
    const yon = dir === "asc" ? 1 : -1;
    switch (sort) {
      case "baslik":
        return lower(a.baslik ?? "").localeCompare(lower(b.baslik ?? ""), "tr") * yon;
      case "musteri":
        return lower(a.musteri_adi ?? "").localeCompare(lower(b.musteri_adi ?? ""), "tr") * yon;
      case "durum":
        return lower(a.durum ?? "").localeCompare(lower(b.durum ?? ""), "tr") * yon;
      default:
        return (
          (new Date(a.updated_at ?? 0).getTime() - new Date(b.updated_at ?? 0).getTime()) * yon
        );
    }
  });

  const filtreliMi = Boolean(q || kategori || durum);
  const state: ListState = { sort, dir, durum, q, kategori };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Çalışmalar</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {works.length} kayıt
            {q ? ` · "${q}" araması` : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/calismalar/yeni">
            <Plus className="mr-2 size-4" />
            Yeni çalışma
          </Link>
        </Button>
      </div>

      {/* Arama + kategori */}
      <form method="get" className="flex flex-wrap items-center gap-2">
        {durum ? <input type="hidden" name="durum" value={durum} /> : null}
        <input type="hidden" name="sort" value={sort} />
        <input type="hidden" name="dir" value={dir} />

        <div className="relative min-w-[240px] flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Başlık, müşteri veya sektör ara…"
            className="pl-9"
          />
        </div>

        <select
          name="kategori"
          defaultValue={kategori}
          className="border-border bg-background h-9 cursor-pointer rounded-md border px-3 text-sm"
        >
          <option value="">Tüm kategoriler</option>
          {kategoriOptions.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>

        <Button type="submit" variant="secondary" className="cursor-pointer">
          Ara
        </Button>
        {filtreliMi ? (
          <Button asChild variant="ghost" className="cursor-pointer">
            <Link href="/admin/calismalar">Temizle</Link>
          </Button>
        ) : null}
      </form>

      {/* Durum filtresi */}
      <div className="flex flex-wrap gap-2">
        {filtreler.map((f) => {
          const active = (f.value === "all" && !durum) || f.value === durum;
          const sp = new URLSearchParams();
          if (f.value !== "all") sp.set("durum", f.value);
          if (q) sp.set("q", q);
          if (kategori) sp.set("kategori", kategori);
          const qs = sp.toString();

          return (
            <Link
              key={f.value}
              href={qs ? `/admin/calismalar?${qs}` : "/admin/calismalar"}
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
      ) : works.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {filtreliMi ? "Eşleşen çalışma yok" : "Henüz çalışma yok"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            {filtreliMi ? (
              <>
                Aramayı veya filtreyi değiştir, ya da <strong>Temizle</strong> ile hepsini gör.
              </>
            ) : (
              <>
                İlk çalışmayı eklemek için sağ üstteki <strong>Yeni çalışma</strong> butonunu
                kullan.
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[72px]">Görsel</TableHead>
                <SortTh state={state} alan="baslik" label="Başlık" className="min-w-[240px]" />
                <SortTh state={state} alan="musteri" label="Müşteri" />
                <SortTh state={state} alan="durum" label="Durum" />
                <TableHead>Öne çıkan</TableHead>
                <SortTh state={state} alan="guncelleme" label="Güncelleme" />
                <TableHead className="text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {works.map((w) => {
                const video = parseVideoUrl(w.kapak_video_url);
                const kapak = w.kapak_url ?? (video?.kind === "youtube" ? video.thumbnail : null);

                return (
                  <TableRow key={w.id} className="hover:bg-muted/30">
                    <TableCell>
                      <Link
                        href={`/admin/calismalar/${w.id}/duzenle`}
                        className="border-border bg-muted/40 block size-12 overflow-hidden rounded-md border"
                      >
                        {kapak ? (
                          <Image
                            src={kapak}
                            alt=""
                            width={96}
                            height={96}
                            className="size-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="text-muted-foreground/50 flex size-full items-center justify-center">
                            <ImageIcon className="size-4" />
                          </span>
                        )}
                      </Link>
                    </TableCell>

                    <TableCell>
                      <Link
                        href={`/admin/calismalar/${w.id}/duzenle`}
                        className="block font-medium hover:underline"
                      >
                        {w.baslik}
                      </Link>
                      <div className="text-muted-foreground text-xs">
                        {w.kategori?.length
                          ? w.kategori
                              .map(
                                (k: string) =>
                                  kategoriOptions.find((o) => o.value === k)?.label ?? k,
                              )
                              .join(" · ")
                          : w.slug}
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

                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      {w.updated_at
                        ? new Date(w.updated_at).toLocaleDateString("tr-TR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "—"}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="sm" className="cursor-pointer">
                          <Link href={`/admin/calismalar/${w.id}/duzenle`}>
                            <Pencil className="mr-1 size-3.5" />
                            Düzenle
                          </Link>
                        </Button>
                        {w.durum === "yayinda" ? (
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground cursor-pointer"
                          >
                            <Link
                              href={`/calismalar/${w.slug}`}
                              target="_blank"
                              aria-label={`${w.baslik} sayfasını aç`}
                            >
                              <ExternalLink className="size-3.5" />
                            </Link>
                          </Button>
                        ) : null}
                        <DeleteCaseButton id={w.id} baslik={w.baslik} compact />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
