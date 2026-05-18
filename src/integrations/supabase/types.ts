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
  public: {
    Tables: {
      category_banners: {
        Row: {
          category: string
          created_at: string
          enabled: boolean
          id: string
          image_url: string
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          enabled?: boolean
          id?: string
          image_url: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          enabled?: boolean
          id?: string
          image_url?: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hero_banners: {
        Row: {
          created_at: string
          cta_href: string | null
          cta_label: string | null
          enabled: boolean
          ends_at: string | null
          eyebrow: string | null
          id: string
          image_url: string
          mobile_image_url: string | null
          sort_order: number
          starts_at: string | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_href?: string | null
          cta_label?: string | null
          enabled?: boolean
          ends_at?: string | null
          eyebrow?: string | null
          id?: string
          image_url: string
          mobile_image_url?: string | null
          sort_order?: number
          starts_at?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_href?: string | null
          cta_label?: string | null
          enabled?: boolean
          ends_at?: string | null
          eyebrow?: string | null
          id?: string
          image_url?: string
          mobile_image_url?: string | null
          sort_order?: number
          starts_at?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          id: string
          items: Json
          payment_method: string
          shipping: number
          shipping_address: Json | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          items?: Json
          payment_method?: string
          shipping?: number
          shipping_address?: Json | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
          payment_method?: string
          shipping?: number
          shipping_address?: Json | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          badge: string | null
          brand: string | null
          category: string
          created_at: string
          data: Json
          description: string | null
          id: string
          in_stock: boolean
          is_featured: boolean
          is_new: boolean
          is_sale: boolean
          is_trending: boolean
          is_visible: boolean
          name: string
          original_price: number | null
          price: number
          product_type: string
          rating: number
          reviews: number
          sku: string | null
          sort_order: number
          stock: number
          subtitle: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          badge?: string | null
          brand?: string | null
          category: string
          created_at?: string
          data?: Json
          description?: string | null
          id: string
          in_stock?: boolean
          is_featured?: boolean
          is_new?: boolean
          is_sale?: boolean
          is_trending?: boolean
          is_visible?: boolean
          name: string
          original_price?: number | null
          price?: number
          product_type?: string
          rating?: number
          reviews?: number
          sku?: string | null
          sort_order?: number
          stock?: number
          subtitle?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          badge?: string | null
          brand?: string | null
          category?: string
          created_at?: string
          data?: Json
          description?: string | null
          id?: string
          in_stock?: boolean
          is_featured?: boolean
          is_new?: boolean
          is_sale?: boolean
          is_trending?: boolean
          is_visible?: boolean
          name?: string
          original_price?: number | null
          price?: number
          product_type?: string
          rating?: number
          reviews?: number
          sku?: string | null
          sort_order?: number
          stock?: number
          subtitle?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          created_at: string
          detailed_address: string | null
          district: string | null
          email: string | null
          full_name: string | null
          house_number: string | null
          id: string
          phone: string | null
          secondary_phone: string | null
          upazila: string | null
          updated_at: string
          village: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          detailed_address?: string | null
          district?: string | null
          email?: string | null
          full_name?: string | null
          house_number?: string | null
          id: string
          phone?: string | null
          secondary_phone?: string | null
          upazila?: string | null
          updated_at?: string
          village?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          detailed_address?: string | null
          district?: string | null
          email?: string | null
          full_name?: string | null
          house_number?: string | null
          id?: string
          phone?: string | null
          secondary_phone?: string | null
          upazila?: string | null
          updated_at?: string
          village?: string | null
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string
          id: string
          product_data: Json | null
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_data?: Json | null
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_data?: Json | null
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      order_status:
        | "warehouse"
        | "packaging"
        | "transit"
        | "delivered"
        | "cancelled"
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
  public: {
    Enums: {
      order_status: [
        "warehouse",
        "packaging",
        "transit",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const
