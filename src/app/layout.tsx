import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

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
    default: "Kırmızı Erik — Reklam Ajansı",
    template: "%s · Kırmızı Erik",
  },
  description:
    "Video, fotoğraf, dijital pazarlama, sosyal medya, web/uygulama yazılımı, AI kurulumları, grafik ve 3D/2D — dokuz disiplin tek çatı altında.",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Kırmızı Erik",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="bg-background text-foreground flex min-h-full flex-col">
        {children}
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
