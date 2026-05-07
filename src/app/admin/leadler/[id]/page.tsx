import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, Building2, Tag, Wallet, Globe, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

import { LeadActions } from "./lead-actions";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("ad_soyad")
    .eq("id", id)
    .single();
  return { title: data?.ad_soyad ?? "Lead" };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function LeadDetayPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: lead, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !lead) notFound();

  const fields = [
    { icon: Mail, label: "E-posta", value: lead.eposta, href: `mailto:${lead.eposta}` },
    {
      icon: Phone,
      label: "Telefon",
      value: lead.telefon,
      href: lead.telefon ? `tel:${lead.telefon.replace(/\s/g, "")}` : null,
    },
    { icon: Building2, label: "Şirket", value: lead.sirket },
    {
      icon: Tag,
      label: "İlgilendiği hizmetler",
      value: lead.hizmet_kategori?.join(", "),
    },
    { icon: Wallet, label: "Bütçe", value: lead.butce },
    { icon: Globe, label: "Geldiği sayfa", value: lead.kaynak },
    { icon: Calendar, label: "Tarih", value: formatDate(lead.created_at) },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Button asChild variant="ghost" size="sm">
        <Link href="/admin/leadler">
          <ArrowLeft className="mr-1 size-4" />
          Lead&apos;ler
        </Link>
      </Button>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Sol — info + brief */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{lead.ad_soyad}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields
                .filter((f) => f.value)
                .map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.label} className="flex items-start gap-3 text-sm">
                      <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-muted-foreground text-xs tracking-wider uppercase">
                          {f.label}
                        </div>
                        {f.href ? (
                          <a
                            href={f.href}
                            className="hover:text-brand block break-words"
                          >
                            {f.value}
                          </a>
                        ) : (
                          <div className="break-words">{f.value}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </CardContent>
          </Card>

          {lead.brief ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Brief</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{lead.brief}</p>
              </CardContent>
            </Card>
          ) : null}

          {lead.ai_ozet ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">AI özeti</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">
                  {lead.ai_ozet}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Sağ — durum + notlar + sil */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Yönetim</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadActions
                id={lead.id}
                ad_soyad={lead.ad_soyad}
                durum={lead.durum}
                notlar={lead.notlar}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
