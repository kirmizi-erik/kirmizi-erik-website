"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { MessageCircle, Send, X, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ChatMessage } from "@/lib/validations/chat";
import { cn } from "@/lib/utils";

import { chatAction, submitChatLead } from "./actions";

const STORAGE_KEY = "kirmizi-erik-chat-v1";

const KARSILAMA_MESAJI = `Merhaba, Kırmızı Erik asistanıyım. Reklam, video, sosyal medya, web/uygulama, AI kurulumları — ne tür bir ihtiyacın var?`;

type ContactPrefs = {
  showForm: boolean;
};

export function Chatbot() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: KARSILAMA_MESAJI },
  ]);
  const [isPending, startTransition] = useTransition();
  const [contactPrefs, setContactPrefs] = useState<ContactPrefs>({ showForm: false });
  const [submittedLead, setSubmittedLead] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Dışarıdan chatbot'u açma — `kirmizierik:open-chat` custom event'iyle (örn. AI Kurulumları "Canlı AI demo dene" butonu)
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("kirmizierik:open-chat", handler);
    return () => window.removeEventListener("kirmizierik:open-chat", handler);
  }, []);

  // İlk yüklemede localStorage'dan mesajları geri yükle (hydration sonrası)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // ignore — default karşılama mesajı kalsın
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Mesajlar değişince localStorage'a kaydet
  useEffect(() => {
    if (typeof window === "undefined" || messages.length === 0) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    } catch {
      // ignore
    }
  }, [messages]);

  // Otomatik scroll
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, contactPrefs.showForm, isPending]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || isPending) return;

    const newUserMessage: ChatMessage = { role: "user", content: text };
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setInput("");

    // AI cevabı için sadece son 20 mesajı gönder (token tasarrufu)
    const contextMessages = newMessages.slice(-20);

    startTransition(async () => {
      const result = await chatAction(contextMessages);
      if (result.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: result.reply }]);
        if (result.suggestContact) {
          setContactPrefs({ showForm: true });
        }
      } else {
        toast.error(result.error);
      }
    });
  };

  const resetConversation = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    setMessages([{ role: "assistant", content: KARSILAMA_MESAJI }]);
    setContactPrefs({ showForm: false });
    setSubmittedLead(false);
    setInput("");
  };

  // SSR sırasında veya mount öncesi hiç render etme (portal target body henüz yok)
  if (!mounted) return null;

  // createPortal ile body'ye direkt mount — Safari'deki containing-block bug'ı bypass eder
  // (parent'ta backdrop-filter / transform / will-change varsa fixed bozulur)
  return createPortal(
    <>
      {/* Floating buton */}
      <button
        type="button"
        aria-label={open ? "Sohbeti kapat" : "Sohbeti aç"}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed right-4 bottom-4 z-50 inline-flex size-14 items-center justify-center rounded-full shadow-lg shadow-black/40 transition-all sm:right-6 sm:bottom-6",
          open
            ? "bg-foreground text-background scale-95"
            : "bg-brand text-brand-foreground hover:scale-105",
        )}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>

      {/* Panel */}
      {open ? (
        <div
          role="dialog"
          aria-label="Kırmızı Erik sohbet asistanı"
          className="fixed inset-x-2 bottom-22 z-40 sm:inset-x-auto sm:right-6 sm:bottom-24 sm:w-[420px]"
        >
          <div className="border-border bg-card text-card-foreground flex h-[min(620px,calc(100svh-7rem))] flex-col overflow-hidden rounded-2xl border shadow-2xl shadow-black/40">
            {/* Header */}
            <div className="border-border/60 from-brand/[0.08] flex items-center justify-between border-b bg-gradient-to-br to-transparent p-4">
              <div className="flex items-center gap-3">
                <div className="bg-brand text-brand-foreground inline-flex size-9 items-center justify-center rounded-full">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold tracking-tight">
                    Kırmızı Erik Asistanı
                  </div>
                  <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                    <span className="bg-brand-yaprak size-1.5 rounded-full" />
                    Genelde 1-2 dk içinde döner
                  </div>
                </div>
              </div>
              {messages.length > 1 ? (
                <button
                  type="button"
                  onClick={resetConversation}
                  className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline"
                >
                  Yeniden başlat
                </button>
              ) : null}
            </div>

            {/* Mesajlar */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4"
              style={{ scrollBehavior: "smooth" }}
            >
              <div className="space-y-3">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex",
                      m.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                        m.role === "user"
                          ? "bg-brand text-brand-foreground"
                          : "bg-muted text-foreground",
                      )}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {isPending ? (
                  <div className="flex justify-start">
                    <div className="bg-muted text-muted-foreground inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm">
                      <Loader2 className="size-3.5 animate-spin" />
                      Yazıyor…
                    </div>
                  </div>
                ) : null}

                {/* Lead form trigger */}
                {contactPrefs.showForm && !submittedLead ? (
                  <ContactFormCard
                    messages={messages}
                    onSubmitted={() => {
                      setSubmittedLead(true);
                      setContactPrefs({ showForm: false });
                      setMessages((prev) => [
                        ...prev,
                        {
                          role: "assistant",
                          content:
                            "Bilgilerin alındı, ekibimiz en kısa sürede sana dönecek. Bu arada başka bir konu varsa sormaya devam edebilirsin.",
                        },
                      ]);
                    }}
                    onCancel={() => setContactPrefs({ showForm: false })}
                  />
                ) : null}
              </div>
            </div>

            {/* Input */}
            <div className="border-border/60 border-t p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isPending}
                  placeholder="Mesajını yaz…"
                  className="flex-1"
                  autoComplete="off"
                  maxLength={2000}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isPending || !input.trim()}
                  aria-label="Gönder"
                >
                  <Send className="size-4" />
                </Button>
              </form>
              <p className="text-muted-foreground/60 mt-2 text-center text-[10px]">
                AI cevapları rehber niteliğindedir. Kesin teklif için{" "}
                <button
                  type="button"
                  onClick={() => setContactPrefs({ showForm: true })}
                  className="hover:text-foreground underline underline-offset-2"
                >
                  iletişime geç
                </button>
                .
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>,
    document.body,
  );
}

// ──────────────────────────────────────────────────────────────────
// İletişim formu kartı — chatbot içinde inline gösterilir
// ──────────────────────────────────────────────────────────────────

function ContactFormCard({
  messages,
  onSubmitted,
  onCancel,
}: {
  messages: ChatMessage[];
  onSubmitted: () => void;
  onCancel: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [adSoyad, setAdSoyad] = useState("");
  const [eposta, setEposta] = useState("");
  const [telefon, setTelefon] = useState("");
  const [tercih, setTercih] = useState<"telefon" | "eposta" | "ikisi">("ikisi");

  return (
    <div className="border-brand/30 from-brand/[0.05] mt-4 rounded-2xl border bg-gradient-to-br to-transparent p-4">
      <div className="text-brand inline-flex items-center gap-2 text-xs tracking-widest uppercase">
        <Sparkles className="size-3.5" />
        İletişim bilgilerin
      </div>
      <p className="text-foreground/90 mt-2 text-sm">
        Birkaç kısa bilgi al, ekibimiz en kısa sürede dönsün. Bu konuşma da
        ekibimize iletilecek.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!adSoyad.trim() || !eposta.trim() || !telefon.trim()) return;

          const fd = new FormData();
          fd.set("ad_soyad", adSoyad.trim());
          fd.set("eposta", eposta.trim());
          fd.set("telefon", telefon.trim());
          fd.set("iletisim_tercihi", tercih);
          fd.set("conversation", JSON.stringify(messages));

          startTransition(async () => {
            const r = await submitChatLead(fd);
            if (r.ok) {
              toast.success("Teşekkürler, dönüş yapacağız.");
              onSubmitted();
            } else {
              toast.error(r.error);
            }
          });
        }}
        className="mt-4 space-y-3"
      >
        <div className="space-y-1.5">
          <Label htmlFor="chat-ad" className="text-xs">
            Ad Soyad
          </Label>
          <Input
            id="chat-ad"
            value={adSoyad}
            onChange={(e) => setAdSoyad(e.target.value)}
            placeholder="Ali Yılmaz"
            required
            minLength={3}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="chat-eposta" className="text-xs">
            E-posta
          </Label>
          <Input
            id="chat-eposta"
            type="email"
            value={eposta}
            onChange={(e) => setEposta(e.target.value)}
            placeholder="ali@firma.com"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="chat-telefon" className="text-xs">
            Telefon
          </Label>
          <Input
            id="chat-telefon"
            type="tel"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            placeholder="+90 555 ..."
            pattern="[\d\s\+\(\)\-]{7,}"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Sana nasıl ulaşalım?</Label>
          <div className="flex gap-2">
            {(["telefon", "eposta", "ikisi"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTercih(t)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  tercih === t
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {t === "telefon"
                  ? "Telefon"
                  : t === "eposta"
                    ? "E-posta"
                    : "İkisi de OK"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button type="submit" size="sm" disabled={isPending} className="flex-1">
            {isPending ? "Gönderiliyor…" : "Gönder"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onCancel}
            disabled={isPending}
          >
            Vazgeç
          </Button>
        </div>

        <p className="text-muted-foreground/70 text-[10px] leading-relaxed">
          Verilerin{" "}
          <a
            href="/kvkk"
            target="_blank"
            className="hover:text-foreground underline underline-offset-2"
          >
            KVKK aydınlatma metni
          </a>{" "}
          kapsamında işlenir.
        </p>
      </form>
    </div>
  );
}
