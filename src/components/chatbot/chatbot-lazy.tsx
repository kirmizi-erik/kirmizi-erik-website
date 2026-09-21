"use client";

import dynamic from "next/dynamic";

/**
 * Chatbot tamamen etkileşimsel — SSR HTML'ine ve RSC payload'una girmesine
 * gerek yok. ssr:false ile ilk HTML küçülür (bot tarama bütçesi içeriğe kalır),
 * chunk hydration sonrası ayrı yüklenir.
 */
const Chatbot = dynamic(() => import("./chatbot").then((m) => m.Chatbot), {
  ssr: false,
});

export function ChatbotLazy() {
  return <Chatbot />;
}
