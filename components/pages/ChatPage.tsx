'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { RarityBadge } from '../common/RarityBadge'
import { cn } from '@/lib/utils'

const rooms = [
  '🌱 小学乐园',
  '🌿 初中世界',
  '🌳 高中殿堂',
  '🎓 四级广场',
  '🏆 六级天地',
  '👑 考研领域',
]

export function ChatPage() {
  const { messages, addMessage, currentRoom, setCurrentRoom } = useAppStore()
  const [inputText, setInputText] = useState('')

  const handleSendMessage = () => {
    if (!inputText.trim()) return

    const now = new Date()
    addMessage({
      user: '旅行者',
      text: inputText,
      time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
      rarity: 'LEGENDARY',
    })
    setInputText('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
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
          {rooms.map((room) => (
            <div
              key={room}
              onClick={() => setCurrentRoom(room)}
              className={cn(
                'p-2 mb-1 cursor-pointer border border-gray-300',
                currentRoom === room ? 'bg-blue-600 text-white' : ''
              )}
            >
              {room}
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col">
          <div className="p-2.5 border border-gray-300 mb-2.5">
            <strong>{currentRoom}</strong>
            <span className="ml-5 text-gray-500">在线: 142人</span>
          </div>

          <div className="flex-1 border border-gray-300 p-2.5 overflow-y-auto mb-2.5">
            {messages.map((msg, index) => (
              <div key={index} className="mb-4 p-2.5 border-l-4 border-blue-600">
                <div className="text-xs text-gray-500 mb-1">
                  <strong>{msg.user}</strong>
                  <RarityBadge rarity={msg.rarity} className="ml-2" />
                  <span className="ml-2.5 text-gray-400">{msg.time}</span>
                </div>
                <div>{msg.text}</div>
                <div className="mt-1">
                  <button
                    onClick={() => alert('送花+1')}
                    className="px-2.5 py-1 mx-0.5 cursor-pointer text-sm"
                  >
                    🌸 送花
                  </button>
                  <button
                    onClick={() => alert('回复功能')}
                    className="px-2.5 py-1 mx-0.5 cursor-pointer text-sm"
                  >
                    ↩️ 回复
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
            />
            <button onClick={handleSendMessage} className="px-2.5 py-1 cursor-pointer">
              发送
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
