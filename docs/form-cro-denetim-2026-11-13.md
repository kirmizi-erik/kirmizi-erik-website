# Form CRO Denetimi: KE Sitesi (2026-11-13)

Kapsam: sitedeki 4 public form (iletişim, hızlı lead formu, KeScan'deki iki form, chatbot iletişim formu). Kodda değişiklik YAPILMADI. Elimizde dönüşüm verisi yok, bu yüzden etki tahminleri hipotezdir.

| Form                           | Dosya                                                              | Nerede                                                   |
| ------------------------------ | ------------------------------------------------------------------ | -------------------------------------------------------- |
| İletişim                       | `src/app/(public)/iletisim/iletisim-form.tsx`                      | /iletisim                                                |
| Hızlı lead formu               | `src/components/site/quick-lead-form.tsx`                          | hizmet sayfaları + blog yazıları (reklam iniş sayfaları) |
| KeScan "Beni arayın"           | `src/app/(public)/ai-gorunurluk/scan-client.tsx` (NewSiteLeadCard) | tarama sonucu                                            |
| KeScan "Raporu mailime gönder" | aynı dosya (ReportEmailCard)                                       | tarama sonucu                                            |
| Chatbot iletişim               | `src/components/chatbot/chatbot.tsx` (~462-592)                    | AI Brief Asistanı                                        |

## Yüksek öncelik

### 1. KeScan rapor formu dönüşüm olarak sayılmıyor

- **Sorun:** `sendScanReport` `leads` tablosuna kayıt açıyor ve Telegram/e-posta bildirimi gidiyor. Ama başarı sonrası tarayıcıda `trackLead` çağrılmıyor (`scan-client.tsx` ReportEmailCard `if (res.ok) setDone(true)`).
- **Etki:** GA4, Google Ads ve Meta bu lead'leri hiç görmüyor. Raporlar eksik sayıyor, reklam algoritması bu kitleden öğrenemiyor.
- **Çözüm:** `if (res.ok) { trackLead("KeScan Rapor", { email: fd.get("eposta") }); setDone(true); }`.
- **Karar Özkan'da:** Bu form niyeti daha düşük bir "lead mıknatısı". Google Ads'te birincil dönüşüm mü, ikincil mi sayılsın? İkincil seçilirse ayrı bir olay tanımlanır (`trackGaEvent("generate_lead")` + Meta Lead, Ads hariç).

### 2. KVKK kutusu işaretlenmeden buton pasif ve nedeni söylenmiyor (4 form)

- **Sorun:** İletişim, hızlı form ve iki KeScan formunda gönder butonu `disabled={... || !kvkk}`. İletişim formunda kutu butonun **altında** ve sağa yaslı. Kullanıcı tüm alanları doldurup gri butona basıyor, hiçbir şey olmuyor, hiçbir uyarı da çıkmıyor.
- **Etki:** Doldurulmuş formun gönderilmeden bırakılması. Bu dört formdaki en büyük sürtünme bu.
- **Çözüm A (önerilen):** Zorunlu kutuyu kaldır, chatbot formundaki gibi bir bilgilendirme satırı koy: "Göndererek KVKK aydınlatma metnini okuduğunu kabul edersin." Kişi bir talepte bulunup ona yanıt verildiğinde veri işleme açık rızaya değil, sözleşmenin kurulmasına veya meşru menfaate dayanır. Aydınlatma yükümlülüğü bir bildirimle karşılanır. Açık rızayı hizmete şart koşmak da KVKK açısından sorunlu. **Hukuki teyit önerilir.**
- **Çözüm B (kutu kalacaksa):** Kutuyu butonun **üstüne** al. Buton aktif kalsın. Kutu boşken basılınca kutuyu kırmızı çerçeveyle vurgula ve "Devam etmek için KVKK onayını işaretle" yaz.

### 3. Chatbot: iletişim tercihi soruluyor ama iki kanal da zorunlu

- **Sorun:** "Sana nasıl ulaşalım? Telefon / E-posta / İkisi de" seçimi var, ama ad, e-posta ve telefonun **hepsi** zorunlu.
- **Çözüm:** Zorunluluk seçime göre değişsin. Telefon seçilirse e-posta opsiyonel, e-posta seçilirse telefon opsiyonel olsun. Gelişmiş dönüşüm ikisinden birini istiyor, bu yeterli.
- **Yazım hatası:** "Birkaç kısa bilgi **al**, ekibimiz…" cümlesi "Birkaç kısa bilgi **bırak**" olmalı.

## Orta öncelik

### 4. Hızlı form (reklam iniş sayfaları) gereğinden ağır

- 4 zorunlu alan var: ad, telefon, e-posta, mesaj. Alan "Kısaca ne istiyorsun?" diye soruyor ama en az 20 karakter istiyor.
- İletişim formunda telefon opsiyonel, burada zorunlu. Tutarsız.
- Sıra kolaydan zora değil: telefon e-postadan önce geliyor.
- **Öneri:** Sırayı ad → e-posta → telefon → mesaj yap. Mesajın alt sınırını 20'den 10 karaktere indir, ya da metin alanı yerine hizmet/hedef çipleri koy. Telefon zorunluluğunu test et: düşük trafikte A/B yerine önce/sonra karşılaştırması.

### 5. Form terk oranı ölçülmüyor

- Projede `form_start` olayı yok. Kaç kişinin formu açıp bıraktığı bilinmiyor.
- **Öneri:** `analytics.ts`'e `trackFormStart(source)` ekle. İlk alana odaklanınca bir kez tetiklensin (GA4, kaynak bazında). Mevcut `trackLead` ve chat hunisi değişmez.

### 6. Hitap tutarsız ("sen" / "siz")

- Site "sen" diye konuşuyor. Şu yerler "siz" kullanıyor: KeScan formları ("Bilgilerinizi bırakın", "sizi arayalım", "Talebiniz", "e-postanıza"), iletişim formunun başarı mesajı ("Mesajınız bize ulaştı", "ulaşabilirsiniz"), zod hatası ("Geçerli bir e-posta **girin**").
- Dil bilgisi: "Hangi hizmet**lere** ilgileniyorsun?" cümlesi "Hangi hizmet**lerle** ilgileniyorsun?" olmalı.

### 7. Dönüş süresi vaadi her formda farklı

- Hızlı form "aynı gün içinde" diyor, KeScan ve chatbot "en kısa sürede" diyor, iletişim formu hiçbir şey söylemiyor.
- **Öneri:** Özkan'ın gerçekten tutabileceği tek bir vaat seç (ör. "1 iş günü içinde dönüyoruz") ve hem form üstünde hem başarı ekranında aynısını yaz.

### 8. KeScan formlarında görünür etiket yok

- Alanlarda sadece placeholder var ("Ad Soyad", "Telefon"). Yazmaya başlayınca kayboluyor ve ekran okuyucu için de zayıf. Ya görünür etiket ekle ya da en azından `aria-label` ver.

## Düşük öncelik

9. **PhoneInput kuralı:** İletişim ve chatbot formları harf filtresini elle yapıyor. Bu işlevsel olarak doğru, ama kurala göre ortak `PhoneInput` kullanılmalı. Ayrıca iki ayrı `PhoneInput` var (`components/shared/` ve `components/site/`), tek bileşende birleştirilmeli.
10. **Ad soyad doğrulaması** (`lib/validations/lead.ts`): regex `â î û` ve yabancı harfleri (é, ñ, ø) reddediyor. "Hâkan" ya da "José" formu gönderemez. `/^[\p{L}\s'.-]+$/u` kullan.
11. **Buton ve yardımcı metin:** Chatbot'ta "Gönder" yerine "Ekibe ilet" ya da "Bana dönün" kullan. Bütçe seçim kutusunun boş seçeneği "Seçim yapma" yerine "Seçiniz (opsiyonel)" olsun.
12. **Chatbot KVKK satırı 10px**, okunması zor. En az 11-12px olmalı.

> Kapsam dışı ama form güvenliğiyle ilgili: hafızadaki nota göre Upstash prod'da yok, rate limit fail-open çalışıyor. Yani formlar spam korumasız. Ayrı bir iş olarak ele alınmalı.

## Uygulama planı (Özkan onayından sonra)

1. **Hızlı kazanımlar (tek PR, `fix/form-cro-hizli`):** #1, #2 (A veya B kararıyla), #3, #6, #7, #11, #12.
2. **Ölçüm (`feat/form-start-olayi`):** #5. Önce/sonra karşılaştırması için ilk PR'dan **önce** devreye girmesi ideal.
3. **Yapısal (`refactor/phone-input-tek`):** #8, #9, #10.
4. **Test:** #4. Hızlı form değişikliği, #5 en az 2-4 hafta veri topladıktan sonra yapılmalı.

Her PR'dan sonra form preview'da gerçekten doldurulacak. Network sekmesinde `g/collect` (generate_lead) ve `googleadservices` (conversion) isteklerinin gittiği, Telegram bildiriminin de geldiği doğrulanacak.
