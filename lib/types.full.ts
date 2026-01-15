// =====================================================
// 枚举类型
// =====================================================
export type UserRole = 'USER' | 'ADMIN'
export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
export type WordbookLevel = 'PRIMARY' | 'MIDDLE' | 'HIGH' | 'CET4' | 'CET6' | 'POSTGRADUATE'
export type PackType = 'NORMAL' | 'SPECIAL'

// =====================================================
// 数据库表类型（snake_case）
// =====================================================

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
  rarity: Rarity
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
  rarity_type: Rarity | null
  rarity_weights: Record<Rarity, number> | null
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

// =====================================================
// 应用层类型（camelCase）
// =====================================================

export interface User {
  id: string
  username: string
  nickname?: string
  avatar?: string
  role: UserRole
  isBanned: boolean
  totalRoses: number
  totalPacksOpened: number
  inviteCode: string
  invitedBy?: string
  registeredAt: string
  lastLoginAt?: string
  updatedAt: string
}

export interface Word {
  id: string
  word: string
  definition: string
  pronunciation?: string
  rarity: Rarity
  exampleSentence?: string
  imageUrl?: string
  audioUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Wordbook {
  id: string
  name: string
  level: WordbookLevel
  description?: string
  orderIndex: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UserWord {
  userId: string
  wordId: string
  word: Word
  isFavorited: boolean
  obtainedAt: string
}

export interface Pack {
  id: string
  name: string
  description?: string
  cardCount: number
  packType: PackType
  rarityType?: Rarity
  rarityWeights?: Record<Rarity, number>
  isActive: boolean
  createdAt: string
}

export interface UserPack {
  userId: string
  packId: string
  pack: Pack
  count: number
}

export interface ChatRoom {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  wordbooks?: Wordbook[]
}

export interface Message {
  id: string
  roomId: string
  userId: string
  user: {
    id: string
    username: string
    nickname?: string
    avatar?: string
  }
  content: string
  roses: number
  timestamp: string
  replyToId?: string
  hasRosed?: boolean
}

export interface RoseTransaction {
  id: string
  messageId: string
  senderId: string
  sentAt: string
}

// =====================================================
// API 请求/响应类型
// =====================================================

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

export interface AuthUser {
  userId: string
  username: string
  nickname?: string
  avatar?: string
  role: UserRole
}

// 单词
export interface CreateWordRequest {
  word: string
  definition: string
  pronunciation?: string
  rarity: Rarity
  exampleSentence?: string
  imageUrl?: string
  audioUrl?: string
  wordbookIds: string[]
}

export interface UpdateWordRequest {
  word?: string
  definition?: string
  pronunciation?: string
  rarity?: Rarity
  exampleSentence?: string
  imageUrl?: string
  audioUrl?: string
  wordbookIds?: string[]
}

// 卡包
export interface OpenPackRequest {
  packId: string
}

export interface OpenPackResponse {
  words: Array<Word & { isNew: boolean }>
  packName: string
}

// 聊天室
export interface SendMessageRequest {
  content: string
  replyToId?: string
}

export interface CreateRoomRequest {
  name: string
  description?: string
  wordbookIds: string[]
}

export interface UpdateRoomRequest {
  name?: string
  description?: string
  wordbookIds?: string[]
  isActive?: boolean
}

// 管理员
export interface CreatePackRequest {
  name: string
  description?: string
  cardCount: number
  packType: PackType
  rarityType?: Rarity
  rarityWeights?: Record<Rarity, number>
}

export interface UpdatePackRequest {
  name?: string
  description?: string
  cardCount?: number
  rarityWeights?: Record<Rarity, number>
  isActive?: boolean
}

export interface GivePackRequest {
  packId: string
  count: number
}

export interface DashboardStats {
  totalUsers: number
  totalWords: number
  totalPacks: number
  totalRooms: number
  totalMessages: number
  activeUsers: number
}

// =====================================================
// 工具类型转换
// =====================================================

export function dbUserToUser(dbUser: DbUser): User {
  return {
    id: dbUser.id,
    username: dbUser.username,
    nickname: dbUser.nickname || undefined,
    avatar: dbUser.avatar || undefined,
    role: dbUser.role,
    isBanned: dbUser.is_banned,
    totalRoses: dbUser.total_roses,
    totalPacksOpened: dbUser.total_packs_opened,
    inviteCode: dbUser.invite_code,
    invitedBy: dbUser.invited_by || undefined,
    registeredAt: dbUser.registered_at,
    lastLoginAt: dbUser.last_login_at || undefined,
    updatedAt: dbUser.updated_at,
  }
}

export function dbWordToWord(dbWord: DbWord): Word {
  return {
    id: dbWord.id,
    word: dbWord.word,
    definition: dbWord.definition,
    pronunciation: dbWord.pronunciation || undefined,
    rarity: dbWord.rarity,
    exampleSentence: dbWord.example_sentence || undefined,
    imageUrl: dbWord.image_url || undefined,
    audioUrl: dbWord.audio_url || undefined,
    createdAt: dbWord.created_at,
    updatedAt: dbWord.updated_at,
  }
}

export function dbWordbookToWordbook(dbWordbook: DbWordbook): Wordbook {
  return {
    id: dbWordbook.id,
    name: dbWordbook.name,
    level: dbWordbook.level,
    description: dbWordbook.description || undefined,
    orderIndex: dbWordbook.order_index,
    isActive: dbWordbook.is_active,
    createdAt: dbWordbook.created_at,
    updatedAt: dbWordbook.updated_at,
  }
}

export function dbPackToPack(dbPack: DbPack): Pack {
  return {
    id: dbPack.id,
    name: dbPack.name,
    description: dbPack.description || undefined,
    cardCount: dbPack.card_count,
    packType: dbPack.pack_type,
    rarityType: dbPack.rarity_type || undefined,
    rarityWeights: dbPack.rarity_weights || undefined,
    isActive: dbPack.is_active,
    createdAt: dbPack.created_at,
  }
}

export function dbChatRoomToChatRoom(dbChatRoom: DbChatRoom): ChatRoom {
  return {
    id: dbChatRoom.id,
    name: dbChatRoom.name,
    description: dbChatRoom.description || undefined,
    isActive: dbChatRoom.is_active,
    createdAt: dbChatRoom.created_at,
  }
}

export function dbMessageToMessage(dbMessage: DbMessage, user: { id: string; username: string; nickname?: string; avatar?: string }, hasRosed?: boolean): Message {
  return {
    id: dbMessage.id,
    roomId: dbMessage.room_id,
    userId: dbMessage.user_id,
    user,
    content: dbMessage.content,
    roses: dbMessage.roses,
    timestamp: dbMessage.timestamp,
    replyToId: dbMessage.reply_to_id || undefined,
    hasRosed,
  }
}
