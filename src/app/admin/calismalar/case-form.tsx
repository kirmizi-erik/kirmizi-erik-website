"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  durumLabel,
  durumSchema,
  kategoriOptions,
  slugify,
  type CaseStudyDurum,
  type Metrik,
} from "@/lib/validations/case-study";
import { cn } from "@/lib/utils";

import { createCaseStudy, updateCaseStudy, uploadMedia } from "./actions";

type CaseFormProps = {
  mode: "create" | "edit";
  initial?: {
    id: string;
    baslik: string;
    slug: string;
    ozet: string | null;
    musteri_adi: string | null;
    sektor: string | null;
    kategori: string[];
    kapak_url: string | null;
    kapak_video_url: string | null;
    problem: string | null;
    cozum: string | null;
    sonuc: string | null;
    metrikler: Metrik[];
    ekip_krediler: string[];
    galeri_urls: string[];
    durum: CaseStudyDurum;
    one_cikan: boolean;
  };
};

const durumOptions = durumSchema.options;

export function CaseForm({ mode, initial }: CaseFormProps) {
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);

  // Controlled state
  const [baslik, setBaslik] = useState(initial?.baslik ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugManuel, setSlugManuel] = useState(mode === "edit");
  const [kategori, setKategori] = useState<string[]>(initial?.kategori ?? []);
  const [kapakUrl, setKapakUrl] = useState(initial?.kapak_url ?? "");
  const [kapakVideoUrl, setKapakVideoUrl] = useState(initial?.kapak_video_url ?? "");
  const [metrikler, setMetrikler] = useState<Metrik[]>(initial?.metrikler ?? []);
  const [ekipText, setEkipText] = useState((initial?.ekip_krediler ?? []).join("\n"));
  const [galeri, setGaleri] = useState<string[]>(initial?.galeri_urls ?? []);

  const toggleKategori = (val: string) =>
    setKategori((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
    );

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "kapak" | "kapakVideo" | "galeri",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // reset input

    setBusy(target);
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadMedia(fd);
    setBusy(null);

    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    const url = res.data!.url;
    if (target === "kapak") setKapakUrl(url);
    else if (target === "kapakVideo") setKapakVideoUrl(url);
    else setGaleri((g) => [...g, url]);
    toast.success("Yüklendi");
  };

  const addMetrik = () => setMetrikler((m) => [...m, { label: "", value: "" }]);
  const updateMetrik = (i: number, key: keyof Metrik, val: string) =>
    setMetrikler((m) => m.map((x, idx) => (idx === i ? { ...x, [key]: val } : x)));
  const removeMetrik = (i: number) =>
    setMetrikler((m) => m.filter((_, idx) => idx !== i));

  return (
    <form
      action={(formData) => {
        // Inject computed/array fields manually
        formData.delete("kategori");
        kategori.forEach((k) => formData.append("kategori", k));

        formData.set(
          "metrikler",
          JSON.stringify(metrikler.filter((m) => m.label.trim() && m.value.trim())),
        );
        formData.set(
          "ekip_krediler",
          JSON.stringify(
            ekipText
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
          ),
        );
        formData.set("galeri_urls", JSON.stringify(galeri));
        formData.set("kapak_url", kapakUrl);
        formData.set("kapak_video_url", kapakVideoUrl);

        startTransition(async () => {
          if (mode === "create") {
            const r = await createCaseStudy(formData);
            if (!r.ok) toast.error(r.error);
          } else if (initial?.id) {
            const r = await updateCaseStudy(initial.id, formData);
            if (r.ok) toast.success(r.message ?? "Kaydedildi");
            else toast.error(r.error);
          }
        });
      }}
      className="space-y-8"
    >
      {/* Temel bilgi */}
      <section className="space-y-5">
        <h2 className="text-sm font-semibold tracking-wider uppercase">Temel bilgi</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="baslik">Başlık *</Label>
            <Input
              id="baslik"
              name="baslik"
              value={baslik}
              onChange={(e) => {
                setBaslik(e.target.value);
                if (!slugManuel) setSlug(slugify(e.target.value));
              }}
              placeholder="Örn. Novawood Showreel 2025"
              required
              minLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugManuel(true);
                setSlug(e.target.value);
              }}
              placeholder="novawood-showreel-2025"
              pattern="[a-z0-9-]+"
              required
              minLength={2}
            />
            <p className="text-muted-foreground text-xs">URL: /calismalar/{slug || "..."}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="musteri_adi">Müşteri</Label>
            <Input
              id="musteri_adi"
              name="musteri_adi"
              defaultValue={initial?.musteri_adi ?? ""}
              placeholder="Novawood"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sektor">Sektör</Label>
            <Input
              id="sektor"
              name="sektor"
              defaultValue={initial?.sektor ?? ""}
              placeholder="Mimari / Ahşap"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="durum">Durum *</Label>
            <select
              id="durum"
              name="durum"
              defaultValue={initial?.durum ?? "taslak"}
              className="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:outline-none"
            >
              {durumOptions.map((d) => (
                <option key={d} value={d}>
                  {durumLabel[d]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="ozet">Özet</Label>
            <textarea
              id="ozet"
              name="ozet"
              defaultValue={initial?.ozet ?? ""}
              maxLength={600}
              rows={3}
              className="border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
              placeholder="2-3 cümlelik kısa özet (max 600 karakter, anasayfa kart ve listede görünür)"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Kategoriler</Label>
            <div className="flex flex-wrap gap-2">
              {kategoriOptions.map((k) => {
                const sel = kategori.includes(k.value);
                return (
                  <button
                    key={k.value}
                    type="button"
                    onClick={() => toggleKategori(k.value)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition-colors",
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

          <div className="md:col-span-2">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="one_cikan"
                defaultChecked={initial?.one_cikan ?? false}
                className="size-4 accent-current"
              />
              <span className="text-sm">Anasayfa &quot;Öne Çıkanlar&quot; alanında göster</span>
            </label>
          </div>
        </div>
      </section>

      {/* Medya */}
      <section className="space-y-5">
        <h2 className="text-sm font-semibold tracking-wider uppercase">Medya</h2>

        {/* Kapak görsel */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Kapak görseli</Label>
            <div className="border-border relative aspect-[4/3] overflow-hidden rounded-md border">
              {kapakUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={kapakUrl} alt="" className="absolute inset-0 size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setKapakUrl("")}
                    className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
                  >
                    <X className="size-3.5" />
                  </button>
                </>
              ) : (
                <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
                  Görsel yok
                </div>
              )}
            </div>
            <label className="bg-muted/40 hover:bg-muted/60 inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-xs">
              <Upload className="size-3.5" />
              {busy === "kapak" ? "Yükleniyor..." : "Kapak yükle"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUpload(e, "kapak")}
                disabled={busy === "kapak"}
              />
            </label>
          </div>

          <div className="space-y-2">
            <Label>Kapak preview videosu (hover&apos;da oynar)</Label>
            <div className="border-border relative aspect-[4/3] overflow-hidden rounded-md border">
              {kapakVideoUrl ? (
                <>
                  <video
                    src={kapakVideoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 size-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setKapakVideoUrl("")}
                    className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
                  >
                    <X className="size-3.5" />
                  </button>
                </>
              ) : (
                <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
                  Video yok (opsiyonel)
                </div>
              )}
            </div>
            <label className="bg-muted/40 hover:bg-muted/60 inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-xs">
              <Upload className="size-3.5" />
              {busy === "kapakVideo" ? "Yükleniyor..." : "Video yükle (loop, ses yok)"}
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => handleUpload(e, "kapakVideo")}
                disabled={busy === "kapakVideo"}
              />
            </label>
          </div>
        </div>

        {/* Galeri */}
        <div className="space-y-2">
          <Label>Galeri (detay sayfasında görünür)</Label>
          {galeri.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {galeri.map((g) => (
                <div key={g} className="border-border relative aspect-square overflow-hidden rounded-md border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g} alt="" className="absolute inset-0 size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setGaleri((arr) => arr.filter((x) => x !== g))}
                    className="absolute right-1 top-1 inline-flex size-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <label className="bg-muted/40 hover:bg-muted/60 inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-xs">
            <Upload className="size-3.5" />
            {busy === "galeri" ? "Yükleniyor..." : "Galeriye görsel ekle"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUpload(e, "galeri")}
              disabled={busy === "galeri"}
            />
          </label>
        </div>
      </section>

      {/* İçerik */}
      <section className="space-y-5">
        <h2 className="text-sm font-semibold tracking-wider uppercase">İçerik</h2>

        <div className="space-y-2">
          <Label htmlFor="problem">Problem</Label>
          <textarea
            id="problem"
            name="problem"
            defaultValue={initial?.problem ?? ""}
            rows={5}
            className="border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            placeholder="Müşteri ne sorunla geldi? Markdown destekli."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cozum">Çözüm</Label>
          <textarea
            id="cozum"
            name="cozum"
            defaultValue={initial?.cozum ?? ""}
            rows={5}
            className="border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            placeholder="Biz ne yaptık? Hangi yöntemlerle çözdük?"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sonuc">Sonuç</Label>
          <textarea
            id="sonuc"
            name="sonuc"
            defaultValue={initial?.sonuc ?? ""}
            rows={5}
            className="border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            placeholder="Ne kazandırdık? Etki neydi?"
          />
        </div>

        {/* Metrikler */}
        <div className="space-y-2">
          <Label>Metrikler</Label>
          <div className="space-y-2">
            {metrikler.map((m, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={m.label}
                  onChange={(e) => updateMetrik(i, "label", e.target.value)}
                  placeholder="Engagement"
                  className="flex-1"
                />
                <Input
                  value={m.value}
                  onChange={(e) => updateMetrik(i, "value", e.target.value)}
                  placeholder="+%32"
                  className="w-32"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMetrik(i)}
                  className="shrink-0"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={addMetrik}>
            <Plus className="mr-1 size-3.5" />
            Metrik ekle
          </Button>
        </div>

        {/* Ekip kredileri */}
        <div className="space-y-2">
          <Label htmlFor="ekip_krediler">Ekip kredileri (her satır bir kişi)</Label>
          <textarea
            id="ekip_krediler"
            value={ekipText}
            onChange={(e) => setEkipText(e.target.value)}
            rows={4}
            className="border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            placeholder="Yönetmen: Özkan Kurt&#10;Editör: ...&#10;Müşteri yönetici: ..."
          />
        </div>
      </section>

      {/* Submit */}
      <div className="border-border flex items-center justify-end gap-2 border-t pt-6">
        <Button type="submit" disabled={isPending} size="lg">
          {isPending
            ? "Kaydediliyor..."
            : mode === "create"
              ? "Çalışmayı oluştur"
              : "Değişiklikleri kaydet"}
        </Button>
      </div>
    </form>
  );
}
