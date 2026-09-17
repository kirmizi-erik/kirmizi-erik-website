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

  return (
    <TrackedContactLink
      channel="whatsapp"
      href={`https://wa.me/${data.contact_phone.replace(/\D/g, "")}`}
      ariaLabel="WhatsApp'tan yaz"
      className="fixed right-7 bottom-28 z-30 inline-flex size-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-black/30 transition-all hover:scale-105 hover:bg-green-600 sm:right-9 sm:bottom-32"
    >
      <WhatsAppIcon className="size-7" />
    </TrackedContactLink>
  );
}
