type Point = { date: string; users: number; sessions: number };

export function Sparkline({ data, height = 60 }: { data: Point[]; height?: number }) {
  if (!data.length) return null;
  const w = 800;
  const h = height;
  const pad = 4;
  const max = Math.max(...data.map((p) => p.users), 1);
  const step = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0;

  const points = data.map((p, i) => {
    const x = pad + i * step;
    const y = h - pad - ((p.users / max) * (h - pad * 2));
    return [x, y] as const;
  });

  const path = points
    .map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`))
    .join(" ");

  const last = points[points.length - 1];
  const first = points[0];
  if (!first || !last) return null;
  const area = `${path} L${last[0]},${h} L${first[0]},${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="h-16 w-full"
      role="img"
      aria-label={`Son ${data.length} gün kullanıcı trendi`}
    >
      <path d={area} fill="currentColor" opacity="0.1" />
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
