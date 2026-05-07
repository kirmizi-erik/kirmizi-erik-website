"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { updateSiteSettings } from "./actions";

type SettingsFormProps = {
  initial: {
    meta_title: string;
    meta_description: string;
    contact_email: string;
    contact_phone: string;
    contact_address: string;
    social: Record<string, string>;
    kvkk_text: string;
    cookie_text: string;
  };
};

export function SettingsForm({ initial }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          const r = await updateSiteSettings(formData);
          if (r.ok) toast.success(r.message ?? "Kaydedildi");
          else toast.error(r.error);
        })
      }
      className="space-y-8"
    >
      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wider uppercase">SEO / Meta</h2>
        <div className="space-y-2">
          <Label htmlFor="meta_title">Site başlığı (meta)</Label>
          <Input
            id="meta_title"
            name="meta_title"
            defaultValue={initial.meta_title}
            maxLength={160}
            placeholder="Kırmızı Erik — 360° Kreatif Reklam Ajansı"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="meta_description">Açıklama (meta description)</Label>
          <textarea
            id="meta_description"
            name="meta_description"
            defaultValue={initial.meta_description}
            maxLength={400}
            rows={3}
            className="border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            placeholder="Sosyal medyada paylaşıldığında ve Google sonuçlarında görünür."
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wider uppercase">İletişim</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact_email">E-posta</Label>
            <Input
              id="contact_email"
              name="contact_email"
              type="email"
              defaultValue={initial.contact_email}
              placeholder="info@kirmizierik.com.tr"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_phone">Telefon</Label>
            <Input
              id="contact_phone"
              name="contact_phone"
              defaultValue={initial.contact_phone}
              placeholder="+90 532 261 82 22"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="contact_address">Adres</Label>
            <Input
              id="contact_address"
              name="contact_address"
              defaultValue={initial.contact_address}
              placeholder="Begonya Sk. Nida Kule, Ataşehir / İstanbul"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wider uppercase">Sosyal Medya</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
            { key: "twitter", label: "X (Twitter)", placeholder: "https://twitter.com/..." },
            { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/..." },
            { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/..." },
            { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/..." },
            { key: "behance", label: "Behance", placeholder: "https://behance.net/..." },
          ].map((s) => (
            <div key={s.key} className="space-y-2">
              <Label htmlFor={`social_${s.key}`}>{s.label}</Label>
              <Input
                id={`social_${s.key}`}
                name={`social_${s.key}`}
                type="url"
                defaultValue={initial.social[s.key] ?? ""}
                placeholder={s.placeholder}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wider uppercase">Yasal Metinler</h2>
        <div className="space-y-2">
          <Label htmlFor="kvkk_text">KVKK Aydınlatma Metni</Label>
          <textarea
            id="kvkk_text"
            name="kvkk_text"
            defaultValue={initial.kvkk_text}
            rows={8}
            className="border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            placeholder="KVKK metnini buraya yapıştır. /kvkk sayfasında görünür."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cookie_text">Çerez bildirimi</Label>
          <textarea
            id="cookie_text"
            name="cookie_text"
            defaultValue={initial.cookie_text}
            rows={4}
            className="border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            placeholder="Çerez kullanımı hakkında kısa bilgi"
          />
        </div>
      </section>

      <div className="border-border flex items-center justify-end border-t pt-6">
        <Button type="submit" disabled={isPending} size="lg">
          {isPending ? "Kaydediliyor..." : "Ayarları kaydet"}
        </Button>
      </div>
    </form>
  );
}
