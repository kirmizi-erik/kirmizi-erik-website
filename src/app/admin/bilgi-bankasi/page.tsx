import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

type SearchParams = Promise<{ soru?: string; kod?: string }>;

// "S-123" kodundan ziyaretçi sorusunu + botun verdiği cevabı getirir (Novawood deseni)
async function lookupByCode(kod: string) {
  const id = Number(kod.replace(/^s-?/i, "").trim());
  if (!Number.isInteger(id) || id <= 0) return null;

  const db = chatbotDb();
  const { data: question } = await db
    .from("chat_messages")
    .select("id, conversation_id, content, created_at")
    .eq("id", id)
    .eq("role", "user")
    .single();
  if (!question) return null;

  const { data: answer } = await db
    .from("chat_messages")
    .select("content")
    .eq("conversation_id", question.conversation_id)
    .eq("role", "assistant")
    .gt("id", question.id)
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  return {
    question: question.content as string,
    answer: (answer?.content as string | undefined) ?? "",
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function BilgiBankasiPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const kod = params.kod?.trim();
  const fromCode = kod ? await lookupByCode(kod) : null;
  const prefillQuestion = fromCode?.question ?? params.soru?.slice(0, 500);
  const prefillAnswer = fromCode?.answer;

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
          <form method="get" className="flex items-center gap-2 pt-1">
            <Input
              name="kod"
              defaultValue={kod ?? ""}
              placeholder="Soru kodu (örn. S-12)"
              className="h-8 max-w-40 font-mono text-sm"
            />
            <Button type="submit" variant="secondary" size="sm">
              Getir
            </Button>
            {kod && !fromCode && <span className="text-destructive text-xs">Kod bulunamadı</span>}
            {fromCode && (
              <span className="text-muted-foreground text-xs">
                {kod} yüklendi — cevabı düzeltip kaydet
              </span>
            )}
          </form>
        </CardHeader>
        <CardContent>
          <KnowledgeCreateForm
            key={kod ?? params.soru ?? "blank"}
            prefillQuestion={prefillQuestion}
            prefillAnswer={prefillAnswer}
          />
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
