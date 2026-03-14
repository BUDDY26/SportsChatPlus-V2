// Auto-generated types — regenerate with: npx supabase gen types typescript
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          team_name: string;
          league: string;
          team_id: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          team_name: string;
          league: string;
          team_id?: string | null;
        };
        Update: {
          team_name?: string;
          league?: string;
        };
        Relationships: [];
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          user_name: string;
          content: string;
          room: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          user_name: string;
          content: string;
          room?: string;
        };
        Update: never;
        Relationships: [];
      };
      ai_interactions: {
        Row: {
          id: string;
          user_id: string;
          prompt: string;
          response: string;
          model: string;
          tokens_used: number | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          prompt: string;
          response: string;
          model: string;
          tokens_used?: number | null;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
