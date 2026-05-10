import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

let _admin: ReturnType<typeof createClient<Database>> | null = null;

export function createAdminClient() {
  if (_admin) return _admin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Supabase admin client: URL veya SERVICE_ROLE_KEY eksik");
  }

  _admin = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _admin;
}
