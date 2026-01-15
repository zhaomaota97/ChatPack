'use client'

import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import type { Room } from '@/lib/types.full'

export function AdminRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRooms = async () => {
      setLoading(true)
      try {
        const result = await adminApi.rooms.getAll()
        if (result.success && result.data) {
          console.log('加载聊天室数据:', result.data)
          setRooms(result.data)
        }
      } catch (error) {
        console.error('加载聊天室失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRooms()
  }, [])

  return (
    <div>
      <h2 className="text-base mb-4">💬 聊天室管理</h2>

      <div className="mb-4">
        <button
          onClick={() => alert('创建聊天室')}
          className="px-2.5 py-1 mx-0.5 cursor-pointer"
        >
          ➕ 创建聊天室
        </button>
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-500">加载中...</div>
      )}

      {!loading && rooms.length === 0 && (
        <div className="text-center py-8 text-gray-500">暂无聊天室数据</div>
      )}

      {!loading && rooms.length > 0 && (
      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 p-2">名称</th>
            <th className="border border-gray-300 p-2">关联单词书</th>
            <th className="border border-gray-300 p-2">描述</th>
            <th className="border border-gray-300 p-2">在线人数</th>
            <th className="border border-gray-300 p-2">状态</th>
            <th className="border border-gray-300 p-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
          <tr key={room.id}>
            <td className="border border-gray-300 p-2">{room.name}</td>
            <td className="border border-gray-300 p-2">-</td>
            <td className="border border-gray-300 p-2">{room.description || '-'}</td>
            <td className="border border-gray-300 p-2">0</td>
            <td className="border border-gray-300 p-2">
              <label>
                <input type="checkbox" checked={room.isActive} readOnly className="mr-1" /> 启用
              </label>
            </td>
            <td className="border border-gray-300 p-2">
              <button
                onClick={() => alert('编辑')}
                className="px-2.5 py-1 mx-0.5 cursor-pointer"
              >
                编辑
              </button>
              <button
                onClick={() => alert('配置单词书')}
                className="px-2.5 py-1 mx-0.5 cursor-pointer"
              >
                配置单词书
              </button>
              <button
                onClick={() => alert('删除')}
                className="px-2.5 py-1 mx-0.5 cursor-pointer"
              >
                删除
              </button>
            </td>
          </tr>
          ))}
        </tbody>
      </table>
      )}
    </div>
  )
}
