# Lansman Planlaması — Kırmızı Erik Web Sitesi

MVP tamam, lansmana hazırlanıyoruz. Bu doküman lansman öncesi son kararları + sırayı netleştirir.

## Şu an durum (2026-05-07)

**Tamamlandı:**
- Sistem altyapı + GitHub repo + Supabase
- Site: anasayfa, çalışmalar liste/detay, AI Kurulumları sayfa, iletişim formu
- AI Brief Asistanı (Claude Haiku 4.5)
- Admin paneli: case CRUD + lead yönetimi + site ayarları + hero düzenleme
- SEO: robots.txt + sitemap.xml + dinamik OG image
- 1 case study (Novawood Showreel ENG) yayında

**Pending — lansman için kritik:**
1. Hosting kararı (3 alternatif)
2. Domain DNS bağlantısı (kirmizierik.com.tr → hosting)
3. İlk 5-10 case study içeriği (eski siteden referansla)
4. Renk paleti onayı (logo'dan tahminden gerçek HEX'lere)

**Pending — opsiyonel/ertelenebilir:**
- Hero arkaplan videosu (şimdi animasyonlu gradient)
- 3D scroll-driven erik animasyonu (Faz 2)
- Türkçe + İngilizce dil desteği (next-intl, Faz 2)
- Resend e-posta bildirimi (lead geldiğinde admin'e e-posta) — Faz 2
- Google Analytics / Vercel Analytics integration

---

## Hosting kararı — 3 alternatif

### A) Vercel (önerilen, hızlı + Next.js'e tam destek)

**Setup süresi:** 30 dakika
**Maliyet:** Hobby plan FREE, sonra $20/ay (Pro) gerekiyorsa
**Avantaj:**
- 5 dakikada deploy (GitHub repo bağla → push attığında auto deploy)
- Edge CDN (Türkiye'den hızlı)
- Vercel Analytics ücretsiz
- Otomatik SSL (Let's Encrypt)
- Preview deploy her PR'da
- Server Actions, Edge runtime, OG image generator hepsi destekli

**Dezavantaj:**
- Vendor lock — ileride ayrılmak istenirse migrate gerek (ama Next.js standalone build aldığı için zor değil)

**Adımlar:**
1. vercel.com → "Continue with GitHub" (kurtozkann hesabıyla)
2. Import repo: `kirmizi-erik/kirmizi-erik-website`
3. Framework: Next.js (otomatik tespit)
4. Environment variables (`.env.local`'deki üç key'i kopyala):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (Production + Preview, Development değil)
   - `NEXT_PUBLIC_SITE_URL=https://kirmizierik.com.tr`
   - `ANTHROPIC_API_KEY` (Production + Preview)
5. Deploy → preview URL alırsın (`kirmizi-erik-website-xxx.vercel.app`)
6. Custom domain: Project Settings → Domains → "Add Domain" → kirmizierik.com.tr
7. Vercel sana DNS kayıtları verir (A record veya CNAME)
8. Alastyr cPanel → DNS Manager → Vercel'in verdiği değerleri ekle
9. SSL otomatik ayarlanır

### B) Alastyr Cloud Server / VPS

**Setup süresi:** 2-3 saat (DevOps)
**Maliyet:** ~$10-30/ay (paket'e göre)
**Avantaj:**
- Tek vendor, yerleşik destek
- Tam kontrol (SSH/root)

**Dezavantaj:**
- DevOps yükü: Node.js + PM2 + Nginx kurulumu, SSL/Let's Encrypt, deploy scripti yazma, backup, monitoring
- GitHub Actions ile auto deploy yazılması gerek
- Düşük trafik için over-engineering

### C) Static Export

**Setup süresi:** 1 saat (refactor + deploy)
**Maliyet:** Mevcut Linux Bayi Hosting (yeni masraf yok)
**Avantaj:**
- Mevcut paketinizde çalışır

**Dezavantaj — büyük:**
- AI Brief Asistanı **çalışmaz** (Server Actions gerekiyor)
- Admin paneli auth **çalışmaz** (Supabase SSR cookie'si Server Actions kullanır)
- Dinamik case study route'u (`/calismalar/[slug]`) için `generateStaticParams` ile build-time render gerekir, her case eklemede rebuild lazım
- Hover video preview, lead form submit hepsi ya pek çalışır ya hiç çalışmaz

**Karar:** Brief'imizdeki AI Brief Asistanı star feature olduğu için bu yol önerilmez.

---

## Önerilen rota: Vercel + Alastyr DNS

1. Domain Alastyr'da kayıtlı kalır (mevcut)
2. Hosting Vercel'e deploy edilir (FREE)
3. DNS Alastyr cPanel'den Vercel'e işaret eder

Maliyet: $0/ay (Hobby plan + $20 bir kerelik Anthropic kredisi).

---

## Sıralı lansman akışı

### Aşama 1 — Vercel deploy (1 saat)
1. Vercel hesap oluştur, repo bağla, env'leri aktar
2. Preview deploy → tüm sayfaları preview URL'de test et
3. Production'a promote

### Aşama 2 — Custom domain (DNS yayılma süresi 1-24 saat)
1. Vercel Project → Domains → Add `kirmizierik.com.tr` ve `www.kirmizierik.com.tr`
2. Vercel'in verdiği A record veya CNAME değerlerini kopyala
3. Alastyr cPanel → DNS Zone Editor → mevcut A kayıtlarını güncelle
4. SSL otomatik provisione olur (5-15 dakika)
5. Tarayıcıda https://kirmizierik.com.tr açıldığını doğrula

### Aşama 3 — Renk paleti onayı (15 dakika)
1. Tarayıcıda site'i gez, renkleri gerçekte gör
2. Erik kırmızısı / mor net olarak şu mu olsun, yoksa farklı tonlar mı?
3. Onay sonrası `globals.css` CSS variables tek noktadan güncellenir

### Aşama 4 — İlk case study'ler (1-3 gün, içerikten bağımlı)
Eski siteden gelen 13 iş listesinden başlangıçta **5 case** seç:
- Novawood Showreel (zaten var)
- Forma Makina A.Ş. — Tanıtım Filmi
- Azar Türkiye — Reklam Filmi
- Kemal Özcan — Müzik Klibi
- Sözer A.Ş. — Tanıtım Filmi

Her case için:
- YouTube URL
- 1 paragraf "Problem"
- 1 paragraf "Çözüm"
- 1-2 cümle "Sonuç"
- 1-2 metrik (varsa)
- Galeri görseli (3-5 adet)

İçeriği sen yazarsın, ben admin'den ekleyebilir miyim diye yardım edebilirim.

### Aşama 5 — Lansman duyurusu (lansman günü)
- Sosyal medya (Instagram, LinkedIn, X, Facebook)
- Mevcut müşterilere e-posta
- Eski sayfanın replace edildi mesajı

---

## Kararlar (sen onaylayacaksın)

| # | Karar | Önerilen | Notlar |
|---|-------|----------|--------|
| 1 | Hosting | Vercel + Alastyr DNS | $0/ay, 30dk setup |
| 2 | Lansman tarihi | ? | Domain yayıldıktan + 5 case eklendikten sonra |
| 3 | Renk paleti final | Logo'dan tahmin | Veya farklı tonlar netleşir |
| 4 | İlk case sayısı | 5 case | Sonra haftada 1-2 ekleme |
| 5 | E-posta bildirimi | Faz 2 | Lansmandan sonra Resend ekle |
| 6 | Google Analytics | Lansmanda | gtag tag ekle |
