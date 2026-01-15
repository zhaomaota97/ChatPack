'use client'

import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import type { Pack } from '@/lib/types.full'

export function AdminPacks() {
  const [packs, setPacks] = useState<Pack[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPacks = async () => {
      setLoading(true)
      try {
        const result = await adminApi.packs.getAll()
        if (result.success && result.data) {
          console.log('加载卡包数据:', result.data)
          setPacks(result.data)
        }
      } catch (error) {
        console.error('加载卡包失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPacks()
  }, [])

  return (
    <div>
      <h2 className="text-base mb-4">🎴 卡包管理</h2>

      <div className="mb-4">
        <button
          onClick={() => alert('创建卡包')}
          className="px-2.5 py-1 mx-0.5 cursor-pointer"
        >
          ➕ 创建卡包
        </button>
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-500">加载中...</div>
      )}

      {!loading && packs.length === 0 && (
        <div className="text-center py-8 text-gray-500">暂无卡包数据</div>
      )}

      {!loading && packs.length > 0 && (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2.5">
        {packs.map((pack) => (
          <div key={pack.id} className="border border-gray-300 p-4">
            <h3 className="mb-2">{pack.name}</h3>
            <p className="mb-1">稀有度配置: {pack.rarityWeights ? '自定义' : '默认'}</p>
            <p className="mb-1">
              卡片数量: <strong>{pack.cardCount}</strong>
            </p>
            <p className="mb-1">
              总开包数: <strong>-</strong>
            </p>
            <p className="mb-2">
              状态:{' '}
              <label>
                <input type="checkbox" checked={pack.isActive} readOnly className="mr-1" /> 启用
              </label>
            </p>
            <button
              onClick={() => alert('编辑')}
              className="px-2.5 py-1 mx-0.5 cursor-pointer"
            >
              编辑
            </button>
            <button
              onClick={() => alert('查看统计')}
              className="px-2.5 py-1 mx-0.5 cursor-pointer"
            >
              统计
            </button>
            <button
              onClick={() => alert('删除')}
              className="px-2.5 py-1 mx-0.5 cursor-pointer"
            >
              删除
            </button>
          </div>
        ))}
      </div>
      )}
    </div>
  )
}
