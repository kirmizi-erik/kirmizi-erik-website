import Link from "next/link";
import { ArrowUpRight, Eye, FolderKanban, Mail, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Genel bakış",
};

async function loadStats() {
  const supabase = await createClient();
  const [yayinda, taslak, leadYeni, leadToplam] = await Promise.all([
    supabase
      .from("case_studies")
      .select("*", { count: "exact", head: true })
      .eq("durum", "yayinda"),
    supabase
      .from("case_studies")
      .select("*", { count: "exact", head: true })
      .eq("durum", "taslak"),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("durum", "yeni"),
    supabase.from("leads").select("*", { count: "exact", head: true }),
  ]);

  return {
    yayinda: yayinda.count ?? 0,
    taslak: taslak.count ?? 0,
    leadYeni: leadYeni.count ?? 0,
    leadToplam: leadToplam.count ?? 0,
  };
}

async function loadRecentLeads() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("id, ad_soyad, eposta, durum, created_at")
    .order("created_at", { ascending: false })
    .limit(5);
  return data ?? [];
}

export default async function AdminOverviewPage() {
  const [stats, recentLeads] = await Promise.all([loadStats(), loadRecentLeads()]);

  const cards = [
    {
      label: "Yayında çalışma",
      value: stats.yayinda,
      hint: "Site ziyaretçisinin gördüğü",
      href: "/admin/calismalar?durum=yayinda",
      icon: Eye,
    },
    {
      label: "Taslak çalışma",
      value: stats.taslak,
      hint: "Yayına alınmayı bekliyor",
      href: "/admin/calismalar?durum=taslak",
      icon: FolderKanban,
    },
    {
      label: "Yeni lead",
      value: stats.leadYeni,
      hint: "Cevaplanmayı bekleyen",
      href: "/admin/leadler?durum=yeni",
      icon: Sparkles,
    },
    {
      label: "Toplam lead",
      value: stats.leadToplam,
      hint: "Tüm zamanlar",
      href: "/admin/leadler",
      icon: Mail,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Genel bakış</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Site içeriğini ve gelen lead&apos;leri buradan yönet.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href} className="group">
              <Card className="hover:border-foreground/30 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-muted-foreground text-sm font-medium">
                      {card.label}
                    </CardTitle>
                    <Icon className="text-muted-foreground size-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold">{card.value}</div>
                  <p className="text-muted-foreground mt-1 text-xs">{card.hint}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Son lead&apos;ler</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/leadler">
                Hepsi
                <ArrowUpRight className="ml-1 size-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentLeads.length === 0 ? (
              <p className="text-muted-foreground text-sm">Henüz lead yok.</p>
            ) : (
              <ul className="divide-border/40 -mx-2 divide-y">
                {recentLeads.map((l) => (
                  <li key={l.id} className="px-2 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium">{l.ad_soyad}</div>
                        <div className="text-muted-foreground text-xs">{l.eposta}</div>
                      </div>
                      <div className="text-muted-foreground text-xs tracking-wider uppercase">
                        {l.durum}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hızlı işlem</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/admin/calismalar/yeni">
                Yeni çalışma ekle
                <ArrowUpRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/admin/ayarlar">Site ayarlarını düzenle</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
