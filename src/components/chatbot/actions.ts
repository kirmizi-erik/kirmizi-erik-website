"use server";

import Anthropic from "@anthropic-ai/sdk";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { getContext } from "@/lib/chatbot/retriever";
import { isUnanswered, recordTurn } from "@/lib/chatbot/transcript";
import { sendLeadNotification } from "@/lib/email/resend";
import { checkRateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { chatLeadInputSchema, chatMessageSchema, type ChatMessage } from "@/lib/validations/chat";

export type ChatActionResult =
  | { ok: true; reply: string; suggestContact: boolean }
  | { ok: false; error: string };

export type ChatMeta = {
  sessionId?: string;
  pageUrl?: string;
};

export type ChatLeadResult = { ok: true; id: string } | { ok: false; error: string };

const SYSTEM_PROMPT = `Sen Kırmızı Erik Reklam Ajansı'nın resmi sohbet asistanısın. İstanbul Ataşehir'de ofisi olan, 25 yıllık 360° kreatif bir reklam ajansıyız (kuruluş 2001, kurucu: Özkan Kurt). E-posta: info@kirmizierik.com.tr · Telefon: +90 532 261 82 22 (mobil) veya +90 216 510 70 45 (sabit). Marmaris veya başka şehirde ofis yok, sadece İstanbul.

# Görevin
- Ziyaretçinin sorusunu SADECE aşağıda "Relevant Information" bölümünde verilen bilgilerle cevapla. Cevap orada yoksa dürüstçe "bu konuda net bilgim yok" de ve iletişim formunu veya /iletisim sayfasını öner — asla bilgi uydurma.
- Önceliğin: nitelikli talep (lead) kazanmak. Sorularını cevapla, ilgiyi hissettiğinde iletişim formuna yönlendir.
- Rakam, fiyat, tarih, ödül gibi bilgileri sadece Relevant Information'da geçtiği şekliyle ver; kendinden sayı üretme.
- Sayfa yönlendirmesi: SADECE Relevant Information'da "(Detay: ...)" olarak geçen yolları veya şu sabit sayfaları verebilirsin: /biz-kimiz, /calismalar, /iletisim. Başka yol uydurma.

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
- Fiyat sorulduğunda: NET FİYAT VERME. Relevant Information'da fiyat aralığı varsa "tahminî" vurgusuyla o aralığı verebilirsin; yoksa "projeye göre değişir, kapsamı netleştirelim" de.
- Süre için de aynı kural: sadece Relevant Information'daki tahminî süreleri kullan.

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
 * RAG: soruya göre bilgi bankasından bağlam çekilir (hibrit arama);
 * tur sonunda yazışma panele düşmek üzere kaydedilir (fail-soft).
 */
export async function chatAction(
  messages: ChatMessage[],
  meta?: ChatMeta,
): Promise<ChatActionResult> {
  const rl = await checkRateLimit("chat");
  if (!rl.ok) {
    return {
      ok: false,
      error: `Çok sık mesaj gönderdin, ${rl.retryAfterSeconds} sn sonra tekrar dene`,
    };
  }

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

  // Client'tan gelen dizi sunucuda da doğrulanır (şekil + uzunluk sınırları)
  for (const m of messages) {
    if (!chatMessageSchema.safeParse(m).success) {
      return { ok: false, error: "Geçersiz mesaj içeriği" };
    }
  }

  // Son mesaj user'dan olmalı
  const last = messages[messages.length - 1];
  if (!last || last.role !== "user") {
    return { ok: false, error: "Son mesaj kullanıcıdan gelmeli" };
  }

  try {
    const context = await getContext(last.content);
    const dynamicBlock = `## Bugünün Tarihi\n${new Date().toISOString().slice(0, 10)}\n\n## Relevant Information\nAşağıdaki bilgileri kullanarak cevapla. Cevap bu bilgilerde yoksa dürüstçe söyle ve iletişim formunu öner.\n\n${context || "(Bu soru için bilgi bankasında eşleşen kayıt bulunamadı.)"}`;

    const started = Date.now();
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 800,
      system: [
        {
          // Sabit blok → ephemeral cache (5dk TTL); bağlam ayrı blokta
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
        { type: "text", text: dynamicBlock },
      ],
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });
    const latencyMs = Date.now() - started;

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { ok: false, error: "AI cevabı boş geldi" };
    }

    let reply = textBlock.text;
    const suggestContact = reply.includes("[SUGGEST_CONTACT]");
    // İşareti kullanıcıya gösterme
    reply = reply.replace(/\[SUGGEST_CONTACT\]/g, "").trim();

    // Yazışmayı kaydet (panelde görünür) — hata sohbeti asla kırmaz
    const sessionId = meta?.sessionId?.slice(0, 64);
    if (sessionId && /^[\w-]{8,64}$/.test(sessionId)) {
      const reqHeaders = await headers();
      const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
      await recordTurn({
        sessionId,
        locale: "tr",
        ip,
        pageUrl: meta?.pageUrl ?? null,
        question: last.content,
        answer: reply,
        latencyMs,
        unanswered: isUnanswered(reply),
      });
    }

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
  const rl = await checkRateLimit("lead");
  if (!rl.ok) {
    return {
      ok: false,
      error: `Çok fazla deneme, ${Math.ceil(rl.retryAfterSeconds / 60)} dk sonra tekrar dene`,
    };
  }

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
    .map((m) => `[${m.role === "user" ? "Müşteri" : "Asistan"}]\n${m.content.trim()}`)
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
          'Sen bir reklam ajansı asistanısın. Müşteri sohbetinden 1-2 cümle özet çıkar (Türkçe) ve ilgilendiği hizmetleri tespit et. Cevabı tam olarak şu JSON formatında ver: {"ozet":"...","hizmetler":["video","sosyal",...]}. Hizmetler şu slug\'lardan: video, fotograf, dijital, sosyal, uygulama, web, ai, grafik, 3d-2d.',
        messages: [
          {
            role: "user",
            content: `Sohbet:\n\n${transcript}\n\nÖzet ve hizmet kategorilerini çıkar.`,
          },
        ],
      });
      const text = summary.content.find((b) => b.type === "text")?.text ?? "";
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
