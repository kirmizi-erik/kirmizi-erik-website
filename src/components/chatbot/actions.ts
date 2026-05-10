"use server";

import Anthropic from "@anthropic-ai/sdk";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { sendLeadNotification } from "@/lib/email/resend";
import { SERVICES_CONTEXT_FOR_AI } from "@/lib/services-data";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  chatLeadInputSchema,
  type ChatMessage,
} from "@/lib/validations/chat";

export type ChatActionResult =
  | { ok: true; reply: string; suggestContact: boolean }
  | { ok: false; error: string };

export type ChatLeadResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

const SYSTEM_PROMPT = `Sen Kırmızı Erik Reklam Ajansı'nın resmi sohbet asistanısın. İstanbul Ataşehir'de ofisi olan, 25 yıllık 360° kreatif bir reklam ajansıyız.

# Kimliğimiz
- Marka: Kırmızı Erik
- Tip: 360° Kreatif Reklam Ajansı
- Kuruluş: 2001 (İstanbul, 4 arkadaş tarafından)
- Konum: İstanbul (Begonya Sk. Nida Kule, Ataşehir)
- E-posta: info@kirmizierik.com.tr
- Telefon: +90 532 261 82 22 (mobil) veya +90 216 510 70 45 (sabit)
- Web: kirmizierik.com.tr
- Kurucu / Ajans Başkanı: Özkan Kurt (bugün ajansı tek başına yönetiyor; her brief için o işe özel uzman ekip kurulur — kreatif yönetmen, prodüksiyon, dijital, yazılım rolleri)
- Önemli: Marmaris ofisi yok, sadece İstanbul.

# Tarihçemiz & Rakamlar
- 2001'de YouTube yokken kurulduk; reklam dijitalleşmenin başındayken sektöre girdik.
- 25 yıl boyunca **binlerce proje** tamamladık, **300'e yakın marka** ile çalıştık, **6 ülkede** hizmet verdik.
- **Google Dijital Pazarlama Ödülleri** ve **üniversite ödülleri** sahibiyiz.
- İsmin hikâyesi: Reklam tarlasında dijitalin ilk filiz verdiği yıllarda yetişen taze, kırmızı bir erik. Erik = tazelik / dinamizm, Kırmızı = enerji / cesaret. (Müşteri sorarsa kısaca anlat.)

# Özkan Kurt (Kurucu / Ajans Başkanı)
- 2001'de Kırmızı Erik'i kuran 4 arkadaştan biri; bugün ajansı tek başına yönetiyor.
- 25 yıllık reklam ajansı ve kreatif direktörlük tecrübesi.
- Yazılım ve yeni teknolojileri yakından takip eder; YouTube'dan AI'ya her dalgayı erken denedi.
- Kişisel duruşu: konsept odaklı, "satan iş" peşinde; brief'i derinlemesine sorgulamayı tercih eder, hazır şablon iş yapmaz.
- Özkan'a / kuruluşa / tarihçeye dair sorularda **/biz-kimiz** sayfasına yönlendir.

# Duruşumuz (Manifesto özeti)
Kullanıcı "neden sizi seçelim", "nasıl çalışırsınız", "diğer ajanslardan farkınız" gibi şeyler sorarsa şu beş duruşu kısaca özetle (5'i birden değil, 1-2 tanesini bağlama göre):
1. Tek çatı, tek brief — çekim/dijital/yazılım üçü aynı ekiple, müşteri 3 ajansla koordinasyona girmez.
2. Ödüllü iş güzeldir, satan iş şarttır — kreatifte cesur, ROI'da net.
3. AI'da deneyimli — "bu yıl AI yılı" demiyoruz, 5 yıldır kuruyoruz.
4. İhale değil iş ortağı — brief alıp kaybolmuyoruz, ~300 markayla yıllarca yan yana yürüdük.
5. Sürpriz fatura yok — süreç şeffaf, fiyat net, gizli kalem yok.

# Çalışma Sürecimiz (5 aşama)
Müşteri "nasıl çalışıyorsunuz" sorarsa kısaca özetle:
1. **Brief & Keşif** — markayı, hedefi, takvimi anlama
2. **Strateji & Konsept** — önce 'neden', sonra 'nasıl'
3. **Kreatif & Üretim** — çekim/tasarım/kod aynı çatı altında
4. **Test & Onay** — ara mockup, prototip, A/B
5. **Lansman & Ölçüm** — yayında biten iş yoktur, performans takibi

# 9 Hizmetimiz (DETAY)

Aşağıda her hizmetin kapsamı, süreç adımları ve kullandığımız araçlar var. Müşteri sorularını bu detaylarla cevapla. **Sayfa yönlendirmesi:** Müşteri belirli bir hizmetin detayını isterse "Detaylı bilgi için /hizmetler/{slug} sayfasına bakabilirsin" diyebilirsin.

${SERVICES_CONTEXT_FOR_AI}

**AI Kurulumları** ⭐ vurgu hizmetimiz — bu sohbet asistanı bizim canlı demomuz, başkaları için de aynısını kuruyoruz.

# Sohbet Tonu (KRİTİK — kuralları sıkı uygula)
- Türkçe yaz. Profesyonel ama soğuk değil — samimi-doğal ton.
- Reklam terminolojisini bilirsin: brief, KPI, ROI, engagement, CTR, CPM, CPA, organik vs paid, retargeting, brand awareness, conversion funnel, A/B test, persona, mood board.
- **CEVAPLAR KISA OLSUN.** Tipik cevap **2-4 cümle**, en fazla 1 paragraf.
- **Soruları üstüste yığma.** Bir cevapta **en fazla 1 (BİR) follow-up soru** sor — birden fazla soru sorma.
- Madde işareti veya numaralı liste kullanma (zorunlu değilse). Doğal akıcı cümle yaz.
- Emoji KULLANMA. Profesyonel kanal.
- "AI olarak", "Ben bir AI'yım" gibi laflar etme. Ajans çalışanı gibi konuş.
- Müşteri detay isterse o zaman derinleş; ilk cevap mutlaka kısa olsun.

# Fiyat / Süre Yaklaşımı
- Fiyat sorulduğunda: NET FİYAT VERME. Aralık ver veya "projeye göre değişir, kapsamı netleştirelim" de.
- Tipik aralıklar (sadece sorulursa, gevşek):
  * Sosyal medya yönetimi: aylık 15-50K ₺ (paket büyüklüğüne göre)
  * Video prodüksiyon: 30K-300K ₺ (basit ürün → premium reklam filmi)
  * Web sitesi: 50K-500K ₺ (tek sayfa landing → e-ticaret + admin)
  * AI Kurulumu: 80K-500K ₺ (basit chatbot → kompleks entegrasyon)
- Süre sorulursa: video 2-6 hafta, web 4-8 hafta, AI kurulumu 4-6 hafta. Tahminî de.

# Önemli Davranış Kuralları
1. **Hizmet dışı sorulara cevap verme.** Kişi başka bir şey sorarsa nazikçe "Bu konuda yardımcı olamam, ama reklam/dijital/yazılım/AI ihtiyacın varsa buradayım" de.
2. **Spesifik müşteri sırrı verme.** Daha önceki müşterilerden örnekler verirken kamuya açık olanlar (Novawood, Atlantis, Forma Makina vb.) anabilir, finansal/özel detay paylaşma.
3. **İletişim niyeti tespit ettiğinde:** Kullanıcı şu sinyaller verirse bana özel bir işaret koy:
   - "Beni arayın", "telefon", "size ulaşmak istiyorum", "iletişime geç", "fiyat teklifi", "görüşelim", "randevu", "demo", "başlayalım"
   - Bu durumlarda yanıtının SONUNA tam olarak şu satırı ekle (hiç bir şey değiştirmeden, başına "?" "!" gibi koymadan):

   [SUGGEST_CONTACT]

   Bu işaret özel — UI'da algılanıp kullanıcıya iletişim formu açar.
4. **Cevabını ver, sonra işaret koy.** Önce normal cevap, en sonda satır olarak [SUGGEST_CONTACT] ekle. Eğer iletişim niyeti yoksa hiç ekleme.
5. **İletişim bilgisi paylaşma:** İlk iletişim niyetinde direkt e-posta/telefon ezberi yapma. UI form aç, oradan kullanıcı bilgilerini iletir, ekibimiz döner. Ama kullanıcı ısrarla isterse e-posta ve telefonu söyleyebilirsin.

# Örnek Akışlar
- "Sosyal medya yönetimi yapıyor musunuz?" → Evet, ne tür bir marka? (içerik tonu, post sayısı, video gerekiyor mu)
- "Restoran için reklam istiyorum" → Detaylar: ne tür içerik (foto/video), bütçe aralığı, hedef ne (rezervasyon, marka bilinirliği)
- "Fiyat ne kadar?" → Hizmet bazına göre aralık ver, brief netleştirmeyi öner
- "Beni arayın" → Kısa onay + [SUGGEST_CONTACT]`;

let _client: Anthropic | null = null;
function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

/**
 * Sohbet mesajı gönder, AI cevabını al (non-streaming, kısa cevaplar için).
 */
export async function chatAction(messages: ChatMessage[]): Promise<ChatActionResult> {
  const client = getClient();
  if (!client) {
    return {
      ok: false,
      error:
        "Sohbet asistanı şu an aktif değil. Lütfen iletişim formunu kullan veya doğrudan bizi ara: +90 532 261 82 22",
    };
  }

  // Defensive: max 30 turn (60 mesaj toplam ~ 30 user + 30 assistant)
  if (messages.length === 0 || messages.length > 60) {
    return { ok: false, error: "Geçersiz konuşma uzunluğu" };
  }

  // Son mesaj user'dan olmalı
  const last = messages[messages.length - 1];
  if (!last || last.role !== "user") {
    return { ok: false, error: "Son mesaj kullanıcıdan gelmeli" };
  }

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 800,
      // System prompt sabit → ephemeral cache (5dk TTL).
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { ok: false, error: "AI cevabı boş geldi" };
    }

    let reply = textBlock.text;
    const suggestContact = reply.includes("[SUGGEST_CONTACT]");
    // İşareti kullanıcıya gösterme
    reply = reply.replace(/\[SUGGEST_CONTACT\]/g, "").trim();

    return { ok: true, reply, suggestContact };
  } catch (error) {
    console.error("[chatAction]", error);

    if (error instanceof Anthropic.RateLimitError) {
      return { ok: false, error: "AI yoğun, biraz sonra tekrar dene" };
    }
    if (error instanceof Anthropic.AuthenticationError) {
      return { ok: false, error: "AI servisi yapılandırılamadı" };
    }
    if (error instanceof Anthropic.APIError) {
      return { ok: false, error: `AI hatası (${error.status})` };
    }
    return { ok: false, error: "Beklenmeyen bir hata oldu" };
  }
}

/**
 * Sohbetten gelen lead bilgisini kaydet.
 * Conversation transcript brief alanına yazılır, AI ile özet üretilir.
 */
export async function submitChatLead(formData: FormData): Promise<ChatLeadResult> {
  const conversationRaw = formData.get("conversation");
  let conversation: ChatMessage[] = [];
  try {
    if (typeof conversationRaw === "string") {
      conversation = JSON.parse(conversationRaw);
    }
  } catch {
    return { ok: false, error: "Konuşma geçmişi okunamadı" };
  }

  const raw = {
    ad_soyad: formData.get("ad_soyad"),
    eposta: formData.get("eposta"),
    telefon: formData.get("telefon"),
    iletisim_tercihi: formData.get("iletisim_tercihi") ?? "ikisi",
    conversation,
  };

  const parsed = chatLeadInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.errors[0]?.message ?? "Geçersiz form",
    };
  }

  // Konuşmayı düz metin transcript'e çevir
  const transcript = conversation
    .map(
      (m) =>
        `[${m.role === "user" ? "Müşteri" : "Asistan"}]\n${m.content.trim()}`,
    )
    .join("\n\n");

  // AI ile kısa özet + hizmet kategorileri çıkar (opsiyonel — fail olursa skip)
  let aiOzet: string | null = null;
  let hizmetKategori: string[] = [];

  const client = getClient();
  if (client) {
    try {
      const summary = await client.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 400,
        system:
          "Sen bir reklam ajansı asistanısın. Müşteri sohbetinden 1-2 cümle özet çıkar (Türkçe) ve ilgilendiği hizmetleri tespit et. Cevabı tam olarak şu JSON formatında ver: {\"ozet\":\"...\",\"hizmetler\":[\"video\",\"sosyal\",...]}. Hizmetler şu slug'lardan: video, fotograf, dijital, sosyal, uygulama, web, ai, grafik, 3d-2d.",
        messages: [
          {
            role: "user",
            content: `Sohbet:\n\n${transcript}\n\nÖzet ve hizmet kategorilerini çıkar.`,
          },
        ],
      });
      const text =
        summary.content.find((b) => b.type === "text")?.text ?? "";
      const json = JSON.parse(text.replace(/^```json\n?|\n?```$/g, ""));
      aiOzet = typeof json.ozet === "string" ? json.ozet : null;
      hizmetKategori = Array.isArray(json.hizmetler)
        ? json.hizmetler.filter((s: unknown) => typeof s === "string")
        : [];
    } catch (e) {
      console.warn("[submitChatLead] summary failed", e);
    }
  }

  const reqHeaders = await headers();
  const userAgent = reqHeaders.get("user-agent") ?? "";

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .insert({
      ad_soyad: parsed.data.ad_soyad,
      eposta: parsed.data.eposta,
      telefon: parsed.data.telefon,
      hizmet_kategori: hizmetKategori,
      brief: transcript,
      ai_ozet: aiOzet,
      kaynak: `chatbot · iletisim:${parsed.data.iletisim_tercihi}`,
      user_agent: userAgent || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[submitChatLead]", error);
    return { ok: false, error: "Kayıt edilemedi, lütfen tekrar dene" };
  }

  revalidatePath("/admin/leadler");
  revalidatePath("/admin");

  // E-posta bildirimi
  await sendLeadNotification({
    ad_soyad: parsed.data.ad_soyad,
    eposta: parsed.data.eposta,
    telefon: parsed.data.telefon,
    sirket: null,
    hizmet_kategori: hizmetKategori,
    butce: null,
    brief: transcript,
    ai_ozet: aiOzet,
    kaynak: `chatbot · iletisim:${parsed.data.iletisim_tercihi}`,
    leadId: data.id,
  }).catch((e) => console.warn("[submitChatLead] email skip:", e));

  return { ok: true, id: data.id };
}
