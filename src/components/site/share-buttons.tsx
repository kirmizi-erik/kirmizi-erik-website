"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type ShareButtonsProps = {
  title: string;
  description?: string;
  /** /calismalar/<slug> gibi göreceli yol; absolute URL otomatik oluşturulur */
  path: string;
};

// SVG icons (lucide WhatsApp/X yok, inline)
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function ShareButtons({ title, description, path }: ShareButtonsProps) {
  const [absoluteUrl, setAbsoluteUrl] = useState("");
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [copied, setCopied] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (typeof window === "undefined") return;
    setAbsoluteUrl(window.location.href);
    // Web Share API mobil cihazlarda ve bazı desktop browser'larda var
    setCanNativeShare(typeof navigator !== "undefined" && "share" in navigator);
  }, [path]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const shareText = `${title} — Kırmızı Erik`;

  const handleCopy = async () => {
    if (!absoluteUrl) return;
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      toast.success("Bağlantı kopyalandı");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Kopyalanamadı, lütfen URL'yi manuel kopyalayın");
    }
  };

  const handleNativeShare = async () => {
    if (!absoluteUrl) return;
    try {
      await navigator.share({
        title: shareText,
        text: description ?? shareText,
        url: absoluteUrl,
      });
    } catch (err) {
      // Kullanıcı iptal etti — sessiz geç
      if (err instanceof Error && err.name !== "AbortError") {
        console.warn("[share]", err);
      }
    }
  };

  const whatsappUrl = absoluteUrl
    ? `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${absoluteUrl}`)}`
    : "#";
  const xUrl = absoluteUrl
    ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(absoluteUrl)}`
    : "#";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canNativeShare ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleNativeShare}
          aria-label="Paylaş"
        >
          <Share2 className="mr-1.5 size-4" />
          Paylaş
        </Button>
      ) : null}

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp ile paylaş"
        className="border-border hover:border-foreground/40 hover:bg-muted/50 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors"
      >
        <WhatsAppIcon className="size-3.5" />
        WhatsApp
      </a>

      <a
        href={xUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="X'te paylaş"
        className="border-border hover:border-foreground/40 hover:bg-muted/50 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors"
      >
        <XIcon className="size-3" />
        Paylaş
      </a>

      <button
        type="button"
        onClick={handleCopy}
        aria-label="Bağlantıyı kopyala"
        className="border-border hover:border-foreground/40 hover:bg-muted/50 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors"
      >
        {copied ? (
          <>
            <Check className="text-brand-yaprak size-3.5" />
            Kopyalandı
          </>
        ) : (
          <>
            <Copy className="size-3.5" />
            Kopyala
          </>
        )}
      </button>
    </div>
  );
}
