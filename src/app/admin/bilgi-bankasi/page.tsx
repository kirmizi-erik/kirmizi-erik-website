import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { chatbotDb } from "@/lib/chatbot/db";

import {
  KnowledgeCreateForm,
  KnowledgeDeleteButton,
  KnowledgeEditForm,
  ReingestButton,
  type KnowledgeEntry,
} from "./knowledge-ui";

export const metadata = { title: "Bilgi Bankası" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ soru?: string }>;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function BilgiBankasiPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const prefillQuestion = params.soru?.slice(0, 500);

  const db = chatbotDb();
  const [entriesRes, chunkRes] = await Promise.all([
    db.from("admin_knowledge").select("*").order("created_at", { ascending: false }),
    db.from("kb_chunks").select("id", { count: "exact", head: true }),
  ]);
  const entries = (entriesRes.data ?? []) as KnowledgeEntry[];
  const chunkCount = chunkRes.count ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bilgi Bankası</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            AI asistanı eğit: Soru/Cevap ekle, anında devreye girer · {entries.length} eğitim kaydı
            · toplam {chunkCount} bilgi parçası
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/yazismalar">Yazışmalar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Yeni Soru/Cevap</CardTitle>
        </CardHeader>
        <CardContent>
          <KnowledgeCreateForm prefillQuestion={prefillQuestion} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{entry.question_tr}</p>
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                    {entry.answer_tr}
                  </p>
                  <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-2 text-xs">
                    {entry.question_en && <Badge variant="outline">EN</Badge>}
                    {entry.source_url && <span>{entry.source_url}</span>}
                    <span>Güncelleme: {formatDate(entry.updated_at)}</span>
                  </div>
                </div>
                <KnowledgeDeleteButton entry={entry} />
              </div>
              <details className="mt-3">
                <summary className="text-muted-foreground cursor-pointer text-sm hover:underline">
                  Düzenle
                </summary>
                <KnowledgeEditForm entry={entry} />
              </details>
            </CardContent>
          </Card>
        ))}
        {entries.length === 0 && (
          <Card>
            <CardContent className="text-muted-foreground py-10 text-center text-sm">
              Henüz eğitim kaydı yok. Cevapsız kalan soruları Yazışmalar&apos;dan tek tıkla buraya
              taşıyabilirsin.
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Site içeriği</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm">
            Hizmet sayfaları veya firma bilgileri koddan güncellendiğinde asistanın bilgi bankasını
            tazelemek için kullan. Buradaki Soru/Cevap kayıtlarına dokunmaz.
          </p>
          <ReingestButton />
        </CardContent>
      </Card>
    </div>
  );
}
