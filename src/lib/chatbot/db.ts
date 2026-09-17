import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Chatbot tabloları (kb_chunks, chat_*, admin_knowledge) generated Database
 * tipinde henüz yok — migration sonrası `npm run db:types` ile eklenene kadar
 * untyped client kullanılır. Service role: RLS bypass, sadece server.
 */
export function chatbotDb(): SupabaseClient {
  return createAdminClient() as unknown as SupabaseClient;
}
