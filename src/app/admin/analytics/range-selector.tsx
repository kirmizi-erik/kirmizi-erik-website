"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const PRESETS = [
  { label: "7g", value: 7 },
  { label: "28g", value: 28 },
  { label: "90g", value: 90 },
];

export function RangeSelector({ current }: { current: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setDays = (days: number) => {
    const sp = new URLSearchParams(params.toString());
    sp.set("days", String(days));
    router.push(`${pathname}?${sp.toString()}`);
  };

  return (
    <div className="border-border inline-flex rounded-md border p-0.5">
      {PRESETS.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => setDays(p.value)}
          className={cn(
            "rounded-sm px-3 py-1 text-xs font-medium transition-colors",
            current === p.value
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
