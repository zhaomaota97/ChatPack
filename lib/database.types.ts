// Supabase Database Types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          password_hash: string
          role: 'USER' | 'ADMIN'
          invite_code: string
          invited_by: string | null
          total_packs_opened: number
          total_roses: number
          total_messages: number
          is_banned: boolean
          last_login_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          username: string
          password_hash: string
          role?: 'USER' | 'ADMIN'
          invite_code?: string
          invited_by?: string | null
          total_packs_opened?: number
          total_roses?: number
          total_messages?: number
          is_banned?: boolean
          last_login_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          password_hash?: string
          role?: 'USER' | 'ADMIN'
          invite_code?: string
          invited_by?: string | null
          total_packs_opened?: number
          total_roses?: number
          total_messages?: number
          is_banned?: boolean
          last_login_at?: string | null
          created_at?: string
        }
      }
      wordbooks: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      words: {
        Row: {
          id: string
          word: string
          definition: string
          pronunciation: string | null
          rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
          example_sentence: string | null
          image_url: string | null
          audio_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          word: string
          definition: string
          pronunciation?: string | null
          rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
          example_sentence?: string | null
          image_url?: string | null
          audio_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          word?: string
          definition?: string
          pronunciation?: string | null
          rarity?: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
          example_sentence?: string | null
          image_url?: string | null
          audio_url?: string | null
          created_at?: string
        }
      }
      wordbook_words: {
        Row: {
          wordbook_id: string
          word_id: string
          created_at: string
        }
        Insert: {
          wordbook_id: string
          word_id: string
          created_at?: string
        }
        Update: {
          wordbook_id?: string
          word_id?: string
          created_at?: string
        }
      }
      packs: {
        Row: {
          id: string
          name: string
          description: string | null
          pack_type: 'NORMAL' | 'SPECIAL'
          card_count: number
          rarity_type: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | null
          rarity_weights: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          pack_type: 'NORMAL' | 'SPECIAL'
          card_count: number
          rarity_type?: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | null
          rarity_weights?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          pack_type?: 'NORMAL' | 'SPECIAL'
          card_count?: number
          rarity_type?: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | null
          rarity_weights?: Json | null
          created_at?: string
        }
      }
      user_packs: {
        Row: {
          user_id: string
          pack_id: string
          count: number
          obtained_at: string
        }
        Insert: {
          user_id: string
          pack_id: string
          count?: number
          obtained_at?: string
        }
        Update: {
          user_id?: string
          pack_id?: string
          count?: number
          obtained_at?: string
        }
      }
      user_words: {
        Row: {
          id: string
          user_id: string
          word_id: string
          is_favorite: boolean
          obtained_at: string
        }
        Insert: {
          id?: string
          user_id: string
          word_id: string
          is_favorite?: boolean
          obtained_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          word_id?: string
          is_favorite?: boolean
          obtained_at?: string
        }
      }
      chat_rooms: {
        Row: {
          id: string
          name: string
          description: string | null
          emoji: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          emoji?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          emoji?: string | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          room_id: string
          user_id: string
          content: string
          roses: number
          timestamp: string
          reply_to_id: string | null
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          content: string
          roses?: number
          timestamp?: string
          reply_to_id?: string | null
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          content?: string
          roses?: number
          timestamp?: string
          reply_to_id?: string | null
        }
      }
      rose_transactions: {
        Row: {
          id: string
          message_id: string
          sender_id: string
          created_at: string
        }
        Insert: {
          id?: string
          message_id: string
          sender_id: string
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          sender_id?: string
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {
      generate_invite_code: {
        Args: Record<string, never>
        Returns: string
      }
      draw_words_special_pack: {
        Args: {
          p_user_id: string
          p_pack_id: string
          p_card_count: number
          p_rarity_type: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
        }
        Returns: Json
      }
      draw_words_normal_pack: {
        Args: {
          p_user_id: string
          p_pack_id: string
          p_card_count: number
          p_rarity_weights: Json
        }
        Returns: Json
      }
      increment_user_roses: {
        Args: {
          user_id: string
          amount: number
        }
        Returns: void
      }
    }
    Enums: {}
  }
}
