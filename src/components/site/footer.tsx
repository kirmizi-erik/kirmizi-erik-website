import Image from "next/image";
import Link from "next/link";
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from "lucide-react";

import { hizmetler, siteConfig } from "@/lib/site-data";
import { createClient } from "@/lib/supabase/server";

const yil = new Date().getFullYear();

// Twitter/X icon (lucide-react'ta yeni adıyla yok, inline SVG)
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

async function getSettings() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("contact_email, contact_phone, contact_address, social, kvkk_text")
    .eq("id", 1)
    .single();
  return data;
}

export async function SiteFooter() {
  const s = await getSettings();
  const social = (s?.social ?? {}) as Record<string, string>;

  const aktifHizmetler = hizmetler.filter((h) => h.aktif);
  const pasifHizmetler = hizmetler.filter((h) => !h.aktif);

  return (
    <footer className="border-border/60 border-t">
      <div className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-10">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Sol blok — marka */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/logo/Logo-beyaz.png"
                alt={siteConfig.name}
                width={179}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-muted-foreground mt-4 max-w-md text-sm leading-relaxed">
              {siteConfig.description}
            </p>

            <div className="mt-6 flex items-center gap-3">
              {social.instagram ? (
                <a
                  href={social.instagram}
                  aria-label="Instagram"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground border-border hover:border-foreground/40 inline-flex size-9 items-center justify-center rounded-full border transition-colors"
                >
                  <Instagram className="size-4" />
                </a>
              ) : null}
              {social.twitter ? (
                <a
                  href={social.twitter}
                  aria-label="X (Twitter)"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground border-border hover:border-foreground/40 inline-flex size-9 items-center justify-center rounded-full border transition-colors"
                >
                  <XIcon className="size-3.5" />
                </a>
              ) : null}
              {social.facebook ? (
                <a
                  href={social.facebook}
                  aria-label="Facebook"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground border-border hover:border-foreground/40 inline-flex size-9 items-center justify-center rounded-full border transition-colors"
                >
                  <Facebook className="size-4" />
                </a>
              ) : null}
              {social.youtube ? (
                <a
                  href={social.youtube}
                  aria-label="YouTube"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground border-border hover:border-foreground/40 inline-flex size-9 items-center justify-center rounded-full border transition-colors"
                >
                  <Youtube className="size-4" />
                </a>
              ) : null}
            </div>
          </div>

          {/* Hizmetler */}
          <div className="md:col-span-3">
            <h3 className="text-sm font-semibold tracking-wide uppercase">
              Hizmetler
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {aktifHizmetler.map((h) => (
                <li key={h.slug}>
                  <Link
                    href={`/hizmetler/${h.slug}`}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {h.label}
                  </Link>
                </li>
              ))}
              {pasifHizmetler.map((h) => (
                <li key={h.slug} className="text-muted-foreground/60 text-sm">
                  {h.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Yasal & Şirket */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold tracking-wide uppercase">
              Şirket
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/biz-kimiz"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Biz Kimiz
                </Link>
              </li>
              <li>
                <Link
                  href="/calismalar"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Çalışmalar
                </Link>
              </li>
              <li>
                <Link
                  href="/iletisim"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  İletişim
                </Link>
              </li>
              <li className="border-border/40 mt-3 border-t pt-3">
                <Link
                  href="/kvkk"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  KVKK
                </Link>
              </li>
              <li>
                <Link
                  href="/gizlilik"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Gizlilik
                </Link>
              </li>
            </ul>
          </div>

          {/* İletişim */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold tracking-wide uppercase">
              İletişim
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {s?.contact_email ? (
                <li>
                  <a
                    href={`mailto:${s.contact_email}`}
                    className="text-muted-foreground hover:text-foreground inline-flex items-start gap-2.5 transition-colors"
                  >
                    <Mail className="mt-0.5 size-4 shrink-0" />
                    <span>{s.contact_email}</span>
                  </a>
                </li>
              ) : null}
              {s?.contact_phone ? (
                <li>
                  <a
                    href={`tel:${s.contact_phone.replace(/\s/g, "")}`}
                    className="text-muted-foreground hover:text-foreground inline-flex items-start gap-2.5 transition-colors"
                  >
                    <Phone className="mt-0.5 size-4 shrink-0" />
                    <span>{s.contact_phone}</span>
                  </a>
                </li>
              ) : null}
              {s?.contact_address ? (
                <li className="text-muted-foreground inline-flex items-start gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0" />
                  <span>{s.contact_address}</span>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        {/* Alt çizgi — copyright */}
        <div className="border-border/60 mt-12 border-t pt-8">
          <p className="text-muted-foreground text-xs">
            © {yil} {siteConfig.name}. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
