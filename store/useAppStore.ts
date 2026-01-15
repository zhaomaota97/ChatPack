import { create } from 'zustand'
import { InventoryWord, Message, Word } from '@/lib/types'

interface AppState {
  // 当前激活的页面
  activePage: string
  setActivePage: (page: string) => void

  // 是否显示管理后台
  isAdminMode: boolean
  setAdminMode: (isAdmin: boolean) => void

  // 用户库存
  inventory: InventoryWord[]
  addToInventory: (word: Word) => void

  // 生词本
  notebook: InventoryWord[]
  addToNotebook: (word: InventoryWord) => void
  removeFromNotebook: (wordText: string) => void

  // 聊天消息
  messages: Message[]
  addMessage: (message: Message) => void
  currentRoom: string
  setCurrentRoom: (room: string) => void

  // 统计数据
  totalPacks: number
  incrementTotalPacks: () => void

  // 单词详情弹窗
  selectedWord: Word | null
  setSelectedWord: (word: Word | null) => void

  // 后台管理页签
  activeAdminTab: string
  setActiveAdminTab: (tab: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  // 页面状态
  activePage: 'pack',
  setActivePage: (page) => set({ activePage: page }),

  // 管理后台
  isAdminMode: false,
  setAdminMode: (isAdmin) => set({ isAdminMode: isAdmin }),

  // 库存
  inventory: [],
  addToInventory: (word) =>
    set((state) => {
      // 检查是否已存在
      if (state.inventory.find((w) => w.word === word.word)) {
        return state
      }
      return {
        inventory: [
          ...state.inventory,
          { ...word, favorite: false, obtainedAt: new Date() },
        ],
      }
    }),

  // 生词本
  notebook: [],
  addToNotebook: (word) =>
    set((state) => {
      if (state.notebook.find((w) => w.word === word.word)) {
        return state
      }
      return { notebook: [...state.notebook, word] }
    }),
  removeFromNotebook: (wordText) =>
    set((state) => ({
      notebook: state.notebook.filter((w) => w.word !== wordText),
    })),

  // 聊天
  messages: [
    {
      user: '张三',
      text: 'Hello everyone!',
      time: '10:00',
      rarity: 'RARE',
    },
    {
      user: '李四',
      text: 'Good morning! How are you?',
      time: '10:02',
      rarity: 'COMMON',
    },
    {
      user: '王五',
      text: 'Beautiful day today!',
      time: '10:05',
      rarity: 'EPIC',
    },
  ],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  currentRoom: '🌱 小学乐园',
  setCurrentRoom: (room) => set({ currentRoom: room }),

  // 统计
  totalPacks: 0,
  incrementTotalPacks: () =>
    set((state) => ({ totalPacks: state.totalPacks + 1 })),

  // 单词详情
  selectedWord: null,
  setSelectedWord: (word) => set({ selectedWord: word }),

  // 后台管理
  activeAdminTab: 'dashboard',
  setActiveAdminTab: (tab) => set({ activeAdminTab: tab }),
}))
