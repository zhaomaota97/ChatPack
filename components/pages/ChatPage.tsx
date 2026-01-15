'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useChatRoom, useRealtimeMessages } from '@/hooks/useApp'
import { RarityBadge } from '../common/RarityBadge'
import { cn } from '@/lib/utils'
import { messageApi } from '@/lib/api'

export function ChatPage() {
  const { user, rooms, messages, currentRoom, setCurrentRoom } = useAppStore()
  const { loading: roomsLoading, selectRoom } = useChatRoom()
  useRealtimeMessages()
  
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)

  const handleSelectRoom = async (roomId: string) => {
    await selectRoom(roomId)
  }

  const handleSendMessage = async () => {
    if (!inputText.trim() || !currentRoom || sending) return

    setSending(true)
    try {
      await messageApi.send({
        roomId: currentRoom,
        content: inputText.trim()
      })
      setInputText('')
    } catch (error: any) {
      alert(error?.error?.message || '发送失败')
    } finally {
      setSending(false)
    }
  }

  const handleRose = async (messageId: string) => {
    try {
      await messageApi.rose(messageId)
    } catch (error: any) {
      alert(error?.error?.message || '送花失败')
    }
  }

  const handleUnrose = async (messageId: string) => {
    try {
      await messageApi.unrose(messageId)
    } catch (error: any) {
      alert(error?.error?.message || '取消送花失败')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-xl mb-4 border-b-2 border-gray-800 pb-1">💬 聊天室</h1>
      <p className="mb-4">使用已收集的单词和符号进行交流</p>

      <div className="flex gap-2.5 flex-1">
        <div className="w-[200px] border border-gray-300 p-2.5 overflow-y-auto">
          <h3 className="mb-2">聊天室列表</h3>
          {roomsLoading && <div className="text-gray-500 text-sm">加载中...</div>}
          {rooms.map((room) => (
            <div
              key={room.id}
              onClick={() => handleSelectRoom(room.id)}
              className={cn(
                'p-2 mb-1 cursor-pointer border border-gray-300',
                currentRoom === room.id ? 'bg-blue-600 text-white' : ''
              )}
            >
              {room.emoji} {room.name}
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col">
          <div className="p-2.5 border border-gray-300 mb-2.5">
            <strong>
              {rooms.find(r => r.id === currentRoom)?.name || '选择聊天室'}
            </strong>
            <span className="ml-5 text-gray-500">
              在线: {rooms.find(r => r.id === currentRoom)?.onlineCount || 0}人
            </span>
          </div>

          <div className="flex-1 border border-gray-300 p-2.5 overflow-y-auto mb-2.5">
            {messages.length === 0 && (
              <div className="text-gray-500 text-center py-8">暂无消息</div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className="mb-4 p-2.5 border-l-4 border-blue-600">
                <div className="text-xs text-gray-500 mb-1">
                  <strong>{msg.username}</strong>
                  <RarityBadge rarity={msg.userRarity} className="ml-2" />
                  <span className="ml-2.5 text-gray-400">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div>{msg.content}</div>
                <div className="mt-1">
                  <button
                    onClick={() => msg.isRosedByMe ? handleUnrose(msg.id) : handleRose(msg.id)}
                    className={cn(
                      "px-2.5 py-1 mx-0.5 cursor-pointer text-sm",
                      msg.isRosedByMe ? "bg-pink-100" : ""
                    )}
                    disabled={msg.userId === user?.id}
                  >
                    🌸 送花 ({msg.roseCount})
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息... (只能使用已收集的单词和符号)"
              className="flex-1 px-2 py-1"
              disabled={!currentRoom || sending}
            />
            <button 
              onClick={handleSendMessage} 
              className="px-2.5 py-1 cursor-pointer"
              disabled={!currentRoom || sending}
            >
              {sending ? '发送中...' : '发送'}
            </button>
          </div>

          <p className="mt-1 text-xs text-gray-500">
            提示: 发送前会检查是否所有单词都已收集
          </p>
        </div>
      </div>
    </div>
  )
}
