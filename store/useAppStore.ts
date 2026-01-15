import { create } from 'zustand'
import type { User, UserWord, Message, ChatRoom, Pack, UserPack } from '@/lib/types.full'

interface AppState {
  // 用户信息
  user: User | null
  setUser: (user: User | null) => void

  // 当前激活的页面
  activePage: string
  setActivePage: (page: string) => void

  // 是否显示管理后台
  isAdminMode: boolean
  setAdminMode: (isAdmin: boolean) => void

  // 用户单词库存
  userWords: UserWord[]
  setUserWords: (words: UserWord[]) => void
  addUserWord: (word: UserWord) => void

  // 用户卡包库存
  userPacks: UserPack[]
  setUserPacks: (packs: UserPack[]) => void
  updatePackCount: (packId: string, count: number) => void

  // 所有可用卡包
  availablePacks: Pack[]
  setAvailablePacks: (packs: Pack[]) => void

  // 聊天室
  rooms: ChatRoom[]
  setRooms: (rooms: ChatRoom[]) => void
  currentRoom: ChatRoom | null
  setCurrentRoom: (room: ChatRoom | null) => void

  // 聊天消息
  messages: Message[]
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  updateMessage: (messageId: string, updates: Partial<Message>) => void

  // 单词详情弹窗
  selectedWord: UserWord | null
  setSelectedWord: (word: UserWord | null) => void

  // 后台管理页签
  activeAdminTab: string
  setActiveAdminTab: (tab: string) => void

  // Loading状态
  isLoading: boolean
  setLoading: (loading: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  // 用户信息
  user: null,
  setUser: (user) => set({ user }),

  // 页面状态
  activePage: 'pack',
  setActivePage: (page) => set({ activePage: page }),

  // 管理后台
  isAdminMode: false,
  setAdminMode: (isAdmin) => set({ isAdminMode: isAdmin }),

  // 用户单词库存
  userWords: [],
  setUserWords: (words) => set({ userWords: words }),
  addUserWord: (word) => set((state) => ({ userWords: [word, ...state.userWords] })),

  // 用户卡包库存
  userPacks: [],
  setUserPacks: (packs) => set({ userPacks: packs }),
  updatePackCount: (packId, count) => set((state) => ({
    userPacks: state.userPacks.map((p) =>
      p.packId === packId ? { ...p, count } : p
    ),
  })),

  // 所有可用卡包
  availablePacks: [],
  setAvailablePacks: (packs) => set({ availablePacks: packs }),

  // 聊天室
  rooms: [],
  setRooms: (rooms) => set({ rooms }),
  currentRoom: null,
  setCurrentRoom: (room) => set({ currentRoom: room, messages: [] }),

  // 聊天消息
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateMessage: (messageId, updates) => set((state) => ({
    messages: state.messages.map((m) =>
      m.id === messageId ? { ...m, ...updates } : m
    ),
  })),

  // 单词详情弹窗
  selectedWord: null,
  setSelectedWord: (word) => set({ selectedWord: word }),

  // 后台管理
  activeAdminTab: 'dashboard',
  setActiveAdminTab: (tab) => set({ activeAdminTab: tab }),

  // Loading
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}))
