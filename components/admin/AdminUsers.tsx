'use client'

import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import type { User } from '@/lib/types.full'

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true)
      try {
        const result = await adminApi.users.getAll()
        if (result.success && result.data) {
          console.log('加载用户数据:', result.data)
          setUsers(result.data)
        }
      } catch (error) {
        console.error('加载用户失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchText.toLowerCase())
  )

  return (
    <div>
      <h2 className="text-base mb-4">👥 用户管理</h2>

      <div className="mb-4 p-2.5 border border-gray-300">
        <input
          type="text"
          placeholder="搜索用户名或昵称..."
          className="w-[200px] px-2 py-1"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select className="px-2 py-1 ml-2.5">
          <option value="">全部角色</option>
          <option>USER</option>
          <option>ADMIN</option>
        </select>
        <select className="px-2 py-1 ml-2.5">
          <option value="">全部状态</option>
          <option>正常</option>
          <option>封禁</option>
        </select>
        <button className="px-2.5 py-1 mx-0.5 cursor-pointer ml-2.5">搜索</button>
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-500">加载中...</div>
      )}

      {!loading && users.length === 0 && (
        <div className="text-center py-8 text-gray-500">暂无用户数据</div>
      )}

      {!loading && users.length > 0 && (
      <table className="w-full border-collapse mt-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 p-2">用户名</th>
            <th className="border border-gray-300 p-2">昵称</th>
            <th className="border border-gray-300 p-2">角色</th>
            <th className="border border-gray-300 p-2">状态</th>
            <th className="border border-gray-300 p-2">注册时间</th>
            <th className="border border-gray-300 p-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
          <tr key={user.id}>
            <td className="border border-gray-300 p-2">{user.username}</td>
            <td className="border border-gray-300 p-2">{user.username}</td>
            <td className="border border-gray-300 p-2">
              <span className={`inline-block px-2 py-0.5 text-xs rounded ${
                user.role === 'ADMIN' ? 'bg-red-600' : 'bg-green-600'
              } text-white`}>
                {user.role}
              </span>
            </td>
            <td className="border border-gray-300 p-2">{user.isBanned ? '已封禁' : '正常'}</td>
            <td className="border border-gray-300 p-2">{new Date(user.createdAt).toLocaleDateString()}</td>
            <td className="border border-gray-300 p-2">
              <button
                onClick={() => alert('查看详情')}
                className="px-2.5 py-1 mx-0.5 cursor-pointer"
              >
                详情
              </button>
              <button
                onClick={() => alert('赠送卡包')}
                className="px-2.5 py-1 mx-0.5 cursor-pointer"
                disabled={user.role === 'ADMIN'}
              >
                赠送
              </button>
              <button
                onClick={() => alert('封禁')}
                className="px-2.5 py-1 mx-0.5 cursor-pointer"
                disabled={user.role === 'ADMIN'}
              >
                封禁
              </button>
            </td>
          </tr>
          ))}
        </tbody>
      </table>
      )}

      {!loading && users.length > 0 && (
      <p className="mt-4">
        显示 1-{filteredUsers.length} / 总共 {users.length} 条
        <button className="px-2.5 py-1 mx-0.5 cursor-pointer ml-2">上一页</button>
        <button className="px-2.5 py-1 mx-0.5 cursor-pointer">下一页</button>
      </p>
      )}
    </div>
  )
}
