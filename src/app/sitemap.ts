import type { MetadataRoute } from "next";

import { hizmetler } from "@/lib/site-data";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600; // 1 saat

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kirmizierik.com.tr";
  const now = new Date();

  // Statik public sayfalar
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/biz-kimiz`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/calismalar`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/hizmetler`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/iletisim`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/gizlilik`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/kvkk`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // 9 hizmet detay sayfası
  const hizmetRoutes: MetadataRoute.Sitemap = hizmetler.map((h) => ({
    url: `${baseUrl}/hizmetler/${h.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: h.aktif ? 0.7 : 0.4,
  }));

  // Yayında olan tüm case study'ler
  let caseRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createClient();
    const { data: cases } = await supabase
      .from("case_studies")
      .select("slug, updated_at, yayin_tarihi")
      .eq("durum", "yayinda")
      .order("yayin_tarihi", { ascending: false });

    caseRoutes = (cases ?? []).map((c) => ({
      url: `${baseUrl}/calismalar/${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error("[sitemap]", error);
  }

  return [...staticRoutes, ...hizmetRoutes, ...caseRoutes];
}
