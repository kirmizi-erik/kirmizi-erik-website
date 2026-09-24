"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { submitLead } from "@/app/(public)/iletisim/actions";
import { PhoneInput } from "@/components/site/phone-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackLead } from "@/lib/analytics";

const BRIEF_MIN = 20;

export function ServiceLeadForm({
  serviceSlug,
  serviceLabel,
  kategori,
}: {
  serviceSlug: string;
  serviceLabel: string;
  kategori: string;
}) {
  const [pending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [kvkk, setKvkk] = useState(false);
  const [briefLength, setBriefLength] = useState(0);

  if (submitted) {
    return (
      <div className="border-border bg-background rounded-2xl border p-8 text-center">
        <CheckCircle2 className="text-brand mx-auto size-10" />
        <h3 className="font-heading mt-4 text-xl font-bold">Talebin bize ulaştı.</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          Aynı gün içinde dönüş yapıyoruz. Acil ise{" "}
          <a href="tel:+905322618222" className="text-brand hover:underline">
            +90 532 261 82 22
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      action={(formData) => {
        formData.set("kaynak", `/hizmetler/${serviceSlug}`);
        formData.set("hizmet_kategori", kategori);
        formData.set("kvkk_onay", kvkk ? "on" : "");
        startTransition(async () => {
          const r = await submitLead(formData);
          if (r.ok) {
            trackLead(`Hizmet Formu · ${serviceLabel}`);
            setSubmitted(true);
          } else {
            toast.error(r.error);
          }
        });
      }}
      className="border-border bg-background space-y-4 rounded-2xl border p-6 sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="slf-ad">Ad soyad *</Label>
          <Input id="slf-ad" name="ad_soyad" required minLength={3} autoComplete="name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slf-tel">Telefon *</Label>
          <PhoneInput id="slf-tel" name="telefon" required placeholder="+90 5__ ___ __ __" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="slf-eposta">E-posta *</Label>
        <Input id="slf-eposta" name="eposta" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slf-brief">Kısaca ne istiyorsun? *</Label>
        <textarea
          id="slf-brief"
          name="brief"
          required
          minLength={BRIEF_MIN}
          maxLength={5000}
          rows={3}
          onChange={(e) => setBriefLength(e.target.value.trim().length)}
          placeholder={`Örn. ${serviceLabel.toLocaleLowerCase("tr-TR")} için hedefin, takvimin, varsa bütçen…`}
          className="border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
        />
        {briefLength > 0 && briefLength < BRIEF_MIN ? (
          <p className="text-muted-foreground text-xs">
            {BRIEF_MIN - briefLength} karakter daha yaz, ekibimiz doğru kişiyle dönsün.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex cursor-pointer items-start gap-2 text-xs">
          <input
            type="checkbox"
            checked={kvkk}
            onChange={(e) => setKvkk(e.target.checked)}
            required
            className="mt-0.5 size-4 cursor-pointer accent-current"
          />
          <span className="text-muted-foreground">
            <Link
              href="/kvkk"
              target="_blank"
              className="hover:text-foreground underline underline-offset-2"
            >
              KVKK aydınlatma metnini
            </Link>{" "}
            okudum, onaylıyorum.
          </span>
        </label>
        <Button type="submit" size="lg" disabled={pending || !kvkk} className="cursor-pointer">
          {pending ? "Gönderiliyor…" : "Teklif iste"}
          {!pending ? <ArrowUpRight className="ml-1 size-4" /> : null}
        </Button>
      </div>
    </form>
  );
}
