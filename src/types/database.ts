export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          bio: string | null;
          accent_color: string | null;
          tick_color: string | null;
          avatar_frame: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          avatar_url?: string | null;
          bio?: string | null;
          accent_color?: string | null;
          tick_color?: string | null;
          avatar_frame?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
          accent_color?: string | null;
          tick_color?: string | null;
          avatar_frame?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      premium_members: {
        Row: {
          id: string;
          user_id: string;
          source: 'manual' | 'patreon';
          granted_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          source?: 'manual' | 'patreon';
          granted_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          source?: 'manual' | 'patreon';
          granted_at?: string;
          expires_at?: string | null;
        };
      };
      patreon_links: {
        Row: {
          user_id: string;
          patreon_user_id: string;
          patreon_full_name: string | null;
          connected_at: string;
        };
        Insert: {
          user_id: string;
          patreon_user_id: string;
          patreon_full_name?: string | null;
          connected_at?: string;
        };
        Update: {
          user_id?: string;
          patreon_user_id?: string;
          patreon_full_name?: string | null;
          connected_at?: string;
        };
      };
      games: {
        Row: {
          id: string;
          igdb_id: number;
          name: string;
          background_image: string | null;
          metacritic_score: number | null;
          released: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          igdb_id: number;
          name: string;
          background_image?: string | null;
          metacritic_score?: number | null;
          released?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          igdb_id?: number;
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
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
      };
      blocks: {
        Row: {
          id: string;
          blocker_id: string;
          blocked_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          blocker_id: string;
          blocked_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          blocker_id?: string;
          blocked_id?: string;
          created_at?: string;
        };
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          actor_id: string;
          type: 'new_review' | 'new_follower';
          review_id: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          actor_id: string;
          type: 'new_review' | 'new_follower';
          review_id?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          actor_id?: string;
          type?: 'new_review' | 'new_follower';
          review_id?: string | null;
          read?: boolean;
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
