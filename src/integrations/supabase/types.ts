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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      certificates: {
        Row: {
          certificate_number: string
          course_id: string
          id: string
          issued_at: string
          score: number | null
          user_id: string
        }
        Insert: {
          certificate_number: string
          course_id: string
          id?: string
          issued_at?: string
          score?: number | null
          user_id: string
        }
        Update: {
          certificate_number?: string
          course_id?: string
          id?: string
          issued_at?: string
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          category: string
          created_at: string
          description: string | null
          difficulty: string
          estimated_hours: number | null
          id: string
          is_premium: boolean
          sort_order: number
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          difficulty?: string
          estimated_hours?: number | null
          id?: string
          is_premium?: boolean
          sort_order?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty?: string
          estimated_hours?: number | null
          id?: string
          is_premium?: boolean
          sort_order?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_challenges: {
        Row: {
          challenge_date: string
          challenge_text: string
          completed: boolean
          completed_at: string | null
          gems_reward: number | null
          id: string
          user_id: string
        }
        Insert: {
          challenge_date?: string
          challenge_text: string
          completed?: boolean
          completed_at?: string | null
          gems_reward?: number | null
          id?: string
          user_id: string
        }
        Update: {
          challenge_date?: string
          challenge_text?: string
          completed?: boolean
          completed_at?: string | null
          gems_reward?: number | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_profiles: {
        Row: {
          created_at: string
          id: string
          knowledge_level: string
          learning_pace: string
          life_stage: string
          primary_goal: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          knowledge_level?: string
          learning_pace?: string
          life_stage?: string
          primary_goal?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          knowledge_level?: string
          learning_pace?: string
          life_stage?: string
          primary_goal?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      games_played: {
        Row: {
          game_id: string
          id: string
          played_at: string | null
          score: number | null
          user_id: string
        }
        Insert: {
          game_id: string
          id?: string
          played_at?: string | null
          score?: number | null
          user_id: string
        }
        Update: {
          game_id?: string
          id?: string
          played_at?: string | null
          score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          content: Json | null
          created_at: string
          duration_minutes: number | null
          id: string
          module_id: string
          sort_order: number
          title: string
          type: string
          video_url: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          module_id: string
          sort_order?: number
          title: string
          type?: string
          video_url?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          module_id?: string
          sort_order?: number
          title?: string
          type?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          sort_order: number
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_rankings: {
        Row: {
          id: string
          month: string
          tier: string | null
          updated_at: string | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          id?: string
          month: string
          tier?: string | null
          updated_at?: string | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          id?: string
          month?: string
          tier?: string | null
          updated_at?: string | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
      paper_portfolios: {
        Row: {
          cash: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cash?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cash?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      paper_positions: {
        Row: {
          avg_price: number
          id: string
          shares: number
          symbol: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_price?: number
          id?: string
          shares?: number
          symbol: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_price?: number
          id?: string
          shares?: number
          symbol?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      paper_trades: {
        Row: {
          action: string
          created_at: string
          id: string
          price: number
          shares: number
          symbol: string
          total: number
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          price: number
          shares: number
          symbol: string
          total: number
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          price?: number
          shares?: number
          symbol?: string
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          display_name: string | null
          id: string
          onboarding_completed: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quests: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          quest_category: string | null
          quest_date: string | null
          quest_text: string
          quest_type: string
          reward_gems: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          quest_category?: string | null
          quest_date?: string | null
          quest_text: string
          quest_type: string
          reward_gems?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          quest_category?: string | null
          quest_date?: string | null
          quest_text?: string
          quest_type?: string
          reward_gems?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_icon: string
          badge_name: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_icon?: string
          badge_name: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_icon?: string
          badge_name?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_gems: {
        Row: {
          gems_count: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          gems_count?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          gems_count?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_hearts: {
        Row: {
          hearts_count: number
          id: string
          last_reset_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          hearts_count?: number
          id?: string
          last_reset_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          hearts_count?: number
          id?: string
          last_reset_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_items: {
        Row: {
          id: string
          item_type: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          item_type: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          item_type?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_mistakes: {
        Row: {
          correct_answer: string
          created_at: string | null
          id: string
          lesson_id: string | null
          question_text: string
          reviewed: boolean | null
          topic: string | null
          user_answer: string
          user_id: string
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          question_text: string
          reviewed?: boolean | null
          topic?: string | null
          user_answer: string
          user_id: string
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          question_text?: string
          reviewed?: boolean | null
          topic?: string | null
          user_answer?: string
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          lesson_id: string
          score: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id: string
          score?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string
          score?: number | null
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
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          plan: string
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan?: string
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan?: string
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_xp: {
        Row: {
          earned_at: string
          id: string
          source: string
          source_id: string | null
          user_id: string
          xp_amount: number
        }
        Insert: {
          earned_at?: string
          id?: string
          source: string
          source_id?: string | null
          user_id: string
          xp_amount?: number
        }
        Update: {
          earned_at?: string
          id?: string
          source?: string
          source_id?: string | null
          user_id?: string
          xp_amount?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_premium_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_editor_or_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "editor" | "user"
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
      app_role: ["admin", "editor", "user"],
    },
  },
} as const
