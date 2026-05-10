import { AlertCircle, Eye, MousePointerClick, Search, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchSearchSummary,
  fetchTopPagesSearch,
  fetchTopQueries,
} from "@/lib/google/search-console";
import {
  formatNumber,
  formatPercent,
  formatPosition,
  parseDays,
  rangeFromDays,
} from "@/lib/google/range";

import { RangeSelector } from "../analytics/range-selector";

export const metadata = { title: "SEO" };
export const dynamic = "force-dynamic";

type Loaded = {
  ok: true;
  data: {
    summary: Awaited<ReturnType<typeof fetchSearchSummary>>;
    queries: Awaited<ReturnType<typeof fetchTopQueries>>;
    pages: Awaited<ReturnType<typeof fetchTopPagesSearch>>;
  };
};
type Failed = { ok: false; error: string };

async function loadAll(days: number): Promise<Loaded | Failed> {
  try {
    const range = rangeFromDays(days);
    const [summary, queries, pages] = await Promise.all([
      fetchSearchSummary(range),
      fetchTopQueries(range, 25),
      fetchTopPagesSearch(range, 25),
    ]);
    return { ok: true, data: { summary, queries, pages } };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export default async function SEOPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const { days: daysParam } = await searchParams;
  const days = parseDays(daysParam, 28);
  const result = await loadAll(days);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">SEO</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Google Search Console — son {days} gün
          </p>
        </div>
        <RangeSelector current={days} />
      </div>

      {!result.ok ? (
        <ErrorPanel error={result.error} />
      ) : (
        <>
          <SummaryCards data={result.data.summary} />

          <TopQueriesCard queries={result.data.queries} />

          <TopPagesCard pages={result.data.pages} />
        </>
      )}
    </div>
  );
}

function SummaryCards({ data }: { data: Loaded["data"]["summary"] }) {
  const cards = [
    {
      label: "Tıklama",
      value: formatNumber(data.clicks),
      icon: MousePointerClick,
    },
    {
      label: "Gösterim",
      value: formatNumber(data.impressions),
      icon: Eye,
    },
    {
      label: "CTR",
      value: formatPercent(data.ctr),
      icon: TrendingUp,
    },
    {
      label: "Ort. pozisyon",
      value: formatPosition(data.position),
      icon: Search,
    },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card key={c.label}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  {c.label}
                </CardTitle>
                <Icon className="text-muted-foreground size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{c.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function TopQueriesCard({ queries }: { queries: Loaded["data"]["queries"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">En çok tıklanan arama sorguları</CardTitle>
      </CardHeader>
      <CardContent>
        {queries.length === 0 ? (
          <p className="text-muted-foreground text-sm">Veri yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-border/40 border-b text-left text-xs tracking-wider uppercase">
                  <th className="px-2 py-2 font-medium">Sorgu</th>
                  <th className="px-2 py-2 text-right font-medium">Tıklama</th>
                  <th className="px-2 py-2 text-right font-medium">Gösterim</th>
                  <th className="px-2 py-2 text-right font-medium">CTR</th>
                  <th className="px-2 py-2 text-right font-medium">Pozisyon</th>
                </tr>
              </thead>
              <tbody className="divide-border/40 divide-y">
                {queries.map((q, i) => (
                  <tr key={`${q.query}-${i}`}>
                    <td className="px-2 py-2 font-medium">{q.query || "(boş)"}</td>
                    <td className="px-2 py-2 text-right">{formatNumber(q.clicks)}</td>
                    <td className="px-2 py-2 text-right">{formatNumber(q.impressions)}</td>
                    <td className="px-2 py-2 text-right">{formatPercent(q.ctr)}</td>
                    <td className="px-2 py-2 text-right">{formatPosition(q.position)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TopPagesCard({ pages }: { pages: Loaded["data"]["pages"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">En çok tıklanan sayfalar</CardTitle>
      </CardHeader>
      <CardContent>
        {pages.length === 0 ? (
          <p className="text-muted-foreground text-sm">Veri yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-border/40 border-b text-left text-xs tracking-wider uppercase">
                  <th className="px-2 py-2 font-medium">Sayfa</th>
                  <th className="px-2 py-2 text-right font-medium">Tıklama</th>
                  <th className="px-2 py-2 text-right font-medium">Gösterim</th>
                  <th className="px-2 py-2 text-right font-medium">CTR</th>
                  <th className="px-2 py-2 text-right font-medium">Pozisyon</th>
                </tr>
              </thead>
              <tbody className="divide-border/40 divide-y">
                {pages.map((p, i) => (
                  <tr key={`${p.page}-${i}`}>
                    <td className="max-w-md truncate px-2 py-2 font-medium">{p.page}</td>
                    <td className="px-2 py-2 text-right">{formatNumber(p.clicks)}</td>
                    <td className="px-2 py-2 text-right">{formatNumber(p.impressions)}</td>
                    <td className="px-2 py-2 text-right">{formatPercent(p.ctr)}</td>
                    <td className="px-2 py-2 text-right">{formatPosition(p.position)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ErrorPanel({ error }: { error: string }) {
  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="text-destructive size-5" />
          <CardTitle className="text-base">Veri alınamadı</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Google Search Console API çağrısı başarısız oldu. Genelde sebep:
        </p>
        <ul className="text-muted-foreground mt-3 list-disc space-y-1 pl-5 text-sm">
          <li>Service account&apos;a GSC&apos;de Restricted yetki verilmemiş</li>
          <li>
            <code>GOOGLE_SERVICE_ACCOUNT_JSON</code> veya{" "}
            <code>GSC_SITE_URL</code> env değişkeni eksik / yanlış
          </li>
          <li>Google Search Console API enable edilmemiş</li>
        </ul>
        <pre className="bg-muted text-muted-foreground mt-4 overflow-x-auto rounded-md p-3 text-xs">
          {error}
        </pre>
      </CardContent>
    </Card>
  );
}
