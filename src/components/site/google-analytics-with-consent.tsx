"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const STORAGE_KEY = "kirmizierik:cookie-consent";

// Tek gtag.js: GA4 + (varsa) Google Ads aynı etiketten beslenir.
export function GoogleAnalyticsWithConsent({ gaId, adsId }: { gaId: string; adsId?: string }) {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const check = () => {
      setAccepted(window.localStorage.getItem(STORAGE_KEY) === "accepted");
    };
    check();
    const handler = () => check();
    window.addEventListener("kirmizierik:consent-changed", handler);
    return () => window.removeEventListener("kirmizierik:consent-changed", handler);
  }, []);

  if (!accepted) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${gaId}');
          ${adsId ? `gtag('config', '${adsId}', { allow_enhanced_conversions: true });` : ""}
        `}
      </Script>
    </>
  );
}
