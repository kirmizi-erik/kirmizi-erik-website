import { NextResponse } from "next/server";

import {
  fetchRealtimeCities,
  fetchRealtimePages,
  fetchRealtimeSummary,
} from "@/lib/google/analytics";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const [summary, cities, pages] = await Promise.all([
      fetchRealtimeSummary(),
      fetchRealtimeCities(10),
      fetchRealtimePages(10),
    ]);
    return NextResponse.json({
      activeUsers: summary.activeUsers,
      cities,
      pages,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
