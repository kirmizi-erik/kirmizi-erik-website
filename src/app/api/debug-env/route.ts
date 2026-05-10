import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const env = {
    GOOGLE_OAUTH_CLIENT_ID: {
      present: Boolean(process.env.GOOGLE_OAUTH_CLIENT_ID),
      length: process.env.GOOGLE_OAUTH_CLIENT_ID?.length ?? 0,
      starts: process.env.GOOGLE_OAUTH_CLIENT_ID?.slice(0, 10) ?? "",
    },
    GOOGLE_OAUTH_CLIENT_SECRET: {
      present: Boolean(process.env.GOOGLE_OAUTH_CLIENT_SECRET),
      length: process.env.GOOGLE_OAUTH_CLIENT_SECRET?.length ?? 0,
      starts: process.env.GOOGLE_OAUTH_CLIENT_SECRET?.slice(0, 5) ?? "",
    },
    GOOGLE_OAUTH_REFRESH_TOKEN: {
      present: Boolean(process.env.GOOGLE_OAUTH_REFRESH_TOKEN),
      length: process.env.GOOGLE_OAUTH_REFRESH_TOKEN?.length ?? 0,
      starts: process.env.GOOGLE_OAUTH_REFRESH_TOKEN?.slice(0, 5) ?? "",
    },
    GA4_PROPERTY_ID: {
      present: Boolean(process.env.GA4_PROPERTY_ID),
      length: process.env.GA4_PROPERTY_ID?.length ?? 0,
      value: process.env.GA4_PROPERTY_ID ?? "",
    },
    GSC_SITE_URL: {
      present: Boolean(process.env.GSC_SITE_URL),
      length: process.env.GSC_SITE_URL?.length ?? 0,
      value: process.env.GSC_SITE_URL ?? "",
    },
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_REGION: process.env.VERCEL_REGION,
    keys_starting_with_GOOGLE: Object.keys(process.env).filter((k) =>
      k.startsWith("GOOGLE"),
    ),
    keys_starting_with_GA: Object.keys(process.env).filter((k) =>
      k.startsWith("GA"),
    ),
    keys_starting_with_GSC: Object.keys(process.env).filter((k) =>
      k.startsWith("GSC"),
    ),
  };

  return NextResponse.json(env);
}
