import Image from "next/image";
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
    <article>
      {/* Hero — banner görsel + text overlay (üst), subtitle (alt) */}
      <header>
        {/* Üst banner — kırmızı sinyal/iletişim hattı, sol-altta rozet + başlık */}
        <div className="relative h-56 w-full overflow-hidden sm:h-72 lg:h-96">
          <Image
            src="/hero/iletisim-hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="from-background/0 via-background/30 to-background absolute inset-0 bg-gradient-to-b" />
          <div className="from-background/70 absolute inset-0 bg-gradient-to-r via-transparent to-transparent" />

          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-screen-2xl px-4 pb-6 sm:px-6 lg:px-10 lg:pb-8">
              <div className="text-muted-foreground inline-flex items-center gap-3 text-xs tracking-widest uppercase">
                <span className="bg-brand size-1.5 rounded-full" />
                İletişim
              </div>
              <h1 className="font-heading mt-3 max-w-4xl text-4xl leading-[0.95] font-black tracking-tight break-words sm:text-5xl lg:text-6xl">
                Brief paylaş<span className="text-brand">.</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Banner altı — subtitle paragraf */}
        <div className="border-border/40 mx-auto max-w-screen-2xl border-b px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <p className="text-muted-foreground max-w-2xl text-base sm:text-lg">
            Fikrini, problemini, hedefini yaz — okuruz, üzerinde konuşuruz.
            Hızlı sorun varsa sağ alttaki <strong>sohbet asistanımıza</strong>{" "}
            da sorabilirsin.
          </p>
        </div>
      </header>

      {/* Form + direkt iletişim — açık BG */}
      <div className="bg-muted">
        <section className="mx-auto max-w-screen-2xl px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-12 xl:gap-16">
            {/* Sol — form */}
            <div className="min-w-0 lg:col-span-8">
              <IletisimForm />
            </div>

            {/* Sağ — direkt iletişim */}
            <aside className="min-w-0 lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
              <div className="border-border/60 bg-background rounded-2xl border p-6">
                <h2 className="text-sm font-semibold tracking-wider uppercase">
                  Direkt iletişim
                </h2>
                <ul className="mt-5 space-y-4 text-sm">
                  {s?.contact_email ? (
                    <li>
                      <a
                        href={`mailto:${s.contact_email}`}
                        className="hover:text-brand flex items-start gap-3 transition-colors"
                      >
                        <Mail className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                        <span className="min-w-0 font-medium break-all">{s.contact_email}</span>
                      </a>
                    </li>
                  ) : null}
                  {s?.contact_phone ? (
                    <li>
                      <a
                        href={`tel:${s.contact_phone.replace(/\s/g, "")}`}
                        className="hover:text-brand flex items-start gap-3 transition-colors"
                      >
                        <Phone className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                        <span className="font-medium">{s.contact_phone}</span>
                      </a>
                    </li>
                  ) : null}
                  {s?.contact_address ? (
                    <li className="text-muted-foreground flex items-start gap-3">
                      <MapPin className="mt-0.5 size-4 shrink-0" />
                      <span className="min-w-0">{s.contact_address}</span>
                    </li>
                  ) : null}
                </ul>

                <p className="text-muted-foreground/80 border-border/40 mt-6 border-t pt-5 text-xs">
                  Yanıt süresi: 1-2 iş günü. Acil işler için telefon en hızlı yol.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </article>
  );
}
