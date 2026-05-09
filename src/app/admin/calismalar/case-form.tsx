"use client";

import { useState, useTransition } from "react";
import { Eye, Upload, X } from "lucide-react";
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
} from "@/lib/validations/case-study";
import { cn } from "@/lib/utils";

import { parseVideoUrl } from "@/lib/embed";
import {
  IMAGE_GUIDELINES,
  MAX_IMAGE_SIZE_MB,
  MAX_VIDEO_SIZE_MB,
} from "@/lib/upload-limits";

import { createCaseStudy, updateCaseStudy, uploadMedia } from "./actions";
import { CasePreviewModal } from "./case-preview-modal";

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
    aciklama: string | null;
    galeri_urls: string[];
    durum: CaseStudyDurum;
    one_cikan: boolean;
  };
};

const durumOptions = durumSchema.options;

export function CaseForm({ mode, initial }: CaseFormProps) {
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Controlled state
  const [baslik, setBaslik] = useState(initial?.baslik ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugManuel, setSlugManuel] = useState(mode === "edit");
  const [ozet, setOzet] = useState(initial?.ozet ?? "");
  const [musteri, setMusteri] = useState(initial?.musteri_adi ?? "");
  const [sektor, setSektor] = useState(initial?.sektor ?? "");
  const [kategori, setKategori] = useState<string[]>(initial?.kategori ?? []);
  const [kapakUrl, setKapakUrl] = useState(initial?.kapak_url ?? "");
  const [kapakVideoUrl, setKapakVideoUrl] = useState(initial?.kapak_video_url ?? "");
  const [aciklama, setAciklama] = useState(initial?.aciklama ?? "");
  const [galeri, setGaleri] = useState<string[]>(initial?.galeri_urls ?? []);
  const [durum, setDurum] = useState<CaseStudyDurum>(initial?.durum ?? "taslak");
  const [oneCikan, setOneCikan] = useState<boolean>(initial?.one_cikan ?? false);

  const toggleKategori = (val: string) =>
    setKategori((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
    );

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "kapak" | "kapakVideo" | "galeri",
  ) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    e.target.value = ""; // reset input

    setBusy(target);
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadMedia(fd);

      if (!res.ok) {
        toast.error(`${file.name}: ${res.error}`);
        continue;
      }
      const url = res.data!.url;
      if (target === "kapak") {
        setKapakUrl(url);
        break; // tek görsel
      } else if (target === "kapakVideo") {
        setKapakVideoUrl(url);
        break; // tek video
      } else {
        setGaleri((g) => [...g, url]);
      }
    }
    setBusy(null);
    toast.success(target === "galeri" && files.length > 1 ? `${files.length} görsel yüklendi` : "Yüklendi");
  };

  const submitForm = (formData: FormData, overrideDurum?: CaseStudyDurum) => {
    formData.delete("kategori");
    kategori.forEach((k) => formData.append("kategori", k));

    formData.set("galeri_urls", JSON.stringify(galeri));
    formData.set("kapak_url", kapakUrl);
    formData.set("kapak_video_url", kapakVideoUrl);
    formData.set("aciklama", aciklama);
    formData.set("durum", overrideDurum ?? durum);
    formData.set("one_cikan", oneCikan ? "true" : "false");

    if (overrideDurum) setDurum(overrideDurum);

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
  };

  return (
    <>
      <form action={(formData) => submitForm(formData)} className="space-y-8">
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
                value={musteri}
                onChange={(e) => setMusteri(e.target.value)}
                placeholder="Novawood"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sektor">Sektör</Label>
              <Input
                id="sektor"
                name="sektor"
                value={sektor}
                onChange={(e) => setSektor(e.target.value)}
                placeholder="Mimari / Ahşap"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="durum">Durum *</Label>
              <select
                id="durum"
                name="durum"
                value={durum}
                onChange={(e) => setDurum(e.target.value as CaseStudyDurum)}
                className="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:outline-none"
              >
                {durumOptions.map((d) => (
                  <option key={d} value={d}>
                    {durumLabel[d]}
                  </option>
                ))}
              </select>
              <p className="text-muted-foreground text-xs">
                Sadece <strong>Yayında</strong> olan çalışmalar siteye gözükür.
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="ozet">Özet</Label>
              <textarea
                id="ozet"
                name="ozet"
                value={ozet}
                onChange={(e) => setOzet(e.target.value)}
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

            <div className="md:col-span-2 space-y-2">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  name="one_cikan"
                  checked={oneCikan}
                  onChange={(e) => setOneCikan(e.target.checked)}
                  className="size-4 accent-current"
                />
                <span className="text-sm">Anasayfa &quot;Öne Çıkanlar&quot; alanında göster</span>
              </label>

              {oneCikan && durum !== "yayinda" ? (
                <div className="border-brand/40 bg-brand/5 text-brand flex items-start gap-2 rounded-md border p-3 text-xs">
                  <span className="bg-brand mt-1 size-1.5 shrink-0 rounded-full" />
                  <div>
                    <strong>Heads up:</strong> &quot;Öne çıkan&quot; işaretli ama <strong>Durum: {durumLabel[durum]}</strong>.
                    Anasayfada görünmesi için durumu <strong>Yayında</strong> yapman gerek.
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* Medya */}
        <section className="space-y-5">
          <h2 className="text-sm font-semibold tracking-wider uppercase">Medya</h2>

          {/* Kapak görsel + video */}
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
              <div className="text-muted-foreground space-y-0.5 text-xs">
                <div>
                  <strong>Önerilen:</strong> {IMAGE_GUIDELINES.cover.recommended} ·{" "}
                  {IMAGE_GUIDELINES.cover.aspect}
                </div>
                <div>Max {MAX_IMAGE_SIZE_MB} MB · jpg/png/webp · {IMAGE_GUIDELINES.cover.note}</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Kapak preview / detay videosu</Label>
              <div className="border-border relative aspect-[4/3] overflow-hidden rounded-md border">
                {kapakVideoUrl ? (
                  (() => {
                    const v = parseVideoUrl(kapakVideoUrl);
                    return (
                      <>
                        {v?.kind === "direct" ? (
                          <video
                            src={v.url}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="absolute inset-0 size-full object-cover"
                          />
                        ) : v?.kind === "youtube" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={v.thumbnail}
                            alt=""
                            className="absolute inset-0 size-full object-cover"
                          />
                        ) : v?.kind === "vimeo" ? (
                          <div className="bg-muted text-muted-foreground absolute inset-0 flex items-center justify-center text-xs">
                            Vimeo embed
                          </div>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => setKapakVideoUrl("")}
                          className="absolute top-2 right-2 inline-flex size-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
                        >
                          <X className="size-3.5" />
                        </button>
                        {v?.kind === "youtube" || v?.kind === "vimeo" ? (
                          <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] tracking-wider text-white uppercase">
                            {v.kind}
                          </span>
                        ) : null}
                      </>
                    );
                  })()
                ) : (
                  <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
                    Video yok (opsiyonel)
                  </div>
                )}
              </div>

              <Input
                type="url"
                value={kapakVideoUrl}
                onChange={(e) => setKapakVideoUrl(e.target.value)}
                placeholder="YouTube/Vimeo URL ya da yüklediğin video URL'i"
              />

              <label className="bg-muted/40 hover:bg-muted/60 inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-xs">
                <Upload className="size-3.5" />
                {busy === "kapakVideo" ? "Yükleniyor..." : "Veya video dosyası yükle"}
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleUpload(e, "kapakVideo")}
                  disabled={busy === "kapakVideo"}
                />
              </label>
              <div className="text-muted-foreground space-y-0.5 text-xs">
                <div>
                  <strong>Önerilen:</strong> {IMAGE_GUIDELINES.videoPreview.recommended} ·{" "}
                  {IMAGE_GUIDELINES.videoPreview.aspect}
                </div>
                <div>
                  Max {MAX_VIDEO_SIZE_MB} MB · mp4/webm · YouTube/Vimeo URL de kabul edilir
                </div>
              </div>
            </div>
          </div>

          {/* Galeri — çoklu görsel (3D, kurumsal kimlik, grafik tasarım vb. işler için) */}
          <div className="space-y-2">
            <Label>Galeri görselleri</Label>
            <p className="text-muted-foreground text-xs">
              3D render, kurumsal kimlik, grafik tasarım gibi işler için aynı çalışmadan birden
              fazla görsel ekleyebilirsin. Detay sayfasında galeri olarak görünür.
            </p>
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
              {busy === "galeri"
                ? "Yükleniyor..."
                : galeri.length > 0
                  ? "Galeriye görsel ekle (çoklu seçim)"
                  : "Galeri görseli ekle (çoklu seçim)"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(e, "galeri")}
                disabled={busy === "galeri"}
              />
            </label>
            <div className="text-muted-foreground space-y-0.5 text-xs">
              <div>
                <strong>Önerilen:</strong> {IMAGE_GUIDELINES.gallery.recommended} ·{" "}
                {IMAGE_GUIDELINES.gallery.aspect}
              </div>
              <div>Her görsel max {MAX_IMAGE_SIZE_MB} MB · jpg/png/webp</div>
            </div>
          </div>
        </section>

        {/* Açıklama */}
        <section className="space-y-5">
          <h2 className="text-sm font-semibold tracking-wider uppercase">Açıklama</h2>

          <div className="space-y-2">
            <Label htmlFor="aciklama">İş açıklaması</Label>
            <textarea
              id="aciklama"
              name="aciklama"
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              maxLength={20000}
              rows={14}
              className="border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm leading-relaxed focus-visible:ring-2 focus-visible:outline-none"
              placeholder="İşi anlat — ne, nasıl, neden? Markdown destekli (## başlık, **kalın**, *italik*, listeler, link)."
            />
            <p className="text-muted-foreground text-xs">
              Markdown destekli · max 20.000 karakter
            </p>
          </div>
        </section>

        {/* Submit */}
        <div className="border-border flex flex-col items-stretch gap-2 border-t pt-6 sm:flex-row sm:items-center sm:justify-end">
          {/* Önizleme */}
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setPreviewOpen(true)}
            disabled={isPending}
          >
            <Eye className="mr-1 size-4" />
            Önizle
          </Button>

          {durum !== "yayinda" ? (
            <Button
              type="button"
              disabled={isPending}
              size="lg"
              variant="default"
              onClick={(e) => {
                const form = (e.currentTarget as HTMLButtonElement).form;
                if (!form) return;
                const fd = new FormData(form);
                submitForm(fd, "yayinda");
              }}
            >
              {isPending ? "Kaydediliyor..." : "Kaydet & yayınla"}
            </Button>
          ) : null}
          <Button
            type="submit"
            disabled={isPending}
            size="lg"
            variant={durum === "yayinda" ? "default" : "ghost"}
          >
            {isPending
              ? "Kaydediliyor..."
              : mode === "create"
                ? durum === "yayinda"
                  ? "Çalışmayı yayına al"
                  : "Taslak olarak kaydet"
                : durum === "yayinda"
                  ? "Değişiklikleri kaydet"
                  : "Taslak olarak kaydet"}
          </Button>
        </div>
      </form>

      {/* Önizleme Modal'ı */}
      {previewOpen ? (
        <CasePreviewModal
          onClose={() => setPreviewOpen(false)}
          data={{
            baslik,
            slug,
            ozet,
            musteri_adi: musteri,
            sektor,
            kategori,
            kapak_url: kapakUrl,
            kapak_video_url: kapakVideoUrl,
            aciklama,
            galeri_urls: galeri,
          }}
        />
      ) : null}
    </>
  );
}
