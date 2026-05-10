"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const STORAGE_KEY = "kirmizierik:cookie-consent";

export function ClarityWithConsent({ projectId }: { projectId: string }) {
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
    <Script id="ms-clarity" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${projectId}");
      `}
    </Script>
  );
}
