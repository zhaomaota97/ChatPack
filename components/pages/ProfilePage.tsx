'use client'

import { useAppStore } from '@/store/useAppStore'
import { StatItem } from '../common/StatItem'

export function ProfilePage() {
  const { totalPacks, inventory } = useAppStore()

  return (
    <div className="h-full">
      <h1 className="text-xl mb-4 border-b-2 border-gray-800 pb-1">👤 个人中心</h1>

      <div className="mb-5 border border-gray-300 p-4">
        <h2 className="text-base mb-2.5">用户信息</h2>
        <div className="flex gap-4 items-center mb-5">
          <div className="w-20 h-20 border-2 border-gray-800 flex items-center justify-center text-3xl">
            旅
          </div>
          <div>
            <h3 className="mb-1">旅行者</h3>
            <p className="mb-1">UID: 88888888</p>
            <p className="mb-1">
              邀请码: <strong>ABCD1234</strong>
            </p>
            <p className="text-green-600">● 在线</p>
          </div>
        </div>
        <button className="px-2.5 py-1 mx-0.5 cursor-pointer">编辑资料</button>
      </div>

      <div className="mb-5 border border-gray-300 p-4">
        <h2 className="text-base mb-2.5">📊 统计数据</h2>
        <div className="grid grid-cols-4 gap-2.5">
          <StatItem value={totalPacks} label="累计开包数" />
          <StatItem value={inventory.length} label="收集单词数" />
          <StatItem value={127} label="发送消息数" />
          <StatItem value={356} label="收到鲜花数" />
        </div>
      </div>

      <div className="mb-5 border border-gray-300 p-4">
        <h2 className="text-base mb-2.5">⚙️ 账号设置</h2>
        <p className="mb-2">
          <label>
            昵称: <input type="text" defaultValue="旅行者" className="px-2 py-1 ml-2" />
          </label>
        </p>
        <p className="mb-2">
          <label>
            邮箱:{' '}
            <input
              type="email"
              defaultValue="traveler@example.com"
              className="px-2 py-1 ml-2"
            />
          </label>
        </p>
        <p>
          <button className="px-2.5 py-1 mx-0.5 cursor-pointer">保存修改</button>
        </p>
      </div>

      <div className="mb-5 border border-gray-300 p-4">
        <h2 className="text-base mb-2.5">🎁 邀请好友</h2>
        <p className="mb-2">分享你的邀请码，邀请好友加入！</p>
        <p className="mb-2">
          我的邀请码: <strong>ABCD1234</strong>
          <button
            onClick={() => alert('已复制到剪贴板')}
            className="px-2.5 py-1 mx-0.5 cursor-pointer ml-2"
          >
            复制
          </button>
        </p>
        <p>
          已邀请: <strong>3</strong> 人
        </p>
      </div>
    </div>
  )
}
