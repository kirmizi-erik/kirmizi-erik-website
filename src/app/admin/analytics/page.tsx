import { AlertCircle, Globe, MousePointerClick, Smartphone, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchDeviceBreakdown,
  fetchGeoBreakdown,
  fetchSummary,
  fetchTopPages,
  fetchTrafficSources,
} from "@/lib/google/analytics";
import {
  formatDuration,
  formatNumber,
  formatPercent,
  parseDays,
  rangeFromDays,
} from "@/lib/google/range";

import { RangeSelector } from "./range-selector";

export const metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

type Loaded = {
  ok: true;
  data: {
    summary: Awaited<ReturnType<typeof fetchSummary>>;
    topPages: Awaited<ReturnType<typeof fetchTopPages>>;
    sources: Awaited<ReturnType<typeof fetchTrafficSources>>;
    devices: Awaited<ReturnType<typeof fetchDeviceBreakdown>>;
    geo: Awaited<ReturnType<typeof fetchGeoBreakdown>>;
  };
};
type Failed = { ok: false; error: string };

async function loadAll(days: number): Promise<Loaded | Failed> {
  try {
    const range = rangeFromDays(days);
    const [summary, topPages, sources, devices, geo] = await Promise.all([
      fetchSummary(range),
      fetchTopPages(range, 10),
      fetchTrafficSources(range, 10),
      fetchDeviceBreakdown(range),
      fetchGeoBreakdown(range, 10),
    ]);
    return { ok: true, data: { summary, topPages, sources, devices, geo } };
  } catch (e) {
    console.error("[admin/analytics]", e);
    const err = e as Record<string, unknown>;
    const safe = (v: unknown) => {
      try {
        return typeof v === "string" ? v : JSON.stringify(v);
      } catch {
        return String(v);
      }
    };
    const parts = [
      err?.message ? `message=${safe(err.message)}` : null,
      err?.code ? `code=${safe(err.code)}` : null,
      err?.status ? `status=${safe(err.status)}` : null,
      err?.statusText ? `statusText=${safe(err.statusText)}` : null,
      err?.details ? `details=${safe(err.details)}` : null,
      err?.errors ? `errors=${safe(err.errors)}` : null,
    ].filter(Boolean);
    return {
      ok: false,
      error: parts.length
        ? parts.join(" · ")
        : `raw=${safe(e)} keys=${Object.keys(err ?? {}).join(",")}`,
    };
  }
}

export default async function AnalyticsPage({
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
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Google Analytics 4 — son {days} gün
          </p>
        </div>
        <RangeSelector current={days} />
      </div>

      {!result.ok ? (
        <ErrorPanel error={result.error} />
      ) : (
        <>
          <SummaryCards data={result.data.summary} />

          <div className="grid gap-4 lg:grid-cols-2">
            <TopPagesCard pages={result.data.topPages} />
            <TrafficSourcesCard sources={result.data.sources} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <DeviceCard devices={result.data.devices} />
            <GeoCard geo={result.data.geo} />
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCards({ data }: { data: Loaded["data"]["summary"] }) {
  const cards = [
    {
      label: "Kullanıcı",
      value: formatNumber(data.totalUsers),
      hint: `${formatNumber(data.newUsers)} yeni kullanıcı`,
      icon: Users,
    },
    {
      label: "Oturum",
      value: formatNumber(data.sessions),
      hint: `Ortalama ${formatDuration(data.avgSessionDuration)} süre`,
      icon: MousePointerClick,
    },
    {
      label: "Sayfa görüntüleme",
      value: formatNumber(data.pageViews),
      hint: `Ortalama ${(data.pageViews / Math.max(data.sessions, 1)).toFixed(1)} sayfa/oturum`,
      icon: Globe,
    },
    {
      label: "Hemen çıkma",
      value: formatPercent(data.bounceRate),
      hint: data.bounceRate > 0.6 ? "Yüksek" : "Normal aralık",
      icon: Smartphone,
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
              <p className="text-muted-foreground mt-1 text-xs">{c.hint}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function TopPagesCard({ pages }: { pages: Loaded["data"]["topPages"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">En çok ziyaret edilen sayfalar</CardTitle>
      </CardHeader>
      <CardContent>
        {pages.length === 0 ? (
          <p className="text-muted-foreground text-sm">Veri yok.</p>
        ) : (
          <ul className="divide-border/40 -mx-2 divide-y">
            {pages.map((p) => (
              <li key={p.path} className="px-2 py-2.5">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{p.title || p.path}</div>
                    <div className="text-muted-foreground truncate text-xs">{p.path}</div>
                  </div>
                  <div className="text-right text-xs whitespace-nowrap">
                    <div className="font-medium">{formatNumber(p.views)}</div>
                    <div className="text-muted-foreground">{formatNumber(p.users)} kişi</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function TrafficSourcesCard({ sources }: { sources: Loaded["data"]["sources"] }) {
  const total = sources.reduce((sum, s) => sum + s.users, 0) || 1;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Trafik kaynakları</CardTitle>
      </CardHeader>
      <CardContent>
        {sources.length === 0 ? (
          <p className="text-muted-foreground text-sm">Veri yok.</p>
        ) : (
          <ul className="space-y-2.5">
            {sources.map((s) => (
              <li key={s.source}>
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium">{s.source}</span>
                  <span className="text-muted-foreground text-xs">
                    {formatNumber(s.users)} ({formatPercent(s.users / total)})
                  </span>
                </div>
                <div className="bg-border/40 h-1.5 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-foreground h-full"
                    style={{ width: `${(s.users / total) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function DeviceCard({ devices }: { devices: Loaded["data"]["devices"] }) {
  const total = devices.reduce((sum, d) => sum + d.users, 0) || 1;
  const labelMap: Record<string, string> = {
    desktop: "Masaüstü",
    mobile: "Mobil",
    tablet: "Tablet",
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cihaz dağılımı</CardTitle>
      </CardHeader>
      <CardContent>
        {devices.length === 0 ? (
          <p className="text-muted-foreground text-sm">Veri yok.</p>
        ) : (
          <ul className="space-y-2.5">
            {devices.map((d) => (
              <li key={d.device}>
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium">
                    {labelMap[d.device] ?? d.device}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {formatNumber(d.users)} ({formatPercent(d.users / total)})
                  </span>
                </div>
                <div className="bg-border/40 h-1.5 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-foreground h-full"
                    style={{ width: `${(d.users / total) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function GeoCard({ geo }: { geo: Loaded["data"]["geo"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">En çok ziyaret edilen şehirler</CardTitle>
      </CardHeader>
      <CardContent>
        {geo.length === 0 ? (
          <p className="text-muted-foreground text-sm">Veri yok.</p>
        ) : (
          <ul className="divide-border/40 -mx-2 divide-y">
            {geo.map((g, i) => (
              <li key={`${g.country}-${g.city}-${i}`} className="px-2 py-2">
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">
                      {g.city || "(şehir yok)"}
                    </div>
                    <div className="text-muted-foreground text-xs">{g.country}</div>
                  </div>
                  <div className="text-sm font-medium">{formatNumber(g.users)}</div>
                </div>
              </li>
            ))}
          </ul>
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
          Google Analytics API çağrısı başarısız oldu. Genelde sebep:
        </p>
        <ul className="text-muted-foreground mt-3 list-disc space-y-1 pl-5 text-sm">
          <li>
            <code>GOOGLE_OAUTH_CLIENT_ID</code>,{" "}
            <code>GOOGLE_OAUTH_CLIENT_SECRET</code>,{" "}
            <code>GOOGLE_OAUTH_REFRESH_TOKEN</code> env eksik
          </li>
          <li>
            <code>GA4_PROPERTY_ID</code> env değişkeni eksik / yanlış
          </li>
          <li>Google Analytics Data API enable edilmemiş</li>
        </ul>
        <pre className="bg-muted text-muted-foreground mt-4 overflow-x-auto rounded-md p-3 text-xs">
          {error}
        </pre>
      </CardContent>
    </Card>
  );
}
