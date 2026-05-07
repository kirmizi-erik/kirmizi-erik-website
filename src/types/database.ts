export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      case_studies: {
        Row: {
          baslik: string
          cozum: string | null
          created_at: string
          durum: string
          ekip_krediler: string[]
          galeri_urls: string[]
          id: string
          kapak_url: string | null
          kapak_video_url: string | null
          kategori: string[]
          metrikler: Json
          musteri_adi: string | null
          one_cikan: boolean
          ozet: string | null
          problem: string | null
          sektor: string | null
          slug: string
          sonuc: string | null
          updated_at: string
          yayin_tarihi: string | null
        }
        Insert: {
          baslik: string
          cozum?: string | null
          created_at?: string
          durum?: string
          ekip_krediler?: string[]
          galeri_urls?: string[]
          id?: string
          kapak_url?: string | null
          kapak_video_url?: string | null
          kategori?: string[]
          metrikler?: Json
          musteri_adi?: string | null
          one_cikan?: boolean
          ozet?: string | null
          problem?: string | null
          sektor?: string | null
          slug: string
          sonuc?: string | null
          updated_at?: string
          yayin_tarihi?: string | null
        }
        Update: {
          baslik?: string
          cozum?: string | null
          created_at?: string
          durum?: string
          ekip_krediler?: string[]
          galeri_urls?: string[]
          id?: string
          kapak_url?: string | null
          kapak_video_url?: string | null
          kategori?: string[]
          metrikler?: Json
          musteri_adi?: string | null
          one_cikan?: boolean
          ozet?: string | null
          problem?: string | null
          sektor?: string | null
          slug?: string
          sonuc?: string | null
          updated_at?: string
          yayin_tarihi?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          ad_soyad: string
          ai_ozet: string | null
          ai_skor: number | null
          brief: string | null
          butce: string | null
          created_at: string
          durum: string
          eposta: string
          hizmet_kategori: string[]
          id: string
          kaynak: string | null
          notlar: string | null
          sirket: string | null
          telefon: string | null
          user_agent: string | null
        }
        Insert: {
          ad_soyad: string
          ai_ozet?: string | null
          ai_skor?: number | null
          brief?: string | null
          butce?: string | null
          created_at?: string
          durum?: string
          eposta: string
          hizmet_kategori?: string[]
          id?: string
          kaynak?: string | null
          notlar?: string | null
          sirket?: string | null
          telefon?: string | null
          user_agent?: string | null
        }
        Update: {
          ad_soyad?: string
          ai_ozet?: string | null
          ai_skor?: number | null
          brief?: string | null
          butce?: string | null
          created_at?: string
          durum?: string
          eposta?: string
          hizmet_kategori?: string[]
          id?: string
          kaynak?: string | null
          notlar?: string | null
          sirket?: string | null
          telefon?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          role?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          contact_address: string | null
          contact_email: string | null
          contact_phone: string | null
          cookie_text: string | null
          footer_links: Json
          hero_subtitle: string | null
          hero_title: string | null
          hero_video_url: string | null
          id: number
          kvkk_text: string | null
          meta_description: string | null
          meta_og_image_url: string | null
          meta_title: string | null
          social: Json
          updated_at: string
        }
        Insert: {
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          cookie_text?: string | null
          footer_links?: Json
          hero_subtitle?: string | null
          hero_title?: string | null
          hero_video_url?: string | null
          id?: number
          kvkk_text?: string | null
          meta_description?: string | null
          meta_og_image_url?: string | null
          meta_title?: string | null
          social?: Json
          updated_at?: string
        }
        Update: {
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          cookie_text?: string | null
          footer_links?: Json
          hero_subtitle?: string | null
          hero_title?: string | null
          hero_video_url?: string | null
          id?: number
          kvkk_text?: string | null
          meta_description?: string | null
          meta_og_image_url?: string | null
          meta_title?: string | null
          social?: Json
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_role: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
