import { Mail, MapPin, Phone } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import { IletisimForm } from "./iletisim-form";

export const metadata = {
  title: "İletişim",
  description:
    "Brief paylaş, fikrini anlat, birlikte yapalım. Sağ alttaki sohbet asistanımız ile hizmetlerimiz hakkında soru sorabilirsin.",
};

export default async function IletisimPage() {
  const supabase = await createClient();
  const { data: s } = await supabase
    .from("site_settings")
    .select("contact_email, contact_phone, contact_address")
    .eq("id", 1)
    .single();

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Sol — başlık + form */}
        <div className="lg:col-span-8">
          <div className="text-muted-foreground inline-flex items-center gap-3 text-xs tracking-widest uppercase">
            <span className="bg-brand size-1.5 rounded-full" />
            İletişim
          </div>
          <h1 className="font-heading mt-5 max-w-[14ch] text-5xl leading-[0.95] font-black tracking-tight sm:text-7xl lg:text-[clamp(3.5rem,7vw,7rem)]">
            Brief
            <br />
            <span className="text-brand">paylaş.</span>
          </h1>
          <p className="text-muted-foreground mt-8 max-w-xl text-base sm:text-lg">
            Fikrini, problemini, hedefini yaz — okuruz, üzerinde konuşuruz. Hızlı
            sorun varsa sağ alttaki <strong>sohbet asistanımıza</strong> da
            sorabilirsin.
          </p>

          <div className="mt-12">
            <IletisimForm />
          </div>
        </div>

        {/* Sağ — direkt iletişim */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
          <div className="border-border/60 rounded-2xl border p-6">
            <h2 className="text-sm font-semibold tracking-wider uppercase">
              Direkt iletişim
            </h2>
            <ul className="mt-5 space-y-4 text-sm">
              {s?.contact_email ? (
                <li>
                  <a
                    href={`mailto:${s.contact_email}`}
                    className="hover:text-brand inline-flex items-start gap-3 transition-colors"
                  >
                    <Mail className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                    <span className="font-medium break-all">{s.contact_email}</span>
                  </a>
                </li>
              ) : null}
              {s?.contact_phone ? (
                <li>
                  <a
                    href={`tel:${s.contact_phone.replace(/\s/g, "")}`}
                    className="hover:text-brand inline-flex items-start gap-3 transition-colors"
                  >
                    <Phone className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                    <span className="font-medium">{s.contact_phone}</span>
                  </a>
                </li>
              ) : null}
              {s?.contact_address ? (
                <li className="text-muted-foreground inline-flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0" />
                  <span>{s.contact_address}</span>
                </li>
              ) : null}
            </ul>

            <p className="text-muted-foreground/80 border-border/40 mt-6 border-t pt-5 text-xs">
              Yanıt süresi: 1-2 iş günü. Acil işler için telefon en hızlı yol.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
