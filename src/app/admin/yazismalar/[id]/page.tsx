import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookPlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { chatbotDb } from "@/lib/chatbot/db";
import { cn } from "@/lib/utils";

export const metadata = { title: "Yazışma" };
export const dynamic = "force-dynamic";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  latency_ms: number | null;
  unanswered: boolean;
  created_at: string;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function YazismaDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = chatbotDb();

  const [convRes, msgRes] = await Promise.all([
    db.from("chat_conversations").select("*").eq("id", id).single(),
    db
      .from("chat_messages")
      .select("id, role, content, latency_ms, unanswered, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (convRes.error || !convRes.data) notFound();
  const conv = convRes.data as {
    locale: string;
    page_url: string | null;
    message_count: number;
    started_at: string;
  };
  const messages = (msgRes.data ?? []) as Message[];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/yazismalar">
            <ArrowLeft className="size-4" /> Yazışmalar
          </Link>
        </Button>
        <p className="text-muted-foreground text-sm">
          {formatTime(conv.started_at)} · {conv.message_count} mesaj
          {conv.page_url ? ` · ${conv.page_url}` : ""}
        </p>
      </div>

      <div className="space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-xl px-4 py-3 text-sm",
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
              )}
            >
              <p className="whitespace-pre-wrap">{m.content}</p>
              <div
                className={cn(
                  "mt-2 flex items-center gap-2 text-[11px]",
                  m.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground",
                )}
              >
                <span>{formatTime(m.created_at)}</span>
                {m.role === "assistant" && m.latency_ms != null && (
                  <span>{(m.latency_ms / 1000).toFixed(1)}s</span>
                )}
                {m.unanswered && <Badge variant="destructive">Cevapsız</Badge>}
                {m.role === "user" && (
                  <Link
                    href={`/admin/bilgi-bankasi?soru=${encodeURIComponent(m.content.slice(0, 500))}`}
                    className="inline-flex items-center gap-1 underline-offset-2 hover:underline"
                    title="Bu soruyu bilgi bankasına ekle"
                  >
                    <BookPlus className="size-3" /> Bilgi bankasına ekle
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <Card>
            <CardContent className="text-muted-foreground py-8 text-center text-sm">
              Bu konuşmada mesaj yok.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
