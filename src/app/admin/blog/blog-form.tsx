"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, ImagePlus, XCircle } from "lucide-react";

import { Markdown } from "@/components/site/markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { blogSlugify, readingMinutes } from "@/lib/validations/blog";
import { durumLabel, kategoriOptions, type CaseStudyDurum } from "@/lib/validations/case-study";
import { cn } from "@/lib/utils";

import { uploadFile } from "../calismalar/upload-file";
import type { BlogSaveState } from "./actions";

export type BlogFormValues = {
  baslik: string;
  slug: string;
  seo_baslik: string | null;
  ozet: string | null;
  icerik: string;
  kapak_url: string | null;
  kategori: string[];
  durum: string;
};

const EMPTY: BlogFormValues = {
  baslik: "",
  slug: "",
  seo_baslik: "",
  ozet: "",
  icerik: "",
  kapak_url: "",
  kategori: [],
  durum: "taslak",
};

const textareaClass =
  "border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none";

export function BlogForm({
  action,
  initial,
  isNew,
  justSaved,
}: {
  action: (prev: BlogSaveState, formData: FormData) => Promise<BlogSaveState>;
  initial?: BlogFormValues;
  isNew: boolean;
  justSaved?: boolean;
}) {
  const v = initial ?? EMPTY;
  const [state, formAction] = useActionState(
    action,
    justSaved ? { ok: true, message: "Yazı oluşturuldu" } : null,
  );
  const [baslik, setBaslik] = useState(v.baslik);
  const [slug, setSlug] = useState(v.slug);
  const [slugEdited, setSlugEdited] = useState(!isNew);
  const [seoBaslik, setSeoBaslik] = useState(v.seo_baslik ?? "");
  const [ozet, setOzet] = useState(v.ozet ?? "");
  const [icerik, setIcerik] = useState(v.icerik);
  const [kapak, setKapak] = useState(v.kapak_url ?? "");
  const [kategori, setKategori] = useState<string[]>(v.kategori);
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const titleForSeo = seoBaslik || baslik;

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="baslik">Başlık *</Label>
        <Input
          id="baslik"
          name="baslik"
          required
          value={baslik}
          onChange={(e) => {
            setBaslik(e.target.value);
            if (!slugEdited) setSlug(blogSlugify(e.target.value));
          }}
          placeholder="Reklam Filmi Fiyatlarını Neler Belirler?"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="slug">Adres (slug) *</Label>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-muted-foreground shrink-0">/blog/</span>
            <Input
              id="slug"
              name="slug"
              required
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugEdited(true);
              }}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="seo_baslik">
            Google başlığı{" "}
            <span
              className={cn(
                "text-xs",
                titleForSeo.length > 60 ? "text-destructive" : "text-muted-foreground",
              )}
            >
              ({titleForSeo.length}/60)
            </span>
          </Label>
          <Input
            id="seo_baslik"
            name="seo_baslik"
            value={seoBaslik}
            onChange={(e) => setSeoBaslik(e.target.value)}
            placeholder="Boşsa başlık kullanılır"
            maxLength={70}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ozet">
          Özet — Google açıklaması ve liste kartı{" "}
          <span
            className={cn(
              "text-xs",
              ozet.length > 160 || (ozet.length > 0 && ozet.length < 110)
                ? "text-amber-500"
                : "text-muted-foreground",
            )}
          >
            ({ozet.length} karakter · ideal 120–160)
          </span>
        </Label>
        <textarea
          id="ozet"
          name="ozet"
          rows={2}
          maxLength={300}
          value={ozet}
          onChange={(e) => setOzet(e.target.value)}
          className={textareaClass}
        />
      </div>

      <div className="space-y-2">
        <Label>Kapak görseli</Label>
        <input type="hidden" name="kapak_url" value={kapak} />
        <div className="flex items-start gap-4">
          {kapak ? (
            <div className="border-border relative aspect-[1200/630] w-56 overflow-hidden rounded-md border">
              <Image src={kapak} alt="" fill className="object-cover" sizes="224px" />
            </div>
          ) : null}
          <div className="space-y-2">
            <label className="border-input hover:bg-muted inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <ImagePlus className="size-4" />
              {uploading ? "Yükleniyor…" : kapak ? "Değiştir" : "Görsel yükle"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  setUploadError(null);
                  const r = await uploadFile(file);
                  setUploading(false);
                  if (r.ok && r.data) setKapak(r.data.url);
                  else if (!r.ok) setUploadError(r.error);
                  e.target.value = "";
                }}
              />
            </label>
            {kapak ? (
              <button
                type="button"
                onClick={() => setKapak("")}
                className="text-muted-foreground hover:text-destructive block cursor-pointer text-xs"
              >
                Görseli kaldır
              </button>
            ) : null}
            {uploadError ? <p className="text-destructive text-xs">{uploadError}</p> : null}
            <p className="text-muted-foreground text-xs">
              Önerilen 1200×630 · otomatik webp&apos;e çevrilir
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>İlgili hizmetler</Label>
        <div className="flex flex-wrap gap-2">
          {kategoriOptions.map((k) => {
            const active = kategori.includes(k.value);
            return (
              <button
                type="button"
                key={k.value}
                onClick={() =>
                  setKategori((prev) =>
                    active ? prev.filter((x) => x !== k.value) : [...prev, k.value],
                  )
                }
                className={cn(
                  "cursor-pointer rounded-full border px-3 py-1 text-xs transition-colors",
                  active
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {k.label}
              </button>
            );
          })}
        </div>
        {kategori.map((k) => (
          <input key={k} type="hidden" name="kategori" value={k} />
        ))}
        <p className="text-muted-foreground text-xs">
          İlk seçilen hizmet yazının altında &quot;ilgili hizmet&quot; olarak gösterilir.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="icerik">
            İçerik (markdown){" "}
            <span className="text-muted-foreground text-xs">
              · {icerik.trim().split(/\s+/).filter(Boolean).length} kelime · ~
              {readingMinutes(icerik)} dk
            </span>
          </Label>
          <Button type="button" variant="ghost" size="sm" onClick={() => setPreview((p) => !p)}>
            {preview ? "Düzenle" : "Önizle"}
          </Button>
        </div>
        <textarea
          id="icerik"
          name="icerik"
          rows={22}
          value={icerik}
          onChange={(e) => setIcerik(e.target.value)}
          className={cn(textareaClass, "font-mono", preview && "hidden")}
          placeholder={"## Ara başlık\n\nParagraf metni…\n\n- madde\n- madde"}
        />
        {preview ? (
          <div className="border-border rounded-md border p-6">
            <Markdown>{icerik || "_(boş)_"}</Markdown>
          </div>
        ) : null}
      </div>

      <div className="border-border flex flex-wrap items-center gap-3 border-t pt-6">
        <select
          name="durum"
          defaultValue={v.durum}
          className="border-input bg-background h-9 cursor-pointer rounded-md border px-3 text-sm"
          aria-label="Durum"
        >
          {(["taslak", "yayinda", "arsiv"] as CaseStudyDurum[]).map((d) => (
            <option key={d} value={d}>
              {durumLabel[d]}
            </option>
          ))}
        </select>
        <SubmitButton />
        {state ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-sm",
              state.ok ? "text-emerald-600" : "text-destructive",
            )}
          >
            {state.ok ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
            {state.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="cursor-pointer">
      {pending ? "Kaydediliyor…" : "Kaydet"}
    </Button>
  );
}
