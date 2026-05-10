"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { useEffect, useState } from "react";

const STORAGE_KEY = "kirmizierik:cookie-consent";

export function GoogleAnalyticsWithConsent({ gaId }: { gaId: string }) {
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
  return <GoogleAnalytics gaId={gaId} />;
}
