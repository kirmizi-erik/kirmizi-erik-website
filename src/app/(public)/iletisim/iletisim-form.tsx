"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowUpRight, CheckCircle2, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { butceOptions, type AiAnalysis } from "@/lib/validations/lead";
import { kategoriOptions } from "@/lib/validations/case-study";
import { cn } from "@/lib/utils";

import { submitLead } from "./actions";
import { analyzeBriefAction } from "./ai-actions";

export function IletisimForm() {
  const [isPending, startTransition] = useTransition();
  const [isAnalyzing, startAnalyze] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  // Controlled state
  const [adSoyad, setAdSoyad] = useState("");
  const [eposta, setEposta] = useState("");
  const [telefon, setTelefon] = useState("");
  const [sirket, setSirket] = useState("");
  const [butce, setButce] = useState("");
  const [brief, setBrief] = useState("");
  const [hizmetler, setHizmetler] = useState<string[]>([]);
  const [kvkk, setKvkk] = useState(false);
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const toggleHizmet = (val: string) =>
    setHizmetler((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
    );

  const handleAnalyze = () => {
    if (brief.trim().length < 10) {
      toast.error("AI değerlendirmesi için en az 10 karakter brief yazın");
      return;
    }
    setAnalysisError(null);
    startAnalyze(async () => {
      const r = await analyzeBriefAction({
        ad_soyad: adSoyad,
        eposta,
        sirket,
        hizmet_kategori: hizmetler,
        butce,
        brief,
      });
      if (r.ok) {
        setAnalysis(r.data);
        // AI önerdiği hizmetleri kullanıcıya tıkla denilen rozet olarak gösterilir
        toast.success(`AI değerlendirmesi tamam — Skor: ${r.data.skor}/100`);
      } else {
        setAnalysisError(r.error);
        toast.error(r.error);
      }
    });
  };

  if (submitted) {
    return (
      <div className="border-border/60 from-card/60 rounded-2xl border bg-gradient-to-br to-transparent p-8 text-center">
        <div className="bg-brand/10 text-brand mx-auto inline-flex size-16 items-center justify-center rounded-full">
          <CheckCircle2 className="size-8" />
        </div>
        <h2 className="font-heading mt-6 text-2xl font-bold">Brief&apos;in alındı!</h2>
        <p className="text-muted-foreground mt-3 text-sm">
          Birkaç iş günü içinde sana <strong>{eposta}</strong> üzerinden döneceğiz.
          Acil bir konu varsa{" "}
          <a
            href="mailto:info@kirmizierik.com.tr"
            className="text-brand hover:underline"
          >
            info@kirmizierik.com.tr
          </a>{" "}
          ya da telefon en hızlı yol.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/calismalar">Çalışmalarımız</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/">
              Anasayfa
              <ArrowUpRight className="ml-1 size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      action={(formData) => {
        // Inject controlled state
        formData.delete("hizmet_kategori");
        hizmetler.forEach((h) => formData.append("hizmet_kategori", h));
        formData.set("butce", butce);
        formData.set("kvkk_onay", kvkk ? "on" : "");
        if (analysis) {
          formData.set("ai_skor", String(analysis.skor));
          formData.set("ai_ozet", analysis.ozet);
        }

        startTransition(async () => {
          const r = await submitLead(formData);
          if (r.ok) {
            setSubmitted(true);
          } else {
            toast.error(r.error);
          }
        });
      }}
      className="space-y-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="ad_soyad">Ad Soyad *</Label>
          <Input
            id="ad_soyad"
            name="ad_soyad"
            value={adSoyad}
            onChange={(e) => setAdSoyad(e.target.value)}
            required
            minLength={2}
            placeholder="Ali Yılmaz"
            autoComplete="name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="eposta">E-posta *</Label>
          <Input
            id="eposta"
            name="eposta"
            type="email"
            value={eposta}
            onChange={(e) => setEposta(e.target.value)}
            required
            placeholder="ali@firma.com"
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefon">Telefon</Label>
          <Input
            id="telefon"
            name="telefon"
            type="tel"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            placeholder="+90 555 ..."
            autoComplete="tel"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="sirket">Şirket</Label>
          <Input
            id="sirket"
            name="sirket"
            value={sirket}
            onChange={(e) => setSirket(e.target.value)}
            placeholder="Firma adı"
            autoComplete="organization"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Hangi hizmetlere ilgileniyorsun?</Label>
        <div className="flex flex-wrap gap-2">
          {kategoriOptions.map((k) => {
            const sel = hizmetler.includes(k.value);
            return (
              <button
                key={k.value}
                type="button"
                onClick={() => toggleHizmet(k.value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition-colors",
                  sel
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40",
                )}
              >
                {k.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="butce">Bütçe aralığı</Label>
        <select
          id="butce"
          name="butce"
          value={butce}
          onChange={(e) => setButce(e.target.value)}
          className="border-input bg-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
        >
          <option value="">Seçim yapma</option>
          {butceOptions.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="brief">Brief *</Label>
        <textarea
          id="brief"
          name="brief"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          required
          minLength={10}
          maxLength={5000}
          rows={7}
          className="border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
          placeholder="Markandan, hedeflerinden, aklındaki çözüm fikirlerinden bahset. Ne kadar açıklayıcı olursan biz o kadar net cevap döneriz."
        />
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs">
            {brief.length}/5000 karakter — markdown destekler
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAnalyze}
            disabled={isAnalyzing || brief.trim().length < 10}
          >
            <Sparkles className="mr-1 size-3.5" />
            {isAnalyzing ? "Değerlendiriliyor..." : "AI ile değerlendir"}
          </Button>
        </div>
      </div>

      {/* AI değerlendirme sonucu */}
      {analysisError ? (
        <div className="border-destructive/40 bg-destructive/5 text-destructive flex items-start gap-2 rounded-md border p-3 text-xs">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{analysisError}</span>
        </div>
      ) : null}

      {analysis ? (
        <div className="border-brand/40 from-brand/5 space-y-3 rounded-md border bg-gradient-to-br to-transparent p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="text-brand inline-flex items-center gap-2 text-xs tracking-wider uppercase">
              <Sparkles className="size-3.5" />
              AI Brief Asistanı
            </div>
            <div className="text-foreground text-2xl font-bold tracking-tight">
              {analysis.skor}
              <span className="text-muted-foreground text-xs">/100</span>
            </div>
          </div>
          <p className="text-foreground/90 text-sm leading-relaxed">{analysis.ozet}</p>
          {analysis.eksikler.length > 0 ? (
            <div className="space-y-1.5">
              <div className="text-muted-foreground text-xs tracking-wider uppercase">
                Daha net olabilir
              </div>
              <ul className="space-y-1 text-sm">
                {analysis.eksikler.map((e, i) => (
                  <li key={i} className="text-foreground/80 flex items-start gap-2">
                    <span className="bg-brand/60 mt-2 size-1 shrink-0 rounded-full" />
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {analysis.onerilenHizmetler.length > 0 ? (
            <div className="space-y-1.5">
              <div className="text-muted-foreground text-xs tracking-wider uppercase">
                Önerilen hizmetler
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.onerilenHizmetler.map((slug) => {
                  const k = kategoriOptions.find((o) => o.value === slug);
                  if (!k) return null;
                  const sel = hizmetler.includes(slug);
                  return (
                    <button
                      key={slug}
                      type="button"
                      onClick={() => toggleHizmet(slug)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs transition-colors",
                        sel
                          ? "bg-brand text-background border-brand"
                          : "border-brand/40 text-brand hover:bg-brand/10",
                      )}
                    >
                      {sel ? "✓ " : "+ "}
                      {k.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* KVKK */}
      <label className="flex cursor-pointer items-start gap-2 text-xs">
        <input
          type="checkbox"
          name="kvkk_onay"
          checked={kvkk}
          onChange={(e) => setKvkk(e.target.checked)}
          required
          className="mt-0.5 size-4 accent-current"
        />
        <span className="text-muted-foreground">
          <Link href="/kvkk" target="_blank" className="hover:text-foreground underline underline-offset-2">
            KVKK aydınlatma metnini
          </Link>{" "}
          okudum, kişisel verilerimin işlenmesine onay veriyorum.
        </span>
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-xs">
          Birkaç iş günü içinde döneriz. Acil ise{" "}
          <a href="tel:+905322618222" className="hover:text-foreground">
            +90 532 261 82 22
          </a>
          .
        </p>
        <Button type="submit" size="lg" disabled={isPending || !kvkk}>
          {isPending ? "Gönderiliyor..." : "Brief'i gönder"}
          <ArrowUpRight className="ml-1 size-4" />
        </Button>
      </div>
    </form>
  );
}
