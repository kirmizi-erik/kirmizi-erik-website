import { Mail, MapPin, Phone } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "İletişim",
  description: "Brief paylaş, fikrini anlat, birlikte yapalım.",
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
      <div className="grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
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
            Fikrini, problemini, hedefini yaz — biz okuruz, birlikte üzerinde
            konuşalım. AI destekli brief asistanı Faz 1 son haftasında bu
            sayfaya geliyor; o zamana kadar e-posta veya telefon en hızlı yol.
          </p>
        </div>

        <aside className="lg:col-span-5">
          <div className="border-border/60 rounded-2xl border p-7">
            <h2 className="text-sm font-semibold tracking-wide uppercase">
              Direkt iletişim
            </h2>
            <ul className="mt-6 space-y-5 text-sm">
              {s?.contact_email ? (
                <li>
                  <a
                    href={`mailto:${s.contact_email}`}
                    className="hover:text-brand inline-flex items-start gap-3 transition-colors"
                  >
                    <Mail className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                    <span className="font-medium">{s.contact_email}</span>
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
          </div>
        </aside>
      </div>
    </div>
  );
}
