import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { chatbotDb } from "@/lib/chatbot/db";

export const metadata = { title: "Yazışmalar" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string; cevapsiz?: string }>;

type ConversationRow = {
  id: string;
  session_id: string;
  locale: string;
  page_url: string | null;
  message_count: number;
  started_at: string;
  last_message_at: string;
  first_question: string | null;
  unanswered_count: number;
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

export default async function YazismalarPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = params.q?.trim() || null;
  const onlyUnanswered = params.cevapsiz === "1";

  const db = chatbotDb();
  const { data, error } = await db.rpc("chat_admin_conversations", {
    p_q: q,
    p_only_unanswered: onlyUnanswered,
    p_limit: 200,
  });
  const conversations = (data ?? []) as ConversationRow[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Yazışmalar</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            AI asistan sohbetleri · {conversations.length} konuşma
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/bilgi-bankasi">Bilgi Bankası</Link>
        </Button>
      </div>

      <form method="get" className="flex flex-wrap items-center gap-3">
        <Input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Mesajlarda ara…"
          className="max-w-xs"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="cevapsiz"
            value="1"
            defaultChecked={onlyUnanswered}
            className="accent-primary size-4"
          />
          Sadece cevapsız
        </label>
        <Button type="submit" variant="secondary" size="sm">
          Filtrele
        </Button>
        {(q || onlyUnanswered) && (
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/yazismalar">Temizle</Link>
          </Button>
        )}
      </form>

      {error ? (
        <Card>
          <CardContent className="text-destructive py-6 text-sm">
            Yazışmalar yüklenemedi: {error.message}. Veritabanı migration&apos;ının uygulandığından
            emin ol.
          </CardContent>
        </Card>
      ) : conversations.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center text-sm">
            {q || onlyUnanswered ? "Filtreye uyan konuşma yok." : "Henüz yazışma yok."}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>İlk soru</TableHead>
                  <TableHead className="w-24">Mesaj</TableHead>
                  <TableHead className="w-28">Cevapsız</TableHead>
                  <TableHead className="w-40">Son mesaj</TableHead>
                  <TableHead className="w-32">Sayfa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversations.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="max-w-md">
                      <Link
                        href={`/admin/yazismalar/${c.id}`}
                        className="block truncate font-medium hover:underline"
                      >
                        {c.first_question ?? "—"}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.message_count}</TableCell>
                    <TableCell>
                      {c.unanswered_count > 0 ? (
                        <Badge variant="destructive">{c.unanswered_count} cevapsız</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(c.last_message_at)}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-32 truncate text-xs">
                      {c.page_url ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
