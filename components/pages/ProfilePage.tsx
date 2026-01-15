'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { StatItem } from '../common/StatItem'
import { authApi } from '@/lib/api'
import { useRouter } from 'next/navigation'

export function ProfilePage() {
  const { user, userWords } = useAppStore()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)

  const handleLogout = async () => {
    if (!confirm('确定要退出登录吗？')) return
    
    try {
      await authApi.logout()
      router.push('/login')
    } catch (error) {
      alert('退出失败')
    }
  }

  const handleCopyInviteCode = () => {
    if (user?.inviteCode) {
      navigator.clipboard.writeText(user.inviteCode)
      alert('已复制到剪贴板')
    }
  }

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <h1 className="text-xl mb-4 border-b-2 border-gray-800 pb-1">👤 个人中心</h1>

      <div className="mb-5 border border-gray-300 p-4">
        <h2 className="text-base mb-2.5">用户信息</h2>
        <div className="flex gap-4 items-center mb-5">
          <div className="w-20 h-20 border-2 border-gray-800 flex items-center justify-center text-3xl">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="mb-1">{user.username}</h3>
            <p className="mb-1">UID: {user.id}</p>
            <p className="mb-1">
              邀请码: <strong>{user.inviteCode}</strong>
            </p>
            <p className="text-green-600">● {user.role === 'ADMIN' ? '管理员' : '用户'}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="px-2.5 py-1 mx-0.5 cursor-pointer bg-red-500 text-white"
        >
          退出登录
        </button>
      </div>

      <div className="mb-5 border border-gray-300 p-4">
        <h2 className="text-base mb-2.5">📊 统计数据</h2>
        <div className="grid grid-cols-4 gap-2.5">
          <StatItem value={user.totalPacksOpened || 0} label="累计开包数" />
          <StatItem value={userWords.length} label="收集单词数" />
          <StatItem value={user.totalMessages || 0} label="发送消息数" />
          <StatItem value={user.totalRoses || 0} label="收到鲜花数" />
        </div>
      </div>

      <div className="mb-5 border border-gray-300 p-4">
        <h2 className="text-base mb-2.5">🎁 邀请好友</h2>
        <p className="mb-2">分享你的邀请码，邀请好友加入！</p>
        <p className="mb-2">
          我的邀请码: <strong>{user.inviteCode}</strong>
          <button
            onClick={handleCopyInviteCode}
            className="px-2.5 py-1 mx-0.5 cursor-pointer ml-2"
          >
            复制
          </button>
        </p>
      </div>
    </div>
  )
}
