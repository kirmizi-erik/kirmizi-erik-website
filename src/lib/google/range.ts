export type DateRange = { startDate: string; endDate: string; days: number };

export function rangeFromDays(days: number): DateRange {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  return {
    startDate: toISODate(start),
    endDate: toISODate(end),
    days,
  };
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDays(value: string | undefined, fallback = 28): number {
  if (!value) return fallback;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1 || n > 365) return fallback;
  return Math.floor(n);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("tr-TR").format(Math.round(n));
}

export function formatPercent(n: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(n);
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 1) return "0sn";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m === 0) return `${s}sn`;
  return `${m}d ${s}sn`;
}

export function formatPosition(p: number): string {
  return p ? p.toFixed(1) : "-";
}
