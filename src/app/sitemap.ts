import type { MetadataRoute } from "next";

import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600; // 1 saat

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kirmizierik.com.tr";
  const now = new Date();

  // Statik sayfalar
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    {
      url: `${baseUrl}/calismalar`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/hizmetler/ai-kurulumlari`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/iletisim`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Dinamik: yayında olan tüm case study'ler
  try {
    const supabase = await createClient();
    const { data: cases } = await supabase
      .from("case_studies")
      .select("slug, updated_at, yayin_tarihi")
      .eq("durum", "yayinda")
      .order("yayin_tarihi", { ascending: false });

    const caseRoutes: MetadataRoute.Sitemap = (cases ?? []).map((c) => ({
      url: `${baseUrl}/calismalar/${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : now,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

    return [...staticRoutes, ...caseRoutes];
  } catch (error) {
    console.error("[sitemap]", error);
    return staticRoutes;
  }
}
