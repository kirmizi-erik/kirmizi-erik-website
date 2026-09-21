import { ChatbotLazy } from "@/components/chatbot/chatbot-lazy";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { WhatsAppFloat } from "@/components/site/whatsapp-float";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const aiAvailable = !!process.env.ANTHROPIC_API_KEY;

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <WhatsAppFloat />
      {aiAvailable ? <ChatbotLazy /> : null}
    </div>
  );
}
