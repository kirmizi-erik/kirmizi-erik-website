# Kırmızı Erik — Web Sitesi Brief'i

**Proje adı:** `kirmizi-erik-website`
**Domain:** kirmizierik.com.tr [NETLEŞTIRILECEK: domain kayıtlı mı, DNS yönetimi nerede?]
**Tarih:** 2026-05-07
**Versiyon:** 0.1 — taslak

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

**Karar:** Kullanıcı 2026-05-07'de "tek site rengi konusunda kararsızım, sonradan değiştiririz, sistemi kuralım" dedi. Renk paleti netleştirilene kadar **temporary default** ile gidiyoruz:

| Token | Geçici değer | Notlar |
|-------|--------------|--------|
| Background (dark) | `#0D0D0D` | Antrasit, neredeyse siyah |
| Foreground | `#FAFAFA` | Off-white |
| Aksan / CTA | `#C8102E` | Geçici "erik kırmızısı" — değişecek |
| Card/border | `#1A1A1A` / `#2A2A2A` | Dark mode için |

Renk netleştiğinde `tailwind.config` ve `globals.css` üzerinden tek noktadan değiştirilecek (CSS variable'lar). Bu yüzden tüm component'lerde `bg-background`, `text-foreground`, `bg-primary` gibi semantic class'lar kullanılacak — hard-coded `#C8102E` yok.

### Tipografi [NETLEŞTIRILECEK]

**Hero / Display (önerim):**
- PP Editorial New (Pangram Pangram, paid)
- Söhne (Klim, paid)
- Migra (Pangram Pangram, paid)
- **Ücretsiz alternatif:** Inter Display, Tobias (license), Cormorant Garamond

**Body:**
- Inter veya Geist (ücretsiz, modern, okunabilir)
- TR karakter desteği var (latin-ext)

**Final karar:** Sen lisans almak istemezsen Geist + Inter kombosunu kullanırız (ikisi de zaten Vercel'in ücretsiz fontları, projedede kurulu).

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

### A. Hero'da 3D scroll-driven erik 🌶️ [NETLEŞTIRILECEK]
- React Three Fiber ile 3D model erik
- Scroll'da dönüyor, deforme oluyor, hizmet ikonlarına dönüşüyor
- 3D/2D yetkinliğin canlı kanıtı
- **Risk:** Üretim süresi 1-2 hafta + perf optimizasyonu

**Karar:** Faz 1 MVP'de yapalım mı, Faz 2'ye mi bırakalım?

### B. AI Brief Asistanı (iletişim formunda) [NETLEŞTIRILECEK]
- Müşteri form'u doldururken Claude API live feedback
- "Bütçen X-Y aralığı için şu hizmetler uygun" önerisi
- "Brief'in eksik, bu noktayı netleştir" uyarısı
- AI Kurulumları hizmetinizin canlı demosu
- **Risk:** Claude API maliyeti (~5-15$/ay düşük trafikte)

**Karar:** MVP'de yapalım mı?

### C. Çalışmalar grid'inde hover video preview
- Card hover'da otomatik küçük video oynar (muted, loop)
- AKQA / Buck tarzı

**Karar:** Bu kesin yapılmalı (UX için kritik).

---

## Açık Sorular [NETLEŞTIRILECEK — sıradaki konuşma]

1. **Domain:** kirmizierik.com.tr kayıtlı mı? DNS nerede yönetiliyor? (Cloudflare, Natro, GoDaddy?)
2. **Logo:** Mevcut logo var mı? Vector dosya (SVG/AI) bende olur mu?
3. **Renk paleti:** Erik kırmızısı tonu specific (HEX değeri)? Yoksa benim önerim üzerinde mi gidiyoruz?
4. **Tipografi:** Lisanslı font için bütçe var mı, yoksa Geist + Inter (ücretsiz) ile mi?
5. **Mevcut portfolyo:** İlk 3-5 case study için hangi projeleri kullanacağız? (Novawood, HGR, Muğla Eczacı Odası vb. — hangileri yayına uygun?)
6. **Showreel:** Hazır 60-90 sn'lik bir reel var mı, yoksa montaj edilecek mi?
7. **Hero feature'lar:** 3D erik (A) ve AI Brief Asistanı (B) — Faz 1'de mi Faz 2'de mi?
8. **Stream service:** Cloudflare Stream ($1/1000 dakika izlenme) vs Mux (daha pahalı ama developer-friendly) — hangisi?
9. **Logo dosyaları + marka rehberi:** Sektörel logo kullanımı için kuralın var mı?
10. **Hosting:** Vercel'de mi production, yoksa Türkiye-yerleşik hosting (Hetzner, Turhost) tercih ederiz?

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

## Sıradaki Adımlar

1. Sen bu brief'i oku, eklemek/çıkarmak istediklerini söyle
2. [NETLEŞTIRILECEK] işaretli yerleri tek tek konuşalım (özellikle 1-7 numaralı sorular)
3. Brief v1.0 finalize → ben Supabase şemasını yeniliyorum (eski tabloları silip yeni şemayı uyguluyorum)
4. boilerplate'ten klonluyorum → projeler/kirmizi-erik-website/
5. GitHub repo açıyorum (kirmizi-erik/kirmizi-erik-website)
6. Vercel'e bağlıyorum (preview deploy)
7. Hafta 1 işlerine başlıyorum
