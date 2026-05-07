# Kırmızı Erik — Web Sitesi Brief'i

**Proje adı:** `kirmizi-erik-website`
**Domain:** kirmizierik.com.tr [NETLEŞTIRILECEK: domain kayıtlı mı, DNS yönetimi nerede?]
**Tarih:** 2026-05-07
**Versiyon:** 1.0 — finalize (renk + portfolyo + hosting sonradan netleşecek)

---

## Amaç

Kırmızı Erik Reklam Ajansı'nın yeni kurumsal web sitesi + içerik yönetim paneli. Ajansın 9 hizmetini, çalışmalarını ve ekibini sunar. Yeni iş geliştirmenin (lead) ana giriş noktası.

## Hedef Kitle

- **Birincil:** Marka müdürleri, pazarlama yöneticileri (KOBİ → orta ölçek)
- **İkincil:** Kurucu/CEO'lar, doğrudan iş bağlamak isteyen
- **Tersiyer:** Sektör meslektaşları, basın, potansiyel ekip üyeleri

## Karakter / Ton

**Premium cesur** (AKQA / R/GA / Active Theory tarzı):
- Karanlık (dark mode default), yüksek kontrast
- Devasa, kalın tipografi (display font)
- Asimetrik grid, büyük beyaz/boşluk alanlar
- Smooth scroll + page transitions
- Custom cursor (opsiyonel)
- Profesyonel ama soğuk değil; cesur ama kibirli değil
- Kreatiflik kanıtı = sitenin kendisi

## Kapsam (Faz 1 — MVP)

### Sayfalar (5)

| Route | İçerik | Notlar |
|-------|--------|--------|
| `/` | Anasayfa: hero + reel + 3 sütun + öne çıkan işler + CTA | Ana satış sayfası |
| `/calismalar` | Tüm projeler (filtreli grid) | Kategori + sektör filtre |
| `/calismalar/[slug]` | Case study detay | Challenge → Solution → Result |
| `/hizmetler/ai-kurulumlari` | AI Kurulumları detay | Vurgu hizmet, canlı demo widget |
| `/iletisim` | Brief formu + iletişim | AI Brief Asistanı (opsiyonel) |

**Anasayfada 3 sütun = ajansın 9 hizmeti gruplanmış:**
| Sütun | Hizmetler |
|-------|-----------|
| Görsel İçerik & Tasarım | Video, Fotoğraf, Grafik, 3D/2D |
| Dijital Pazarlama & Yönetim | Dijital Pazarlama, Sosyal Medya |
| Yazılım & AI | Web, Uygulama, AI Kurulumları |

Diğer 8 hizmetin detay sayfası **Faz 2**'de açılır. Faz 1'de sütunlardan tıklayanlar mini bilgi modal/scroll-to görür, "Detayı yakında" mesajı + iletişim CTA.

### Anasayfa Akışı

```
1. HERO
   - Slogan: "[NETLEŞTIRILECEK — birkaç öneri aşağıda]"
   - Showreel video (autoplay muted) veya WebGL 3D arkaplan
   - 2 CTA: "Bir brief paylaş" + "Çalışmalarımızı gör"

2. AŞAĞI KAYDIR İPUCU
   - Animasyonlu mouse / arrow indicator

3. 3 SÜTUN HİZMET GRUPLARI
   - Her sütun hover'da büyüyor
   - AI Kurulumları altın/parlak vurgulu (vurgu hizmet)

4. ÖNE ÇIKAN ÇALIŞMALAR (3-6 case)
   - Asimetrik grid
   - Hover'da video preview oynar
   - "Tüm çalışmalar →" linkı

5. SOSYAL KANIT (opsiyonel)
   - Mutlu marka logoları band'ı
   - Veya kısa istatistik (X marka, Y proje)

6. ALT CTA BANT
   - "Bir sonraki büyük fikir senin mi?"
   - Brief formuna direkt link

7. FOOTER
   - Sosyal medya, iletişim, hizmet listesi, KVKK
```

### Slogan Önerileri (NETLEŞTIRILECEK)

1. "Bir fikir, dokuz disiplin, sıfır sınır."
2. "Kreatiflik. Kod. Sonuç."
3. "Reklamdan AI'ya — biz markayı kurarız."
4. "Görür, çeker, kodlarız."
5. "Erik kadar taze. Reklam kadar etkili."

---

## Tasarım Sistemi

### Renk Paleti — [SONRADAN NETLEŞECEK ⏸️]

**Karar:** Kullanıcı 2026-05-07'de "tek site rengi konusunda kararsızım, sonradan değiştiririz, sistemi kuralım" dedi.

**Logo'dan tahmin edilen renkler** (kullanıcı onayı bekliyor — sadece referans):

| Renk | Tahmin (HEX) | Kullanım önerisi |
|------|--------------|-------------------|
| Erik kırmızı (parlak) | `#DC0E18` veya `#E31E24` | "kırmızı" wordmark, ana CTA |
| Erik mor (koyu) | `#6B1B45` veya `#5C1A3F` | "erik" wordmark, ikon koyu |
| Erik mor (en koyu) | `#2D0F26` | Çok karanlık vurgu |
| Yaprak yeşili (açık) | `#87B345` | Yardımcı / vurgu |
| Yaprak yeşili (koyu) | `#4A7028` | Gölge |
| Sap altın | `#A57D34` | Akşam vurgusu (opsiyonel) |
| Tagline gri | `#7D7D7D` | Alt yazılar |

**Geçici dark theme palet (kod yazılırken kullanılan defaults):**

| Token | Geçici değer |
|-------|--------------|
| `--background` (dark) | `#0D0D0D` |
| `--foreground` | `#FAFAFA` |
| `--primary` (CTA) | `#DC0E18` (logo erik kırmızısından) |
| `--accent` | `#6B1B45` (logo erik morundan) |
| `--card` / `--border` | `#1A1A1A` / `#2A2A2A` |

CSS variables ile tek noktadan değiştirilebilir. Component'lerde **sadece semantic class** (`bg-background`, `text-primary`, `border-border`). Hard-coded HEX yok.

### Tipografi ✅ NETLEŞTI (2026-05-07)

| Kullanım | Font | Notlar |
|----------|------|--------|
| Display / Hero | **Geist** (extra bold/black weight) | Devasa başlıklar |
| Body | **Geist** (regular/medium) | Okunabilir, modern |
| UI / Code | **Geist Mono** | Monospace alanlarda |

**License:** SIL Open Font License — ticari kullanım serbest, lisans bedeli yok.
**Avantaj:** Vercel resmi fontu, projedede zaten kurulu (`next/font/google`). Türkçe (latin-ext) tam destek.

### Layout

- Asimetrik grid (12 kolon, ama içerik bazen 7+5, bazen 4+8)
- Büyük dış kenar boşluğu (max-w-screen-2xl, px-12)
- Section'lar arası 96-160px boşluk

### Animasyon

- **Lenis** smooth scroll (her sayfada)
- **Framer Motion** page transitions + element reveal
- **GSAP** sadece kompleks scroll-driven animation gerekirse
- Hover transition'ları 200-300ms, ease-out
- Cursor: custom (mix-blend-mode difference, hover'da büyür)

---

## Admin Panel (CMS)

Sadece sen ve ekibin kullanır. `/admin` route'unda, login arkasında.

### MVP modülleri

| Modül | İşlev |
|-------|-------|
| **Genel bakış** | Site istatistikleri (lead sayısı, son ziyaret saatleri opsiyonel) |
| **Çalışmalar** | Case study ekle/düzenle/yayınla. Alanlar: başlık, slug, müşteri, sektör, kategori, kapak, görseller, video, problem/çözüm/sonuç metinleri, ekip kredi, yayın durumu |
| **Lead'ler** | İletişim formundan gelen brief'ler. Filtre: durum (yeni/cevaplandı/dönüşüm), öncelik. Tek satıra detay sayfası, notlar |
| **Site ayarları** | SEO meta default'ları, footer linkleri, sosyal medya, KVKK metni |

### Faz 2 modülleri

- Hizmet sayfası içeriği (mevcut tek hizmet için sabit metin yeter)
- Blog (markdown editör)
- Ekip (üyeler, fotoğraflar)
- Çoklu dil (TR + EN)

---

## Veri Modeli (DB Şeması — taslak)

> Brief onaylandıktan sonra Supabase'e migration yazılacak. Mevcut Supabase project (`kirmizi-erik-admin`)'de eski şema duruyor — silip bu yeni şemaya geçeriz.

```sql
-- profiles (sen ve ekip)
profiles (id, full_name, role enum['owner','editor'], avatar_url, created_at)

-- case_studies
case_studies (
  id, slug unique, baslik, musteri_adi, sektor, kategori,
  kapak_url, video_url, ozet,
  problem (markdown), cozum (markdown), sonuc (markdown),
  metrikler jsonb,           -- {engagement: "+%32", conversion: "+%18"}
  ekip_krediler text[],      -- ["Yönetmen: X", "Editör: Y"]
  galeri_urls text[],
  durum enum['taslak','yayinda','arsiv'],
  yayin_tarihi timestamptz,
  created_at, updated_at
)

-- leads (form'dan gelenler)
leads (
  id, ad_soyad, eposta, telefon, sirket,
  hizmet_kategori text[],    -- ["video", "ai-kurulumlari"]
  butce text,                -- "10k-50k", "50k+"
  brief text,                -- detaylı yazı
  ai_skor numeric,           -- AI Brief Asistanı puanı (opsiyonel)
  durum enum['yeni','iletisim','teklif','kazandi','kaybetti'],
  notlar text,
  kaynak text,               -- "/iletisim", "/hizmetler/ai-kurulumlari"
  created_at
)

-- site_settings (key-value, single row)
site_settings (
  id (always 1),
  meta_default jsonb,         -- title, desc, og:image
  social jsonb,               -- {instagram, linkedin, ...}
  footer_links jsonb,
  kvkk_text text,
  updated_at
)
```

RLS: tüm tablolar açık. `case_studies` ve `site_settings` `select` herkese açık (web sitesi için). `INSERT/UPDATE/DELETE` sadece `profiles` rolünde owner/editor olanlar.

---

## Tech Stack

(Web-uygulama global standartı + bu projeye eklemeler)

| Katman | Tercih |
|--------|--------|
| Framework | Next.js 16 (App Router, Server Components) |
| TypeScript | strict + noUncheckedIndexedAccess |
| UI | Tailwind v4 + shadcn/ui (admin paneli için) |
| Smooth scroll | Lenis |
| Animasyon | Framer Motion (+ GSAP gerekirse) |
| 3D (opsiyonel) | react-three-fiber + drei |
| Form | react-hook-form + zod |
| Auth (admin) | Supabase magic link |
| DB | Supabase Postgres + RLS |
| Storage | Supabase Storage (case görselleri/küçük video) |
| Stream (büyük video) | Cloudflare Stream veya Mux [NETLEŞTIRILECEK] |
| E-posta | Resend (lead bildirimi + brief teslim onayı) |
| Analytics | Vercel Analytics + Plausible (opsiyonel) |
| Deploy | Vercel |
| i18n | next-intl (Faz 2) |

---

## Bonus Özellikler (Karar verilecek)

### A. Hero'da 3D scroll-driven erik 🌶️ ⏸️ FAZ 2

Faz 1'de yapılmıyor — lansman 3-4 hafta korunur. Faz 2'de eklenir (1-2 hafta ekstra iş): React Three Fiber ile 3D kırmızı erik, scroll'da dönüyor/deforme oluyor.

### B. AI Brief Asistanı (iletişim formunda) ✅ FAZ 1 ⭐

**MVP'nin star feature'ı.** İletişim formunda kullanıcı yazarken Claude API canlı feedback:
- "Bu bütçeye şu hizmetler uygun" önerisi
- "Brief'in eksik, şu noktayı netleştir" uyarısı
- Form sonunda otomatik özet
- AI Kurulumları hizmetinin **canlı kanıtı**

**Implementation:**
- Anthropic SDK + `claude-haiku-4-5` (hızlı + ucuz, demo için yeterli)
- API key Vercel env'e (sadece server-side)
- Server Action ile her input'ta tetiklenir, debounce 800ms
- Maliyet: ~$5-15/ay (düşük trafik), kullanım artarsa rate limit eklenir

### C. Çalışmalar grid'inde hover video preview ✅ FAZ 1

Card hover'da otomatik küçük video oynar (muted, loop). AKQA / Buck tarzı UX. Case study'lerin `kapak_video_url`'ini kullanır.

---

## Açık Sorular [NETLEŞTIRILECEK — sıradaki konuşma]

1. ~~**Domain:** kirmizierik.com.tr kayıtlı mı? DNS nerede yönetiliyor?~~ ✅ **NETLEŞTI (2026-05-07):** Domain kayıtlı, kullanıcıda, DNS erişimi var. Lansman zamanı registrar (Natro/Cloudflare vb.) bilgisi alınacak, Vercel'e A/CNAME ile bağlanacak.
2. ~~**Logo:** Mevcut logo var mı?~~ ✅ NETLEŞTI (2026-05-07): Logo `~/Desktop/kirmizi-erik-ajans/kirmizi-erik-logo/`'de. Master AI vektör + 2 PNG (renkli yatay logo, dikey erik ikonu) kullanıcıdan alındı. Projeye kopyalandı: `public/logo/` (logo, ikonlar) + `src/app/icon.png` & `apple-icon.png` (Next.js auto-detect favicon).
3. **Renk paleti:** Erik kırmızısı tonu specific (HEX değeri)? Yoksa benim önerim üzerinde mi gidiyoruz?
4. **Tipografi:** Lisanslı font için bütçe var mı, yoksa Geist + Inter (ücretsiz) ile mi?
5. ~~**Mevcut portfolyo:** İlk 3-5 case study için hangi projeleri kullanacağız?~~ ⏸️ **SONRADAN (2026-05-07):** Kullanıcı portfolyo listesini sonra anlatacak. Faz 1'de anasayfada "Öne çıkan çalışmalar" alanı **placeholder** ile yapılır (3-6 boş kart, "Yakında" rozeti). Admin panelden case study girildikçe alan dolar. Lansman öncesi en az 3 case study eklenmesi önerilir.
6. ~~**Showreel:** Hazır 60-90 sn'lik bir reel var mı?~~ ✅ NETLEŞTI (2026-05-07): **Hibrit yaklaşım** — Hero'da büyük display typography ana karakter; arka planda 5-10 sn kırmızı/siyah soyut motion loop video (ses yok, autoplay muted). Showreel hazırlandığında ileri faz'da değiştirilebilir, opsiyonel modal'da gösterilebilir.
7. ~~**Hero feature'lar:** 3D erik ve AI Brief Asistanı — Faz?~~ ✅ NETLEŞTI: 3D erik → Faz 2; AI Brief Asistanı → Faz 1 (MVP star feature).
8. ~~**Stream service:**~~ ⏸️ Hibrit hero kararı sonrası: Faz 1'de büyük showreel yok → Cloudflare Stream/Mux gerek değil. Küçük loop video Supabase Storage'da yeterli. Faz 2'de showreel eklenirse yeniden konuşulur.
9. ~~**Logo dosyaları + marka rehberi:**~~ ✅ Logo yerleştirildi. Marka rehberi (kullanım kuralları, padding, küçültme limitleri) Faz 2'de detaylanır.
10. ~~**Hosting:**~~ ⏸️ **LOKAL-FIRST KARAR (2026-05-07):** Site lokalde geliştirilir, MVP bitince hosting seçeneği konuşulur. Mevcut Alastyr Linux Bayi Hosting paketi Next.js'in tam feature set'ini desteklemiyor. Lansman zamanı 3 yol değerlendirilecek: (a) Domain Alastyr, hosting Vercel; (b) Alastyr VPS planına geçiş; (c) Static export + mevcut paket (feature kaybı).

---

## Faz 1 Takvim Tahmini (3-4 hafta)

| Hafta | İş |
|-------|-----|
| 1 | Setup (boilerplate klon + Supabase yeni şema + Vercel + domain) + tasarım sistemi (renk, font, base component) |
| 2 | Anasayfa hero + 3 sütun + öne çıkan işler grid + admin panel auth |
| 3 | Çalışmalar liste + case study detay + admin'de case CRUD |
| 4 | AI Kurulumları sayfası + iletişim formu + lead admin + (opsiyonel) AI Brief Asistanı + production polishing |

**Lansman:** Hafta 4 sonu — staging URL'de test, Hafta 5 başında production.

---

## Sıradaki Adımlar (Brief v1.0 onaylandı → implementation)

### Tamamlandı (2026-05-07)
- ✅ Brief sorularının 7'si netleşti, 3'ü "sonradan" (renk, portfolyo, hosting)
- ✅ Boilerplate'ten klon → `projeler/kirmizi-erik-website/`
- ✅ GitHub repo: `kirmizi-erik/kirmizi-erik-website` (private, push'landı)
- ✅ Logo + favicon (Next.js icon convention) yerleştirildi
- ✅ Supabase project bağlı (`kirmizi-erik-admin`, eski şema halen duruyor — silineceği)

### Sıradaki — Hafta 1
1. **Supabase yeni şemaya geç:** Eski (musteriler/projeler/...) tabloları sil, web sitesi için yeni şema (case_studies, leads, site_settings, profiles)
2. **Tasarım sistemi temeli:** `globals.css` CSS variables (logo'dan tahmini palet ile), Tailwind theme config, base typography (Geist)
3. **Header + Footer component'leri:** logo (PNG'den Image component), nav links, mobil menü
4. **Anasayfa hero:** display tipografi + soyut motion arkaplan + CTA'lar
5. **3 sütun hizmet bölümü:** anasayfa altında, hover micro-interaction
6. **Öne çıkan çalışmalar:** placeholder kartlar (admin'den dolacak)

### Hafta 2-3
7. Çalışmalar liste sayfası (`/calismalar`)
8. Çalışma detay (`/calismalar/[slug]`) — case study render
9. Admin paneli auth (Supabase magic link, `/admin` route group)
10. Admin'de Çalışma CRUD (form, listele, sil, yayınla)

### Hafta 4
11. Hizmet sayfası: `/hizmetler/ai-kurulumlari`
12. İletişim sayfası: form + Server Action + Resend e-posta
13. **AI Brief Asistanı** (Anthropic SDK + Claude Haiku 4.5)
14. Admin'de Lead'ler (filter + status update)
15. Admin'de Site Ayarları (SEO, footer, sosyal)
16. Hover video preview (case grid)
17. Lansman öncesi polishing (SEO, sitemap, robots, OG image, accessibility audit)

### Lansman (Hafta 4 sonu - Hafta 5 başı)
18. Hosting kararı (Vercel vs Alastyr VPS — sen vereceksin)
19. Production deploy
20. Domain DNS bağlantısı
21. Renk paleti final review
22. İlk 3 case study içeriğini birlikte yazıyoruz

---

## Geliştirme prensibi

**Lokal-first:** Tüm geliştirme `localhost:3000`'de yapılır. `pnpm dev`. Supabase hibrit (cloud DB + lokal Next.js). Lansman zamanına kadar deploy yok.
