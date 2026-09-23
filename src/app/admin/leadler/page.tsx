import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

import { DURUMLAR, KANALLAR, leadKanal, type LeadKanal } from "./lead-meta";
import { LeadTable, type LeadRow } from "./lead-table";

export const metadata = {
  title: "Lead'ler",
};

type SearchParams = Promise<{ durum?: string; kanal?: string }>;

function filterHref(kanal: string | undefined, durum: string | undefined) {
  const params = new URLSearchParams();
  if (kanal) params.set("kanal", kanal);
  if (durum) params.set("durum", durum);
  const qs = params.toString();
  return qs ? `/admin/leadler?${qs}` : "/admin/leadler";
}

function Pill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "border-border rounded-full border px-4 py-1.5 text-xs transition-colors",
        active
          ? "bg-foreground text-background border-foreground"
          : "text-muted-foreground hover:text-foreground hover:border-foreground/40",
      )}
    >
      {children}
    </Link>
  );
}

export default async function AdminLeadlerPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const kanal = KANALLAR.some((k) => k.value === params.kanal)
    ? (params.kanal as LeadKanal)
    : undefined;
  const durum = DURUMLAR.some((d) => d.value === params.durum) ? params.durum : undefined;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(
      "id, ad_soyad, eposta, telefon, sirket, hizmet_kategori, butce, durum, kaynak, created_at",
    )
    .order("created_at", { ascending: false });

  const all: LeadRow[] = (data ?? []).map(({ kaynak, ...l }) => ({
    ...l,
    kanal: leadKanal(kaynak),
  }));
  const kanalCount = (k: LeadKanal) => all.filter((l) => l.kanal === k).length;
  const inKanal = kanal ? all.filter((l) => l.kanal === kanal) : all;
  const leads = durum ? inKanal.filter((l) => l.durum === durum) : inKanal;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Lead&apos;ler</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {leads.length} kayıt gösteriliyor · toplam {all.length}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Pill href={filterHref(undefined, durum)} active={!kanal}>
            Tümü ({all.length})
          </Pill>
          {KANALLAR.map((k) => (
            <Pill key={k.value} href={filterHref(k.value, durum)} active={kanal === k.value}>
              {k.label} ({kanalCount(k.value)})
            </Pill>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Pill href={filterHref(kanal, undefined)} active={!durum}>
            Tüm durumlar
          </Pill>
          {DURUMLAR.map((d) => (
            <Pill key={d.value} href={filterHref(kanal, d.value)} active={durum === d.value}>
              {d.label}
            </Pill>
          ))}
        </div>
      </div>

      {error ? (
        <Card>
          <CardHeader>
            <CardTitle>Veri yüklenemedi</CardTitle>
          </CardHeader>
          <CardContent className="text-destructive text-sm">{error.message}</CardContent>
        </Card>
      ) : leads.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {all.length === 0 ? "Henüz lead yok" : "Bu filtrede kayıt yok"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            İletişim formlarından ve chatbot&apos;tan gelen lead&apos;ler burada listelenir.
          </CardContent>
        </Card>
      ) : (
        <LeadTable leads={leads} />
      )}
    </div>
  );
}
