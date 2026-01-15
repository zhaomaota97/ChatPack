'use client'

import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { activePage, setActivePage, setAdminMode, user } = useAppStore()

  const menuItems = [
    { id: 'pack', label: '🎴 卡包', icon: '🎴' },
    { id: 'chat', label: '💬 聊天室', icon: '💬' },
    { id: 'inventory', label: '📦 我的单词', icon: '📦' },
    { id: 'vocabulary', label: '📚 词汇库', icon: '📚' },
    { id: 'notebook', label: '📖 生词本', icon: '📖' },
    { id: 'profile', label: '👤 个人中心', icon: '👤' },
  ]

  return (
    <div className="w-[150px] border border-gray-300 p-2.5">
      <h3 className="mb-2.5">ChatPack</h3>
      <hr className="my-2.5" />
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActivePage(item.id)}
          className={cn(
            'w-full mb-1 p-2 cursor-pointer',
            activePage === item.id ? 'bg-blue-600 text-white' : ''
          )}
        >
          {item.label}
        </button>
      ))}
      <hr className="my-2.5" />
      {user?.role === 'ADMIN' && (
        <button
          onClick={() => setAdminMode(true)}
          className="w-full p-2 cursor-pointer bg-red-400 text-white"
        >
          ⚙️ 后台管理
        </button>
      )}
    </div>
  )
}
