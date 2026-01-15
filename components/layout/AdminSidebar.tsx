'use client'

import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

export function AdminSidebar() {
  const { activeAdminTab, setActiveAdminTab, setAdminMode } = useAppStore()

  const adminMenuItems = [
    { id: 'dashboard', label: '📊 数据统计' },
    { id: 'words', label: '📝 单词管理' },
    { id: 'wordbooks', label: '📚 单词书管理' },
    { id: 'rooms', label: '💬 聊天室管理' },
    { id: 'users', label: '👥 用户管理' },
    { id: 'packs', label: '🎴 卡包管理' },
    { id: 'settings', label: '⚙️ 系统设置' },
  ]

  return (
    <div className="w-[150px] border border-gray-300 p-2.5">
      <h3 className="text-red-400 mb-2.5">后台管理</h3>
      <hr className="my-2.5" />
      {adminMenuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveAdminTab(item.id)}
          className={cn(
            'w-full mb-1 p-2 cursor-pointer',
            activeAdminTab === item.id ? 'bg-blue-600 text-white' : ''
          )}
        >
          {item.label}
        </button>
      ))}
      <hr className="my-2.5" />
      <button
        onClick={() => setAdminMode(false)}
        className="w-full p-2 cursor-pointer bg-blue-600 text-white"
      >
        ← 返回前台
      </button>
    </div>
  )
}
