"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "kirmizierik:cookie-consent";

type Consent = "accepted" | "rejected";

function readConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "accepted" || v === "rejected" ? v : null;
}

function writeConsent(value: Consent) {
  window.localStorage.setItem(STORAGE_KEY, value);
  window.dispatchEvent(
    new CustomEvent("kirmizierik:consent-changed", { detail: value }),
  );
}

export function CookieConsent() {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setConsent(readConsent());
  }, []);

  if (!mounted || consent !== null) return null;

  const choose = (value: Consent) => {
    writeConsent(value);
    setConsent(value);
  };

  return (
    <div
      role="dialog"
      aria-label="Çerez tercihleri"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:bottom-4 sm:right-4 sm:left-auto sm:max-w-sm sm:px-0 sm:pr-4"
    >
      <div className="border-border/60 bg-background/95 supports-[backdrop-filter]:bg-background/85 rounded-2xl border p-5 shadow-2xl backdrop-blur-md">
        <h2 className="text-sm font-semibold tracking-tight">
          Çerez tercihleri
        </h2>
        <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
          Site deneyimini iyileştirmek ve trafiği anlamak için Google Analytics
          kullanıyoruz. Onay verirsen anonim olarak kullanım verisi toplanır.
          Detay için{" "}
          <Link
            href="/kvkk"
            target="_blank"
            className="hover:text-foreground underline underline-offset-2"
          >
            KVKK metni
          </Link>
          .
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => choose("rejected")}
            className="border-border/60 hover:bg-muted text-foreground/80 hover:text-foreground rounded-md border px-3 py-1.5 text-xs transition-colors"
          >
            Reddet
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="bg-foreground text-background hover:bg-foreground/90 ml-auto rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
          >
            Kabul et
          </button>
        </div>
      </div>
    </div>
  );
}
