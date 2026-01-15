export type RarityType = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
export type BookType = 'primary' | 'middle' | 'high' | 'cet4' | 'cet6' | 'kaoyan'
export type UserRole = 'USER' | 'ADMIN'

export interface Word {
  word: string
  meaning: string
  phonetic: string
  rarity: RarityType
  books: BookType[]
  example?: string
}

export interface InventoryWord extends Word {
  favorite: boolean
  obtainedAt: Date
}

export interface Message {
  user: string
  text: string
  time: string
  rarity: RarityType
}

export interface Pack {
  id: string
  name: string
  description: string
  cardCount: number
  rarity: RarityType | 'MIXED'
}

export interface User {
  id: string
  username: string
  nickname: string
  email: string
  role: UserRole
  avatar?: string
  inviteCode: string
}
