import { TrackedContactLink, WhatsAppIcon } from "@/components/site/contact-links";
import { createClient } from "@/lib/supabase/server";

export async function WhatsAppFloat() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("contact_phone")
    .eq("id", 1)
    .single();
  if (!data?.contact_phone) return null;

  // Sağ kenarda AI Asistan sekmesinin hemen altı; alt köşedeki çerez bandıyla çakışmaz
  return (
    <div className="fixed right-0 z-40" style={{ top: "calc(50% + 73px)" }}>
      <TrackedContactLink
        channel="whatsapp"
        href={`https://wa.me/${data.contact_phone.replace(/\D/g, "")}`}
        ariaLabel="WhatsApp'tan yaz"
        className="inline-flex items-center justify-center rounded-l-xl bg-green-500 py-3 pr-2 pl-2.5 text-white shadow-lg shadow-black/30 transition-all hover:bg-green-600 hover:pr-3"
      >
        <WhatsAppIcon className="size-6" />
      </TrackedContactLink>
    </div>
  );
}
