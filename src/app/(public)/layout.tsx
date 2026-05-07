import { Chatbot } from "@/components/chatbot/chatbot";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const aiAvailable = !!process.env.ANTHROPIC_API_KEY;

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      {aiAvailable ? <Chatbot /> : null}
    </div>
  );
}
