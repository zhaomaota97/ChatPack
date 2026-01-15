'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { authApi, userApi, packApi, roomApi } from '@/lib/api'

/**
 * 初始化应用数据的Hook
 * 在应用启动时加载用户信息、卡包、聊天室等数据
 */
export function useInitApp() {
  const { setUser, setUserPacks, setAvailablePacks, setRooms, setUserWords, setAdminMode, setLoading } = useAppStore()

  useEffect(() => {
    const initApp = async () => {
      setLoading(true)
      try {
        console.log('🚀 开始初始化应用...')
        
        // 获取当前用户信息
        const userResult = await authApi.getMe()
        console.log('👤 用户信息:', userResult)
        
        if (userResult.success && userResult.data) {
          setUser(userResult.data)
          setAdminMode(userResult.data.role === 'ADMIN')
          
          // 获取用户卡包库存
          const packsResult = await userApi.getPacks()
          console.log('📦 用户卡包:', packsResult)
          if (packsResult.success && packsResult.data) {
            setUserPacks(packsResult.data)
          }
          
          // 获取用户单词库存
          const wordsResult = await userApi.getWords()
          console.log('📚 用户单词:', wordsResult)
          if (wordsResult.success && wordsResult.data) {
            setUserWords(wordsResult.data.items)
          }
        }

        // 获取所有可用卡包
        const availablePacksResult = await packApi.getAll()
        console.log('🎁 可用卡包:', availablePacksResult)
        if (availablePacksResult.success && availablePacksResult.data) {
          setAvailablePacks(availablePacksResult.data)
        }

        // 获取聊天室列表
        const roomsResult = await roomApi.getAll()
        console.log('💬 聊天室列表:', roomsResult)
        if (roomsResult.success && roomsResult.data) {
          setRooms(roomsResult.data)
        }
        
        console.log('✅ 应用初始化完成')
      } catch (error) {
        console.error('❌ 初始化应用失败:', error)
      } finally {
        setLoading(false)
      }
    }

    initApp()
  }, [setUser, setUserPacks, setAvailablePacks, setRooms, setUserWords, setAdminMode, setLoading])
}

/**
 * 获取用户单词库存
 */
export function useUserWords() {
  const { userWords, setUserWords, setLoading } = useAppStore()

  const loadWords = async (params?: { page?: number; search?: string; rarity?: string; favorited?: boolean }) => {
    setLoading(true)
    try {
      const result = await userApi.getWords(params)
      if (result.success && result.data) {
        setUserWords(result.data.items)
        return result.data
      }
    } catch (error) {
      console.error('获取单词失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return { userWords, loadWords, loading: false }
}

/**
 * 开包Hook
 */
export function useOpenPack() {
  const { updatePackCount, addUserWord, setLoading } = useAppStore()

  const openPack = async (packId: string) => {
    setLoading(true)
    try {
      const result = await packApi.open(packId)
      if (result.success && result.data) {
        // 更新卡包数量（减1）
        // 注意：这里需要先获取当前数量，实际应该由API返回或从store获取
        
        // 添加新单词到库存
        result.data.words.forEach((word) => {
          if (word.isNew) {
            // 这里需要转换格式
            addUserWord({
              userId: '', // 会从user中获取
              wordId: word.id,
              word: word,
              isFavorited: false,
              obtainedAt: new Date().toISOString(),
            })
          }
        })

        return result.data
      }
    } catch (error) {
      console.error('开包失败:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { openPack }
}

/**
 * 聊天室Hook
 */
export function useChatRoom(roomId: string | null) {
  const { messages, setMessages, addMessage, currentRoom, setLoading } = useAppStore()

  // 加载消息
  const loadMessages = async () => {
    if (!roomId) return

    setLoading(true)
    try {
      const result = await roomApi.getMessages(roomId)
      if (result.success && result.data) {
        setMessages(result.data)
      }
    } catch (error) {
      console.error('获取消息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 发送消息
  const sendMessage = async (content: string, replyToId?: string) => {
    if (!roomId) return

    try {
      const result = await roomApi.sendMessage(roomId, { content, replyToId })
      if (result.success && result.data) {
        addMessage(result.data)
        return result.data
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      throw error
    }
  }

  useEffect(() => {
    if (roomId) {
      loadMessages()
    }
  }, [roomId])

  return { messages, loadMessages, sendMessage }
}

/**
 * Realtime订阅Hook
 */
export function useRealtimeMessages(roomId: string | null) {
  const { addMessage, updateMessage } = useAppStore()

  useEffect(() => {
    if (!roomId) return

    // 订阅消息
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          // 获取用户信息并添加消息
          const message = payload.new as any
          // 这里需要获取用户信息，简化处理直接添加
          addMessage({
            id: message.id,
            roomId: message.room_id,
            userId: message.user_id,
            user: {
              id: message.user_id,
              username: 'User', // 实际应该从API获取
              nickname: undefined,
              avatar: undefined,
            },
            content: message.content,
            roses: message.roses,
            timestamp: message.timestamp,
            replyToId: message.reply_to_id,
            hasRosed: false,
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const message = payload.new as any
          updateMessage(message.id, {
            roses: message.roses,
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId, addMessage, updateMessage])
}

// 导入supabase客户端
import { supabase } from '@/lib/supabase'
