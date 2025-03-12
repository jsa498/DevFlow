export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          price: number
          product_id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          price: number
          product_id: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          price?: number
          product_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_services: {
        Row: {
          created_at: string | null
          description: string
          id: string
          image_url: string | null
          initial_consultation_price: number
          published: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          image_url?: string | null
          initial_consultation_price: number
          published?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string | null
          initial_consultation_price?: number
          published?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      coaching_sessions: {
        Row: {
          created_at: string | null
          description: string | null
          duration_minutes: number
          id: string
          meeting_url: string | null
          notes: string | null
          preferred_days: string[] | null
          scheduled_at: string
          status: string
          subscription_id: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          meeting_url?: string | null
          notes?: string | null
          preferred_days?: string[] | null
          scheduled_at: string
          status: string
          subscription_id?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          meeting_url?: string | null
          notes?: string | null
          preferred_days?: string[] | null
          scheduled_at?: string
          status?: string
          subscription_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaching_sessions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_subscription_plans: {
        Row: {
          created_at: string | null
          description: string
          id: string
          price_per_month: number
          service_id: string
          sessions_per_month: number
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          price_per_month: number
          service_id: string
          sessions_per_month: number
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          price_per_month?: number
          service_id?: string
          sessions_per_month?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coaching_subscription_plans_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "coaching_services"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string | null
          difficulty_level: string | null
          estimated_duration: string | null
          id: string
          prerequisites: string | null
          product_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          difficulty_level?: string | null
          estimated_duration?: string | null
          id?: string
          prerequisites?: string | null
          product_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          difficulty_level?: string | null
          estimated_duration?: string | null
          id?: string
          prerequisites?: string | null
          product_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: Json | null
          content_type: string
          created_at: string | null
          description: string | null
          duration: number | null
          id: string
          order_index: number
          pdf_url: string | null
          section_id: string
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          content?: Json | null
          content_type: string
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          order_index: number
          pdf_url?: string | null
          section_id: string
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          content?: Json | null
          content_type?: string
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          order_index?: number
          pdf_url?: string | null
          section_id?: string
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string | null
          description: string
          featured: boolean | null
          id: string
          image_url: string | null
          pdf_url: string
          price: number
          published: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          featured?: boolean | null
          id?: string
          image_url?: string | null
          pdf_url: string
          price: number
          published?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          featured?: boolean | null
          id?: string
          image_url?: string | null
          pdf_url?: string
          price?: number
          published?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          product_id: string
          status: string
          stripe_session_id: string | null
          test_mode: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          product_id: string
          status: string
          stripe_session_id?: string | null
          test_mode?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          product_id?: string
          status?: string
          stripe_session_id?: string | null
          test_mode?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          id: string
          order_index: number
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          order_index: number
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          order_index?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sections_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          last_position: number | null
          lesson_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          last_position?: number | null
          lesson_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          last_position?: number | null
          lesson_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string
          preferred_days: string[] | null
          status: string
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end: string
          current_period_start: string
          id?: string
          plan_id: string
          preferred_days?: string[] | null
          status: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id?: string
          preferred_days?: string[] | null
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "coaching_subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_profiles_table_manually: {
        Args: {
          sql_command: string
        }
        Returns: undefined
      }
      update_existing_users_profiles: {
        Args: {
          sql_command: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
