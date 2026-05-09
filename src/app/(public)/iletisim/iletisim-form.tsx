"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { butceOptions } from "@/lib/validations/lead";
import { kategoriOptions } from "@/lib/validations/case-study";
import { cn } from "@/lib/utils";

import { submitLead } from "./actions";

export function IletisimForm() {
  const [isPending, startTransition] = useTransition();
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

  const toggleHizmet = (val: string) =>
    setHizmetler((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
    );

  if (submitted) {
    return (
      <div className="border-border/60 from-card/60 rounded-2xl border bg-gradient-to-br to-transparent p-8 text-center">
        <div className="bg-brand/10 text-brand mx-auto inline-flex size-16 items-center justify-center rounded-full">
          <CheckCircle2 className="size-8" />
        </div>
        <h2 className="font-heading mt-6 text-2xl font-bold">Mesajınız bize ulaştı.</h2>
        <p className="text-muted-foreground mt-3 text-sm">
          Çok acil ise{" "}
          <a href="tel:+905322618222" className="text-brand hover:underline">
            +90 532 261 82 22
          </a>{" "}
          'den bize hemen ulaşabilirsiniz.
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
        formData.delete("hizmet_kategori");
        hizmetler.forEach((h) => formData.append("hizmet_kategori", h));
        formData.set("butce", butce);
        formData.set("kvkk_onay", kvkk ? "on" : "");

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
          <Label htmlFor="ad_soyad">
            Ad Soyad <span className="text-brand">*</span>
          </Label>
          <Input
            id="ad_soyad"
            name="ad_soyad"
            value={adSoyad}
            onChange={(e) => setAdSoyad(e.target.value)}
            required
            minLength={3}
            placeholder="Ali Yılmaz"
            autoComplete="name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="eposta">
            E-posta <span className="text-brand">*</span>
          </Label>
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
            inputMode="tel"
            value={telefon}
            onChange={(e) => {
              // Sadece rakam, boşluk, +, (, ), - kabul et
              const filtered = e.target.value.replace(/[^\d\s+()\-]/g, "");
              setTelefon(filtered);
            }}
            placeholder="+90 555 ..."
            autoComplete="tel"
            pattern="[\d\s\+\(\)\-]{7,}"
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
        <Label htmlFor="brief">
          Brief <span className="text-brand">*</span>
        </Label>
        <textarea
          id="brief"
          name="brief"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          required
          minLength={20}
          maxLength={5000}
          rows={7}
          className="border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
          placeholder="Markandan, hedeflerinden, aklındaki çözüm fikirlerinden bahset. Ne kadar açıklayıcı olursan biz o kadar net cevap döneriz."
        />

        {/* Karakter sayacı (solda) + Brief'i gönder butonu (sağda) */}
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-xs">
            {brief.length}/5000 — en az 20 karakter
          </p>
          <Button type="submit" size="lg" disabled={isPending || !kvkk} className="sm:ml-auto">
            {isPending ? "Gönderiliyor..." : "Brief'i gönder"}
            <ArrowUpRight className="ml-1 size-4" />
          </Button>
        </div>
      </div>

      {/* KVKK — butonun altında, sağa hizalı */}
      <label className="flex cursor-pointer items-start justify-end gap-2 text-xs">
        <input
          type="checkbox"
          name="kvkk_onay"
          checked={kvkk}
          onChange={(e) => setKvkk(e.target.checked)}
          required
          className="mt-0.5 size-4 accent-current"
        />
        <span className="text-muted-foreground">
          <Link
            href="/kvkk"
            target="_blank"
            className="hover:text-foreground underline underline-offset-2"
          >
            KVKK aydınlatma metnini
          </Link>{" "}
          okudum, kişisel verilerimin işlenmesine onay veriyorum.
        </span>
      </label>

    </form>
  );
}
