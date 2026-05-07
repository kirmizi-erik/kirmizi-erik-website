// Bu dosya `pnpm db:types` komutuyla Supabase'den otomatik üretilir.
// Boilerplate'te placeholder; ilk migration'dan sonra üretilecek.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
