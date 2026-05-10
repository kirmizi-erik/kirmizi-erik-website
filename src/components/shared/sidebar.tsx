"use client";

import { BarChart3, ExternalLink, FolderKanban, LayoutDashboard, Mail, Search, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Genel bakış", icon: LayoutDashboard, exact: true },
  { href: "/admin/calismalar", label: "Çalışmalar", icon: FolderKanban },
  { href: "/admin/leadler", label: "Lead'ler", icon: Mail },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/seo", label: "SEO", icon: Search },
  { href: "/admin/ayarlar", label: "Site ayarları", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border hidden w-64 shrink-0 flex-col border-r md:flex">
      <div className="border-sidebar-border flex h-14 items-center border-b px-5">
        <Link href="/admin" className="flex items-center gap-2.5 font-medium tracking-tight">
          <Image src="/logo/icon-32.png" alt="" width={28} height={28} className="size-7" />
          <span>Kırmızı Erik</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-sidebar-border border-t p-3">
        <Link
          href="/"
          target="_blank"
          className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
        >
          <ExternalLink className="size-4" />
          Siteyi gör
        </Link>
      </div>
    </aside>
  );
}
