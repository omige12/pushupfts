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
      challenges: {
        Row: {
          challenged_id: string
          challenger_id: string
          created_at: string | null
          duration: number
          id: string
          match_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          challenged_id: string
          challenger_id: string
          created_at?: string | null
          duration?: number
          id?: string
          match_id?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          challenged_id?: string
          challenger_id?: string
          created_at?: string | null
          duration?: number
          id?: string
          match_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_missions: {
        Row: {
          claimed: boolean
          current_progress: number
          goal: number
          id: string
          mission_date: string
          title: string
          type: Database["public"]["Enums"]["mission_type"]
          user_id: string
          xp_reward: number
        }
        Insert: {
          claimed?: boolean
          current_progress?: number
          goal: number
          id?: string
          mission_date?: string
          title: string
          type: Database["public"]["Enums"]["mission_type"]
          user_id: string
          xp_reward?: number
        }
        Update: {
          claimed?: boolean
          current_progress?: number
          goal?: number
          id?: string
          mission_date?: string
          title?: string
          type?: Database["public"]["Enums"]["mission_type"]
          user_id?: string
          xp_reward?: number
        }
        Relationships: []
      }
      daily_rewards: {
        Row: {
          id: string
          last_claimed_at: string | null
          streak_count: number
          user_id: string
        }
        Insert: {
          id?: string
          last_claimed_at?: string | null
          streak_count?: number
          user_id: string
        }
        Update: {
          id?: string
          last_claimed_at?: string | null
          streak_count?: number
          user_id?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string | null
          friend_id: string
          id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          friend_id: string
          id?: string
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          friend_id?: string
          id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      match_invites_v2: {
        Row: {
          created_at: string | null
          id: string
          match_id: string | null
          receiver_id: string
          sender_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          match_id?: string | null
          receiver_id: string
          sender_id: string
          status?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          match_id?: string | null
          receiver_id?: string
          sender_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_invites_v2_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_invites_v2_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_invites_v2_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string | null
          duration: number
          finished_at: string | null
          id: string
          opponent_avatar: string | null
          opponent_name: string
          opponent_score: number
          player_id: string
          player_score: number
          result: string | null
          status: string | null
          xp_gained: number | null
        }
        Insert: {
          created_at?: string | null
          duration: number
          finished_at?: string | null
          id?: string
          opponent_avatar?: string | null
          opponent_name: string
          opponent_score?: number
          player_id: string
          player_score?: number
          result?: string | null
          status?: string | null
          xp_gained?: number | null
        }
        Update: {
          created_at?: string | null
          duration?: number
          finished_at?: string | null
          id?: string
          opponent_avatar?: string | null
          opponent_name?: string
          opponent_score?: number
          player_id?: string
          player_score?: number
          result?: string | null
          status?: string | null
          xp_gained?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches_v2: {
        Row: {
          created_at: string | null
          finished_at: string | null
          id: string
          player_1: string
          player_1_reps: number | null
          player_2: string | null
          player_2_reps: number | null
          started_at: string | null
          status: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string | null
          finished_at?: string | null
          id?: string
          player_1: string
          player_1_reps?: number | null
          player_2?: string | null
          player_2_reps?: number | null
          started_at?: string | null
          status?: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string | null
          finished_at?: string | null
          id?: string
          player_1?: string
          player_1_reps?: number | null
          player_2?: string | null
          player_2_reps?: number | null
          started_at?: string | null
          status?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_v2_player_1_fkey"
            columns: ["player_1"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_v2_player_2_fkey"
            columns: ["player_2"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_v2_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          achievements: string[] | null
          age: number | null
          avatar_url: string | null
          goal: Database["public"]["Enums"]["fitness_goal"] | null
          height: number | null
          id: string
          last_login_at: string | null
          last_seen_at: string | null
          level: number
          losses: number
          motivation: string | null
          name: string
          player_id: string
          preferred_duration: number | null
          quiz_responses: Json | null
          record: number
          streak: number
          total_pushups: number
          updated_at: string | null
          weight: number | null
          wins: number
          xp: number
        }
        Insert: {
          achievements?: string[] | null
          age?: number | null
          avatar_url?: string | null
          goal?: Database["public"]["Enums"]["fitness_goal"] | null
          height?: number | null
          id: string
          last_login_at?: string | null
          last_seen_at?: string | null
          level?: number
          losses?: number
          motivation?: string | null
          name: string
          player_id: string
          preferred_duration?: number | null
          quiz_responses?: Json | null
          record?: number
          streak?: number
          total_pushups?: number
          updated_at?: string | null
          weight?: number | null
          wins?: number
          xp?: number
        }
        Update: {
          achievements?: string[] | null
          age?: number | null
          avatar_url?: string | null
          goal?: Database["public"]["Enums"]["fitness_goal"] | null
          height?: number | null
          id?: string
          last_login_at?: string | null
          last_seen_at?: string | null
          level?: number
          losses?: number
          motivation?: string | null
          name?: string
          player_id?: string
          preferred_duration?: number | null
          quiz_responses?: Json | null
          record?: number
          streak?: number
          total_pushups?: number
          updated_at?: string | null
          weight?: number | null
          wins?: number
          xp?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_numeric_player_id: { Args: never; Returns: string }
      generate_unique_player_id: { Args: never; Returns: string }
      get_public_profile: {
        Args: { _id: string }
        Returns: {
          avatar_url: string
          id: string
          last_seen_at: string
          level: number
          losses: number
          name: string
          player_id: string
          record: number
          streak: number
          wins: number
          xp: number
        }[]
      }
      get_ranking: {
        Args: { _ids?: string[]; _limit?: number }
        Returns: {
          avatar_url: string
          id: string
          level: number
          name: string
          player_id: string
          record: number
          streak: number
          wins: number
          xp: number
        }[]
      }
      increment_mission_progress: {
        Args: {
          p_amount: number
          p_type: Database["public"]["Enums"]["mission_type"]
          p_user_id: string
        }
        Returns: undefined
      }
      search_player: {
        Args: { _player_id: string }
        Returns: {
          avatar_url: string
          id: string
          last_seen_at: string
          level: number
          losses: number
          name: string
          player_id: string
          record: number
          streak: number
          wins: number
          xp: number
        }[]
      }
      track_daily_login: { Args: { user_id_param: string }; Returns: undefined }
    }
    Enums: {
      fitness_goal:
        | "Ganhar força"
        | "Perder peso"
        | "Condicionamento"
        | "Massa muscular"
        | "Melhorar minhas flexões"
        | "Bater recordes"
        | "Vencer outras pessoas"
        | "Chegar ao topo do ranking"
      mission_type: "pushups" | "battles" | "wins" | "xp" | "login" | "matches"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      fitness_goal: [
        "Ganhar força",
        "Perder peso",
        "Condicionamento",
        "Massa muscular",
        "Melhorar minhas flexões",
        "Bater recordes",
        "Vencer outras pessoas",
        "Chegar ao topo do ranking",
      ],
      mission_type: ["pushups", "battles", "wins", "xp", "login", "matches"],
    },
  },
} as const
