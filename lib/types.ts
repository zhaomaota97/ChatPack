// ============================================
// 枚举类型
// ============================================
export type UserRole = 'USER' | 'ADMIN'
export type RarityType = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
export type WordbookLevel = 'PRIMARY' | 'MIDDLE' | 'HIGH' | 'CET4' | 'CET6' | 'POSTGRADUATE'
export type PackType = 'NORMAL' | 'SPECIAL'

// ============================================
// 数据库类型定义
// ============================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: DbUser
        Insert: Omit<DbUser, 'id' | 'invite_code' | 'registered_at' | 'updated_at'>
        Update: Partial<Omit<DbUser, 'id' | 'username' | 'invite_code' | 'registered_at'>>
      }
      words: {
        Row: DbWord
        Insert: Omit<DbWord, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<DbWord, 'id' | 'created_at' | 'updated_at'>>
      }
      wordbooks: {
        Row: DbWordbook
        Insert: Omit<DbWordbook, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<DbWordbook, 'id' | 'created_at' | 'updated_at'>>
      }
      wordbook_words: {
        Row: DbWordbookWord
        Insert: DbWordbookWord
        Update: never
      }
      user_words: {
        Row: DbUserWord
        Insert: Omit<DbUserWord, 'obtained_at'>
        Update: Partial<Pick<DbUserWord, 'is_favorited'>>
      }
      packs: {
        Row: DbPack
        Insert: Omit<DbPack, 'id' | 'created_at'>
        Update: Partial<Omit<DbPack, 'id' | 'created_at'>>
      }
      user_packs: {
        Row: DbUserPack
        Insert: DbUserPack
        Update: Partial<Pick<DbUserPack, 'count'>>
      }
      chat_rooms: {
        Row: DbChatRoom
        Insert: Omit<DbChatRoom, 'id' | 'created_at'>
        Update: Partial<Omit<DbChatRoom, 'id' | 'created_at'>>
      }
      chat_room_wordbooks: {
        Row: DbChatRoomWordbook
        Insert: DbChatRoomWordbook
        Update: never
      }
      messages: {
        Row: DbMessage
        Insert: Omit<DbMessage, 'id' | 'roses' | 'timestamp'>
        Update: never
      }
      rose_transactions: {
        Row: DbRoseTransaction
        Insert: Omit<DbRoseTransaction, 'id' | 'sent_at'>
        Update: never
      }
    }
    Functions: {
      generate_invite_code: {
        Returns: string
      }
      draw_words_special_pack: {
        Args: {
          p_user_id: string
          p_pack_id: string
          p_card_count: number
          p_rarity_type: RarityType
        }
        Returns: Array<{
          word_id: string
          word: string
          definition: string
          word_rarity: RarityType
          pronunciation: string | null
          example_sentence: string | null
          image_url: string | null
          audio_url: string | null
        }>
      }
      draw_words_normal_pack: {
        Args: {
          p_user_id: string
          p_pack_id: string
          p_card_count: number
          p_rarity_weights: { COMMON: number; RARE: number; EPIC: number; LEGENDARY: number }
        }
        Returns: Array<{
          word_id: string
          word: string
          definition: string
          word_rarity: RarityType
          pronunciation: string | null
          example_sentence: string | null
          image_url: string | null
          audio_url: string | null
        }>
      }
    }
  }
}

// ============================================
// 数据库表行类型
// ============================================

export interface DbUser {
  id: string
  username: string
  password_hash: string
  nickname: string | null
  avatar: string | null
  role: UserRole
  is_banned: boolean
  total_roses: number
  total_packs_opened: number
  invite_code: string
  invited_by: string | null
  registered_at: string
  last_login_at: string | null
  updated_at: string
}

export interface DbWord {
  id: string
  word: string
  definition: string
  pronunciation: string | null
  rarity: RarityType
  example_sentence: string | null
  image_url: string | null
  audio_url: string | null
  created_at: string
  updated_at: string
}

export interface DbWordbook {
  id: string
  name: string
  level: WordbookLevel
  description: string | null
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DbWordbookWord {
  wordbook_id: string
  word_id: string
  created_at: string
}

export interface DbUserWord {
  user_id: string
  word_id: string
  is_favorited: boolean
  obtained_at: string
}

export interface DbPack {
  id: string
  name: string
  description: string | null
  card_count: number
  pack_type: PackType
  rarity_type: RarityType | null
  rarity_weights: { COMMON: number; RARE: number; EPIC: number; LEGENDARY: number } | null
  is_active: boolean
  created_at: string
}

export interface DbUserPack {
  user_id: string
  pack_id: string
  count: number
}

export interface DbChatRoom {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
}

export interface DbChatRoomWordbook {
  room_id: string
  wordbook_id: string
}

export interface DbMessage {
  id: string
  room_id: string
  user_id: string
  content: string
  roses: number
  timestamp: string
  reply_to_id: string | null
}

export interface DbRoseTransaction {
  id: string
  message_id: string
  sender_id: string
  sent_at: string
}

// ============================================
// 前端使用的业务类型
// ============================================

export interface User {
  id: string
  username: string
  nickname: string | null
  avatar: string | null
  role: UserRole
  totalPacksOpened: number
  totalRoses: number
  inviteCode: string
  registeredAt: string
  isBanned: boolean
}

export interface Word {
  id: string
  word: string
  definition: string
  pronunciation: string | null
  rarity: RarityType
  exampleSentence: string | null
  imageUrl: string | null
  audioUrl: string | null
  wordbooks?: string[]
}

export interface InventoryWord extends Word {
  isFavorited: boolean
  obtainedAt: string
}

export interface Wordbook {
  id: string
  name: string
  level: WordbookLevel
  description: string | null
  orderIndex: number
  isActive: boolean
}

export interface Pack {
  id: string
  name: string
  description: string | null
  cardCount: number
  packType: PackType
  rarityType: RarityType | null
  rarityWeights: { COMMON: number; RARE: number; EPIC: number; LEGENDARY: number } | null
  isActive: boolean
}

export interface UserPack {
  pack: Pack
  count: number
}

export interface ChatRoom {
  id: string
  name: string
  description: string | null
  isActive: boolean
  wordbooks?: Wordbook[]
}

export interface Message {
  id: string
  roomId: string
  user: {
    id: string
    username: string
    nickname: string | null
    avatar: string | null
  }
  content: string
  roses: number
  timestamp: string
  replyToId: string | null
  hasRosed?: boolean
}

// ============================================
// API 请求/响应类型
// ============================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 认证
export interface RegisterRequest {
  username: string
  password: string
  inviteCode?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface AuthResponse {
  userId: string
  username: string
  nickname: string | null
  avatar: string | null
  role: UserRole
}

// 单词
export interface CreateWordRequest {
  word: string
  definition: string
  pronunciation?: string
  rarity: RarityType
  exampleSentence?: string
  imageUrl?: string
  audioUrl?: string
  wordbookIds: string[]
}

export interface UpdateWordRequest {
  definition?: string
  pronunciation?: string
  rarity?: RarityType
  exampleSentence?: string
  imageUrl?: string
  audioUrl?: string
  wordbookIds?: string[]
}

// 聊天
export interface SendMessageRequest {
  roomId: string
  content: string
  replyToId?: string
}

// 管理员
export interface CreatePackRequest {
  name: string
  description?: string
  cardCount: number
  packType: PackType
  rarityType?: RarityType
  rarityWeights?: { COMMON: number; RARE: number; EPIC: number; LEGENDARY: number }
}

export interface CreateChatRoomRequest {
  name: string
  description?: string
  wordbookIds: string[]
}

export interface UpdateChatRoomRequest {
  name?: string
  description?: string
  isActive?: boolean
  wordbookIds?: string[]
}
