"use server";

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

import { kategoriOptions } from "@/lib/validations/case-study";
import type { AiAnalysis } from "@/lib/validations/lead";

export type AnalyzeInput = {
  ad_soyad: string;
  eposta: string;
  sirket: string;
  hizmet_kategori: string[];
  butce: string;
  brief: string;
};

export type AnalyzeResult =
  | { ok: true; data: AiAnalysis }
  | { ok: false; error: string };

// Hizmet rehberi (system prompt'a embed edilir, sabit kalır → cache hit)
const HIZMET_REFERANS = kategoriOptions
  .map((k) => `- ${k.value}: ${k.label}`)
  .join("\n");

// JSON schema — Claude'un yanıt formatı (skor 0-100, kısa özet, eksikler, önerilen hizmetler)
const AnalysisSchema = z.object({
  skor: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "Brief'in netliği ve uygulanabilirliği skoru. 0-30: çok eksik, 30-60: temel var ama detay az, 60-85: iyi, 85-100: çok detaylı.",
    ),
  ozet: z
    .string()
    .max(280)
    .describe("Brief'in 1-2 cümlelik özeti. Kullanıcıya gösterilir, profesyonel ton."),
  eksikler: z
    .array(z.string().max(140))
    .max(4)
    .describe(
      "Brief'te eksik gördüğün, müşterinin netleştirmesi gereken noktalar. Maksimum 4 madde, her biri kısa cümle.",
    ),
  onerilenHizmetler: z
    .array(
      z.enum(
        kategoriOptions.map((k) => k.value) as [string, ...string[]],
      ),
    )
    .max(5)
    .describe(
      "Brief'in içeriğine göre en uygun olabilecek 1-5 hizmet kategorisi. Kullanıcı bunları formda işaretleyebilecek.",
    ),
});

const SYSTEM_PROMPT = `Sen Kırmızı Erik Reklam Ajansı'nın brief değerlendirme asistanısın. Kırmızı Erik 360° kreatif reklam ajansı; aşağıdaki dokuz hizmeti veriyor:

${HIZMET_REFERANS}

Görevin: Müşterinin yazdığı brief'i değerlendirmek. Şunları yapacaksın:
1. Brief'in netlik ve uygulanabilirlik skorunu 0-100 arası ver. Marka, hedef kitle, bütçe, takvim, ölçülebilir hedef gibi kritik bilgilerin varlığını dikkate al.
2. 1-2 cümlelik özet yaz. Profesyonel, samimi, eleştirel-ama-yapıcı ton. "Sayın" gibi resmi hitap kullanma.
3. Brief'in eksik/net olmayan yönlerini en fazla 4 maddeyle listele. Her madde kısa, eyleme dönük olsun. Örn: "Hedef kitle profili net değil, kim için üretim yapılacak?" gibi.
4. Müşterinin brief'inde tanımlanan ihtiyaca en uygun 1-5 hizmet kategorisini öner. Sadece yukarıdaki listeden seçim yap, slug değerlerini kullan.

Önemli kurallar:
- Türkçe yaz.
- Asla "AI olarak" gibi laflarla başlama. Ajans çalışanı gibi konuş.
- Bütçe çok düşükse veya brief gerçekçi değilse bunu eksik olarak belirt ama nazikçe.
- Müşterinin zaten seçtiği hizmetler varsa onları zaten önerme; tamamlayıcı veya alternatif öner.
- Brief 10 karakterden kısaysa skor düşük olur, eksikler temel bilgi sorularıyla dolar.`;

let _client: Anthropic | null = null;
function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

export async function analyzeBriefAction(input: AnalyzeInput): Promise<AnalyzeResult> {
  const client = getClient();
  if (!client) {
    return {
      ok: false,
      error:
        "AI değerlendirme şu an aktif değil. Brief'i doğrudan gönderebilirsin, ekibimiz manuel inceleyecek.",
    };
  }

  if (!input.brief || input.brief.trim().length < 10) {
    return { ok: false, error: "Brief en az 10 karakter olmalı" };
  }

  // Kullanıcı bilgilerini ve mevcut seçimleri compact formatta hazırla
  const userContext = [
    input.ad_soyad ? `İletişim: ${input.ad_soyad}` : null,
    input.eposta ? `E-posta: ${input.eposta}` : null,
    input.sirket ? `Şirket: ${input.sirket}` : null,
    input.hizmet_kategori.length
      ? `Müşterinin seçtiği hizmetler: ${input.hizmet_kategori.join(", ")}`
      : null,
    input.butce ? `Bütçe aralığı: ${input.butce}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const userMessage = `${userContext ? userContext + "\n\n" : ""}Brief metni:\n${input.brief.trim()}`;

  try {
    const response = await client.messages.parse({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      // System prompt sabit → ephemeral cache (5dk TTL).
      // Stable prefix → sonraki istekte cache_read_input_tokens > 0.
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userMessage }],
      output_config: {
        format: zodOutputFormat(AnalysisSchema),
      },
    });

    const parsed = response.parsed_output;
    if (!parsed) {
      return { ok: false, error: "AI cevabı işlenemedi, lütfen tekrar dene" };
    }

    return {
      ok: true,
      data: {
        skor: Math.round(parsed.skor),
        ozet: parsed.ozet,
        eksikler: parsed.eksikler,
        onerilenHizmetler: parsed.onerilenHizmetler,
      },
    };
  } catch (error) {
    console.error("[analyzeBrief]", error);

    if (error instanceof Anthropic.RateLimitError) {
      return { ok: false, error: "AI yoğun, biraz sonra tekrar dene" };
    }
    if (error instanceof Anthropic.AuthenticationError) {
      return { ok: false, error: "AI servisi yapılandırılamadı" };
    }
    if (error instanceof Anthropic.APIError) {
      return { ok: false, error: `AI hatası (${error.status})` };
    }
    return { ok: false, error: "Beklenmeyen bir hata oldu, lütfen tekrar dene" };
  }
}
