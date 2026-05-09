import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { CaseStudyDurum } from "@/lib/validations/case-study";

import { CaseForm } from "../../case-form";
import { DeleteCaseButton } from "./delete-button";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("case_studies")
    .select("baslik")
    .eq("id", id)
    .single();
  return { title: data?.baslik ?? "Çalışma" };
}

export default async function CaseDuzenlePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: cs, error } = await supabase
    .from("case_studies")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !cs) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/calismalar">
            <ArrowLeft className="mr-1 size-4" />
            Çalışmalar
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {cs.durum === "yayinda" ? (
            <Button asChild variant="ghost" size="sm">
              <Link href={`/calismalar/${cs.slug}`} target="_blank">
                <ExternalLink className="mr-1 size-3.5" />
                Görüntüle
              </Link>
            </Button>
          ) : null}
          <DeleteCaseButton id={cs.id} baslik={cs.baslik} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{cs.baslik}</CardTitle>
        </CardHeader>
        <CardContent>
          <CaseForm
            mode="edit"
            initial={{
              id: cs.id,
              baslik: cs.baslik,
              slug: cs.slug,
              ozet: cs.ozet,
              musteri_adi: cs.musteri_adi,
              sektor: cs.sektor,
              kategori: cs.kategori ?? [],
              kapak_url: cs.kapak_url,
              kapak_video_url: cs.kapak_video_url,
              aciklama: cs.aciklama,
              galeri_urls: cs.galeri_urls ?? [],
              durum: cs.durum as CaseStudyDurum,
              one_cikan: cs.one_cikan,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
