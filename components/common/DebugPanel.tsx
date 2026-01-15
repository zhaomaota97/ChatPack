'use client'

import { useAppStore } from '@/store/useAppStore'
import { useEffect, useState } from 'react'

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const store = useAppStore()

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded shadow-lg z-[9999]"
      >
        🐛 调试
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-[400px] max-h-[600px] bg-white border-2 border-purple-600 rounded shadow-2xl z-[9999] overflow-hidden">
      <div className="bg-purple-600 text-white p-3 flex justify-between items-center">
        <strong>🐛 Store 状态</strong>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-purple-700 px-2 rounded"
        >
          ✕
        </button>
      </div>
      
      <div className="p-4 overflow-y-auto max-h-[500px] text-sm">
        <div className="mb-3">
          <strong className="text-blue-600">👤 用户信息</strong>
          <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
            {store.user ? JSON.stringify({
              id: store.user.id,
              username: store.user.username,
              role: store.user.role,
              inviteCode: store.user.inviteCode
            }, null, 2) : '未登录'}
          </pre>
        </div>

        <div className="mb-3">
          <strong className="text-green-600">🎴 用户卡包 ({store.userPacks.length})</strong>
          <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
            {store.userPacks.length > 0 
              ? JSON.stringify(store.userPacks, null, 2)
              : '空数组 - 需要赠送卡包'}
          </pre>
        </div>

        <div className="mb-3">
          <strong className="text-orange-600">🎁 可用卡包 ({store.availablePacks.length})</strong>
          <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
            {store.availablePacks.length > 0 
              ? JSON.stringify(store.availablePacks.map(p => ({
                  id: p.id,
                  name: p.name,
                  packType: p.packType
                })), null, 2)
              : '空数组 - 需要运行 seed_data.sql'}
          </pre>
        </div>

        <div className="mb-3">
          <strong className="text-purple-600">📚 用户单词 ({store.userWords.length})</strong>
          <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
            {store.userWords.length > 0 
              ? JSON.stringify(store.userWords.slice(0, 3).map(w => ({
                  word: w.word,
                  rarity: w.rarity,
                  isFavorite: w.isFavorite
                })), null, 2) + `\n... 共 ${store.userWords.length} 个`
              : '空数组 - 需要开包获取单词'}
          </pre>
        </div>

        <div className="mb-3">
          <strong className="text-red-600">💬 聊天室 ({store.rooms.length})</strong>
          <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
            {store.rooms.length > 0 
              ? JSON.stringify(store.rooms.map(r => ({
                  id: r.id,
                  name: r.name,
                  emoji: r.emoji
                })), null, 2)
              : '空数组 - 需要运行 seed_data.sql'}
          </pre>
        </div>

        <div className="mb-3">
          <strong className="text-indigo-600">💭 消息 ({store.messages.length})</strong>
          <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
            {store.messages.length > 0 
              ? JSON.stringify(store.messages.slice(0, 2), null, 2)
              : '空数组'}
          </pre>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded text-xs">
          <strong>💡 诊断提示：</strong>
          <ul className="mt-2 space-y-1 ml-4 list-disc">
            {store.availablePacks.length === 0 && (
              <li className="text-red-600">需要在 Supabase 运行 seed_data.sql</li>
            )}
            {store.userPacks.length === 0 && (
              <li className="text-orange-600">需要管理员赠送卡包</li>
            )}
            {store.userWords.length === 0 && (
              <li className="text-blue-600">需要开包获取单词</li>
            )}
            {store.availablePacks.length > 0 && store.userPacks.length > 0 && store.userWords.length === 0 && (
              <li className="text-green-600">可以开包了！</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
