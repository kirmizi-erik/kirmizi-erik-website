"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  Copy,
  DoorOpen,
  FileText,
  Loader2,
  Mail,
  Map,
  Network,
  Quote,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LAYER_COLORS,
  LAYER_LABELS,
  type Finding,
  type LayerKey,
  type ScanResult,
} from "@/lib/ai-scan/types";
import { cn } from "@/lib/utils";

import { scanSite, sendScanReport } from "./actions";

export function ScanClient() {
  const [isPending, startTransition] = useTransition();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  const onScan = () => {
    if (!url.trim() || isPending) return;
    setError(null);
    setResult(null);
    startTransition(async () => {
      const res = await scanSite(url);
      if (res.ok) setResult(res.result);
      else setError(res.error);
    });
  };

  return (
    <div>
      {/* Tarama kutusu */}
      <div className="mx-auto max-w-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onScan();
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Input
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder="firmaniz.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            aria-label="Taranacak site adresi"
            className="h-12 flex-1 text-base"
          />
          <Button type="submit" size="lg" disabled={isPending || !url.trim()} className="h-12 px-7">
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Taranıyor…
              </>
            ) : (
              <>
                Ücretsiz tara
                <ArrowRight className="ml-1 size-4" />
              </>
            )}
          </Button>
        </form>
        <p className="text-muted-foreground mt-3 text-center text-xs">
          Kayıt yok, kart yok · günde 3 tarama · ~20 saniye sürer
        </p>
        {isPending ? (
          <p className="text-muted-foreground mt-4 text-center text-sm">
            Sayfanız 5 farklı AI bot kimliğiyle çekiliyor, robots.txt ile sunucu davranışı
            karşılaştırılıyor…
          </p>
        ) : null}
        {error ? (
          <div className="border-brand/40 bg-brand/5 mt-4 flex items-start gap-3 rounded-xl border p-4 text-sm">
            <ShieldAlert className="text-brand mt-0.5 size-4 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}
      </div>

      {result ? <ScanReport result={result} /> : null}
    </div>
  );
}

/* ---------- Rapor ---------- */

function ScanReport({ result }: { result: ScanResult }) {
  const kritik = result.katmanlar
    .flatMap((k) => k.bulgular)
    .filter((b) => b.onem === "kritik").length;
  const uyari = result.katmanlar
    .flatMap((k) => k.bulgular)
    .filter((b) => b.onem === "uyari").length;

  return (
    <div className="mt-12 space-y-6">
      {/* Skor kartı */}
      <div className="border-border/60 bg-muted/30 rounded-3xl border p-6 sm:p-10">
        <div className="flex flex-col items-center gap-8 md:flex-row">
          <ScoreRing skor={result.skor} not={result.not} />
          <div className="text-center md:text-left">
            <h2 className="font-heading text-2xl font-black tracking-tight sm:text-3xl">
              {result.hostname}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xl text-base">{result.ozet}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
              <Chip>{kritik} kritik bulgu</Chip>
              <Chip>{uyari} uyarı</Chip>
              <Chip>{result.metrics.wordCount} kelime okundu</Chip>
              <Chip>~{result.metrics.tokenEstimate} token</Chip>
              <Chip>{(result.metrics.ttfbMs / 1000).toFixed(1)} sn ilk yanıt</Chip>
            </div>
          </div>
        </div>
      </div>

      {/* Katmanlar */}
      <div className="border-border/60 rounded-3xl border p-6 sm:p-8">
        <h3 className="font-heading text-xl font-bold">Beş katman</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Her katmana tıklayınca bulgular ve çözümleri açılır.
        </p>
        <div className="mt-5 space-y-3">
          {result.katmanlar.map((k) => (
            <LayerRow
              key={k.key}
              layerKey={k.key}
              baslik={LAYER_LABELS[k.key].baslik}
              soru={LAYER_LABELS[k.key].soru}
              puan={k.puan}
              agirlik={k.agirlik}
              ozet={k.ozet}
              bulgular={k.bulgular}
            />
          ))}
        </div>
      </div>

      {/* Ölçülen değerler */}
      <div className="border-border/60 rounded-3xl border p-6 sm:p-8">
        <h3 className="font-heading text-xl font-bold">Ölçülen değerler</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Bir botun bu sayfayı almak için ödediği bedel ve karşılığında aldığı içerik.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Metric v={`${result.metrics.htmlKb} KB`} l="İndirilen HTML" />
          <Metric v={`%${result.metrics.textRatio}`} l="Metin / kod oranı" />
          <Metric v={String(result.metrics.tokenEstimate)} l="Tahmini token" />
          <Metric v={`${result.metrics.ttfbMs} ms`} l="İlk yanıt süresi" />
          <Metric v={String(result.metrics.headings)} l="Başlık sayısı" />
          <Metric v={String(result.semantics.jsonLdBlocks)} l="Şema bloğu" />
          <Metric v={String(result.metrics.internalLinks)} l="İç bağlantı" />
          <Metric
            v={`${result.metrics.imagesWithAlt}/${result.metrics.imagesTotal}`}
            l="Alt metinli görsel"
          />
          <Metric v={result.metrics.compression ?? "yok"} l="Sıkıştırma" />
          <Metric v={String(result.metrics.redirects)} l="Yönlendirme" />
        </div>
      </div>

      {/* Bot parite matrisi */}
      <div className="border-border/60 rounded-3xl border p-6 sm:p-8">
        <h3 className="font-heading text-xl font-bold">Bot kimliği parite matrisi</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Aynı sayfa beş farklı bot kimliğiyle çekildi; robots.txt&apos;in söylediği ile sunucunun
          yaptığı burada karşılaşıyor.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {result.bots.map((b) => (
            <div key={b.bot} className="border-border/60 rounded-xl border p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                  <Bot className="size-3.5" />
                  {b.bot}
                </span>
                <BotBadge sonuc={b.sonuc} />
              </div>
              <div className="text-muted-foreground mt-3 space-y-1 font-mono text-xs">
                <p>HTTP {b.status ?? "—"}</p>
                <p>
                  robots:{" "}
                  {b.robotsAllowed === null ? "dosya yok" : b.robotsAllowed ? "izinli" : "engelli"}
                </p>
                <p>{b.bytes ? `${Math.round(b.bytes / 1024)} KB` : "—"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Teknik envanter */}
      <div className="border-border/60 rounded-3xl border p-6 sm:p-8">
        <h3 className="font-heading text-xl font-bold">Teknik envanter</h3>
        <dl className="mt-5 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          <InvRow k="Site altyapısı" v={result.tech.framework ?? "tespit edilemedi"} />
          <InvRow k="Sunucu / CDN" v={result.tech.server ?? "belirtilmemiş"} />
          <InvRow
            k="Analitik"
            v={
              result.tech.analytics.length
                ? result.tech.analytics.join(", ")
                : "kaynakta görünmüyor"
            }
          />
          <InvRow k="robots.txt" v={result.infra.robotsTxt ? "var" : "yok"} />
          <InvRow k="sitemap.xml" v={result.infra.sitemap ? "var" : "yok"} />
          <InvRow
            k="llms.txt"
            v={result.infra.llmsTxt ? (result.infra.llmsFullTxt ? "var (+full)" : "var") : "yok"}
          />
          <InvRow
            k="Yapılandırılmış veri"
            v={
              result.semantics.jsonLdBlocks
                ? `${result.semantics.jsonLdBlocks} blok · ${result.semantics.jsonLdTypes.slice(0, 5).join(", ")}`
                : "yok"
            }
          />
          <InvRow
            k="Güvenlik başlıkları"
            v={
              [result.tech.csp ? "CSP" : null, result.tech.hsts ? "HSTS" : null]
                .filter(Boolean)
                .join(" + ") || "eksik"
            }
          />
        </dl>
      </div>

      <PromptCard prompt={result.prompt} />
      <ReportEmailCard result={result} />
    </div>
  );
}

function ScoreRing({ skor, not: grade }: { skor: number; not: string }) {
  const r = 56;
  const c = 2 * Math.PI * r;
  const renk = skor >= 80 ? "text-green-500" : skor >= 55 ? "text-amber-500" : "text-brand";
  return (
    <div className="relative shrink-0">
      <svg width="150" height="150" viewBox="0 0 150 150" className="-rotate-90">
        <circle cx="75" cy="75" r={r} fill="none" strokeWidth="10" className="stroke-border/60" />
        <circle
          cx="75"
          cy="75"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * skor) / 100}
          className={cn("transition-all duration-1000", renk)}
          stroke="currentColor"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-heading text-4xl font-black", renk)}>{skor}</span>
        <span className="text-muted-foreground text-xs">/ 100 · {grade}</span>
      </div>
    </div>
  );
}

const LAYER_ICONS: Record<LayerKey, typeof DoorOpen> = {
  erisim: DoorOpen,
  cikarilabilirlik: FileText,
  altyapi: Map,
  anlam: Network,
  alintilanabilirlik: Quote,
};

function LayerRow(props: {
  layerKey: LayerKey;
  baslik: string;
  soru: string;
  puan: number;
  agirlik: number;
  ozet: string;
  bulgular: Finding[];
}) {
  const [open, setOpen] = useState(false);
  const renk =
    props.puan >= 80 ? "text-green-500" : props.puan >= 55 ? "text-amber-500" : "text-brand";
  const stil = LAYER_COLORS[props.layerKey];
  const Ikon = LAYER_ICONS[props.layerKey];
  return (
    <div className={cn("border-border/60 rounded-xl border border-l-4", stil.border)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="hover:bg-muted/40 flex w-full cursor-pointer items-center gap-4 rounded-xl p-4 text-left transition-colors"
        aria-expanded={open}
      >
        <span className={cn("font-heading w-12 shrink-0 text-2xl font-black", renk)}>
          {props.puan}
        </span>
        <span
          className={cn(
            "hidden size-9 shrink-0 items-center justify-center rounded-lg sm:flex",
            stil.bg,
            stil.text,
          )}
        >
          <Ikon className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{props.baslik}</span>
            <span className="text-muted-foreground border-border/60 rounded-full border px-2 py-0.5 text-[11px]">
              ağırlık %{props.agirlik}
            </span>
            {props.bulgular.length ? (
              <span className="text-muted-foreground border-border/60 rounded-full border px-2 py-0.5 text-[11px]">
                {props.bulgular.length} bulgu
              </span>
            ) : null}
          </span>
          <span className={cn("mt-0.5 block text-sm font-medium", stil.text)}>{props.soru}</span>
          <span className="text-muted-foreground mt-0.5 block text-sm">{props.ozet}</span>
        </span>
        <ChevronDown
          className={cn(
            "text-muted-foreground size-4 shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <div className="border-border/60 border-t p-4">
          {props.bulgular.length ? (
            <ul className="mt-3 space-y-3">
              {props.bulgular.map((b, i) => (
                <li key={i} className="text-sm">
                  <p className="font-medium">
                    <span className={b.onem === "kritik" ? "text-brand" : "text-amber-500"}>
                      {b.onem === "kritik" ? "Kritik: " : b.onem === "uyari" ? "Uyarı: " : ""}
                    </span>
                    {b.mesaj}
                  </p>
                  <p className="text-muted-foreground mt-1">Çözüm: {b.cozum}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground mt-3 text-sm">
              Bu katmanda öne çıkan eksik bulunamadı.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function PromptCard({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);
  if (!prompt) return null;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard izni yoksa sessiz geç
    }
  };
  return (
    <div className="border-brand/40 from-brand/[0.06] rounded-3xl border bg-gradient-to-br via-transparent to-transparent p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <Sparkles className="text-brand mt-1 size-5 shrink-0" />
        <div>
          <h3 className="font-heading text-xl font-bold">
            Bu düzeltmeleri yapay zekânıza yaptırın
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Bulguları öncelik sırasına dizilmiş tek bir görev listesine çevirdik. Kopyalayıp Claude,
            ChatGPT ya da Cursor&apos;a yapıştırın — ya da düzeltmeleri bize bırakın.
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button onClick={copy} variant={copied ? "secondary" : "default"}>
          {copied ? <Check className="mr-2 size-4" /> : <Copy className="mr-2 size-4" />}
          {copied ? "Kopyalandı" : "Prompt'u kopyala"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/iletisim">Bize yaptırın</Link>
        </Button>
      </div>
    </div>
  );
}

function ReportEmailCard({ result }: { result: ScanResult }) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kvkk, setKvkk] = useState(false);

  if (done) {
    return (
      <div className="rounded-3xl border border-green-600/40 bg-green-500/5 p-6 text-center sm:p-8">
        <Check className="mx-auto size-8 text-green-500" />
        <h3 className="font-heading mt-3 text-xl font-bold">Rapor yola çıktı</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Tam raporu e-postanıza gönderdik. Düzeltmeleri konuşmak isterseniz ekibimiz bir adım
          ötede.
        </p>
      </div>
    );
  }

  return (
    <div className="border-border/60 bg-muted/30 rounded-3xl border p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <Mail className="text-brand mt-1 size-5 shrink-0" />
        <div>
          <h3 className="font-heading text-xl font-bold">Tam raporu e-postanıza gönderelim</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Bulgular, çözümler ve katman puanları — ekibinizle paylaşabileceğiniz biçimde.
          </p>
        </div>
      </div>
      <form
        className="mt-5 grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (isPending || !kvkk) return;
          setError(null);
          const fd = new FormData(e.currentTarget);
          fd.set("kvkk_onay", kvkk ? "on" : "");
          startTransition(async () => {
            const res = await sendScanReport(fd, result);
            if (res.ok) setDone(true);
            else setError(res.error);
          });
        }}
      >
        <Input name="ad_soyad" placeholder="Ad Soyad" required minLength={3} maxLength={120} />
        <Input name="eposta" type="email" placeholder="is@eposta.com" required maxLength={200} />
        <label className="text-muted-foreground flex items-start gap-2 text-xs sm:col-span-2">
          <input
            type="checkbox"
            checked={kvkk}
            onChange={(e) => setKvkk(e.target.checked)}
            className="mt-0.5 cursor-pointer"
          />
          <span>
            <Link href="/kvkk" className="underline" target="_blank">
              KVKK Aydınlatma Metni
            </Link>
            &apos;ni okudum; raporun e-postama gönderilmesini ve benimle iletişime geçilmesini
            onaylıyorum.
          </span>
        </label>
        {error ? <p className="text-brand text-sm sm:col-span-2">{error}</p> : null}
        <Button type="submit" disabled={isPending || !kvkk} className="sm:col-span-2">
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Gönderiliyor…
            </>
          ) : (
            "Raporu mailime gönder"
          )}
        </Button>
      </form>
    </div>
  );
}

/* ---------- küçük parçalar ---------- */

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="border-border/60 text-muted-foreground rounded-full border px-3 py-1 text-xs">
      {children}
    </span>
  );
}

function Metric({ v, l }: { v: string; l: string }) {
  return (
    <div className="border-border/60 rounded-xl border p-4">
      <p className="font-heading text-lg font-black break-all">{v}</p>
      <p className="text-muted-foreground mt-1 text-xs">{l}</p>
    </div>
  );
}

function BotBadge({ sonuc }: { sonuc: "gecti" | "engelli" | "farkli" | "hata" }) {
  const map = {
    gecti: { label: "Geçti", cls: "border-green-600/40 text-green-500" },
    engelli: { label: "Engelli", cls: "border-brand/50 text-brand" },
    farkli: { label: "Tutarsız", cls: "border-amber-500/50 text-amber-500" },
    hata: { label: "Hata", cls: "border-border text-muted-foreground" },
  } as const;
  const m = map[sonuc];
  return (
    <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium", m.cls)}>
      {m.label}
    </span>
  );
}

function InvRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="border-border/40 flex items-baseline justify-between gap-4 border-b pb-2">
      <dt className="text-muted-foreground shrink-0">{k}</dt>
      <dd className="text-right font-medium break-words">{v}</dd>
    </div>
  );
}
