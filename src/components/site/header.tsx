"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { navItems, siteConfig } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Route değişince mobil menü kapansın (link onClick'inde)
  const closeMenu = () => setOpen(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-colors",
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-10">
        {/* Logo */}
        <Link
          href="/"
          aria-label={siteConfig.name}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <Image
            src="/logo/icon-32.png"
            alt=""
            width={32}
            height={32}
            priority
            className="size-8"
          />
          <span className="text-base font-semibold tracking-tight">
            kırmızı<span className="text-brand-mor">erik</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA + mobil toggle */}
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/iletisim">Brief paylaş</Link>
          </Button>

          <button
            type="button"
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="text-foreground hover:bg-muted/40 inline-flex size-9 items-center justify-center rounded-md md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobil menu drawer */}
      {open ? (
        <div className="border-border/60 border-t bg-background/95 backdrop-blur md:hidden">
          <nav className="mx-auto flex max-w-screen-2xl flex-col gap-1 px-4 py-4 sm:px-6">
            {navItems.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-base transition-colors",
                    active
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/60",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Button asChild className="mt-2 w-full">
              <Link href="/iletisim" onClick={closeMenu}>Brief paylaş</Link>
            </Button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
