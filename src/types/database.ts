export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          username: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      games: {
        Row: {
          id: string;
          rawg_id: number;
          name: string;
          background_image: string | null;
          metacritic_score: number | null;
          released: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          rawg_id: number;
          name: string;
          background_image?: string | null;
          metacritic_score?: number | null;
          released?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          rawg_id?: number;
          name?: string;
          background_image?: string | null;
          metacritic_score?: number | null;
          released?: string | null;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          game_id: string;
          user_id: string;
          rating: number;
          content: string | null;
          liked_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          user_id: string;
          rating: number;
          content?: string | null;
          liked_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          user_id?: string;
          rating?: number;
          content?: string | null;
          liked_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      interactions: {
        Row: {
          id: string;
          game_id: string;
          user_id: string;
          type: 'played' | 'wishlist' | 'liked';
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          user_id: string;
          type: 'played' | 'wishlist' | 'liked';
          created_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          user_id?: string;
          type?: 'played' | 'wishlist' | 'liked';
          created_at?: string;
        };
      };
      review_likes: {
        Row: {
          id: string;
          review_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          review_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          review_id?: string;
          user_id?: string;
          created_at?: string;
        };
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
  };
}
