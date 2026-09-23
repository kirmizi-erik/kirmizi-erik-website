export const DURUMLAR = [
  { value: "yeni", label: "Yeni" },
  { value: "iletisim", label: "İletişimde" },
  { value: "teklif", label: "Teklif" },
  { value: "kazandi", label: "Kazandı" },
  { value: "kaybetti", label: "Kaybetti" },
] as const;

export const DURUM_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  yeni: "default",
  iletisim: "secondary",
  teklif: "secondary",
  kazandi: "outline",
  kaybetti: "destructive",
};

export type LeadKanal = "chat" | "iletisim";

export const KANALLAR: { value: LeadKanal; label: string }[] = [
  { value: "chat", label: "Chat" },
  { value: "iletisim", label: "İletişim" },
];

// Chatbot formu kaynak'ı "chatbot · ..." ile yazar; diğer tüm site formları
// (iletişim, KeScan, AI tarama) iletişim kanalı sayılır.
export function leadKanal(kaynak: string | null): LeadKanal {
  return kaynak?.startsWith("chatbot") ? "chat" : "iletisim";
}
