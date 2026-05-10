import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { CookieConsent } from "@/components/site/cookie-consent";
import { GoogleAnalyticsWithConsent } from "@/components/site/google-analytics-with-consent";
import { Toaster } from "@/components/ui/sonner";
import {
  jsonLdScript,
  localBusinessSchema,
  organizationSchema,
  websiteSchema,
} from "@/lib/schema";

import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-B3QHXZ1XL5";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Kırmızı Erik — 360° Kreatif Reklam Ajansı",
    template: "%s · Kırmızı Erik",
  },
  description:
    "Bir fikir, dokuz hizmet, sıfır sınır. Video, fotoğraf, dijital pazarlama, sosyal medya, web/uygulama, AI kurulumları, grafik ve 3D — 25 yıllık birikim, 300'e yakın marka.",
  keywords: [
    "reklam ajansı",
    "kreatif ajans",
    "video prodüksiyon",
    "dijital pazarlama",
    "sosyal medya yönetimi",
    "AI kurulumları",
    "web tasarım",
    "uygulama geliştirme",
    "grafik tasarım",
    "İstanbul reklam ajansı",
    "Kırmızı Erik",
  ],
  authors: [{ name: "Kırmızı Erik Reklam Ajansı" }],
  creator: "Kırmızı Erik",
  publisher: "Kırmızı Erik",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Kırmızı Erik",
    title: "Kırmızı Erik — 360° Kreatif Reklam Ajansı",
    description:
      "Bir fikir, dokuz hizmet, sıfır sınır. 25 yıllık birikim, 300'e yakın marka.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kırmızı Erik — 360° Kreatif Reklam Ajansı",
    description:
      "Bir fikir, dokuz hizmet, sıfır sınır. 25 yıllık birikim, 300'e yakın marka.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(organizationSchema)}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(localBusinessSchema)}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(websiteSchema)}
        />
      </head>
      <body className="bg-background text-foreground flex min-h-full flex-col">
        {children}
        <Toaster richColors closeButton position="top-right" />
        <CookieConsent />
        {GA_ID ? <GoogleAnalyticsWithConsent gaId={GA_ID} /> : null}
      </body>
    </html>
  );
}
