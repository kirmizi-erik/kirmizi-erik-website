"use client";

import { useEffect, useState } from "react";
import { Activity, Globe, MapPin } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Realtime = {
  activeUsers: number;
  cities: { city: string; country: string; users: number }[];
  pages: { path: string; users: number }[];
};

const REFRESH_MS = 30_000;

function formatNumber(n: number) {
  return new Intl.NumberFormat("tr-TR").format(n);
}

export function RealtimeCard() {
  const [data, setData] = useState<Realtime | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch("/api/admin/realtime", { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = (await r.json()) as Realtime;
        if (!cancelled) {
          setData(j);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
        }
      }
    };
    load();
    const id = setInterval(load, REFRESH_MS);
    const tickId = setInterval(() => setTick((t) => t + 1), 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
      clearInterval(tickId);
    };
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Şu an aktif</CardTitle>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-muted-foreground tabular-nums">
              canlı · {Math.max(0, REFRESH_MS / 1000 - (tick % (REFRESH_MS / 1000)))}sn
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-destructive text-xs">Realtime alınamadı: {error}</p>
        ) : !data ? (
          <p className="text-muted-foreground text-sm">Yükleniyor…</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <div className="text-muted-foreground flex items-center gap-2 text-xs tracking-wider uppercase">
                <Activity className="size-3" />
                Aktif kullanıcı
              </div>
              <div className="mt-2 text-4xl font-semibold tabular-nums">
                {formatNumber(data.activeUsers)}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">son 30 dakika</p>
            </div>

            <div>
              <div className="text-muted-foreground flex items-center gap-2 text-xs tracking-wider uppercase">
                <MapPin className="size-3" />
                Şehirler
              </div>
              {data.cities.length === 0 ? (
                <p className="text-muted-foreground mt-2 text-sm">Yok.</p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm">
                  {data.cities.slice(0, 4).map((c, i) => (
                    <li
                      key={`${c.city}-${i}`}
                      className="flex items-baseline justify-between gap-2"
                    >
                      <span className="truncate">{c.city}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {c.users}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <div className="text-muted-foreground flex items-center gap-2 text-xs tracking-wider uppercase">
                <Globe className="size-3" />
                Aktif sayfalar
              </div>
              {data.pages.length === 0 ? (
                <p className="text-muted-foreground mt-2 text-sm">Yok.</p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm">
                  {data.pages.slice(0, 4).map((p, i) => (
                    <li
                      key={`${p.path}-${i}`}
                      className="flex items-baseline justify-between gap-2"
                    >
                      <span className="truncate" title={p.path}>
                        {p.path || "/"}
                      </span>
                      <span className="text-muted-foreground tabular-nums">
                        {p.users}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
