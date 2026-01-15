'use client'

import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import type { Wordbook } from '@/lib/types.full'

export function AdminWordbooks() {
  const [wordbooks, setWordbooks] = useState<Wordbook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadWordbooks = async () => {
      setLoading(true)
      try {
        const result = await adminApi.wordbooks.getAll()
        if (result.success && result.data) {
          console.log('加载单词书数据:', result.data)
          setWordbooks(result.data)
        }
      } catch (error) {
        console.error('加载单词书失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadWordbooks()
  }, [])

  return (
    <div>
      <h2 className="text-base mb-4">📚 单词书管理</h2>

      {loading && (
        <div className="text-center py-8 text-gray-500">加载中...</div>
      )}

      {!loading && wordbooks.length === 0 && (
        <div className="text-center py-8 text-gray-500">暂无单词书数据</div>
      )}

      {!loading && wordbooks.length > 0 && (
      <div className="grid grid-cols-3 gap-2.5">
        {wordbooks.map((book) => (
          <div key={book.id} className="border border-gray-300 p-4">
            <h3 className="mb-2">{book.name}</h3>
            <p className="mb-1">{book.name}</p>
            <p className="mb-1">
              单词数: <strong>{book.wordCount || 0}</strong>
            </p>
            <p className="mb-2">
              状态:{' '}
              <label>
                <input type="checkbox" checked={book.isActive} readOnly className="mr-1" /> 启用
              </label>
            </p>
            <button
              onClick={() => alert('管理单词')}
              className="px-2.5 py-1 mx-0.5 cursor-pointer"
            >
              管理单词
            </button>
            <button
              onClick={() => alert('编辑')}
              className="px-2.5 py-1 mx-0.5 cursor-pointer"
            >
              编辑
            </button>
          </div>
        ))}
      </div>
      )}
    </div>
  )
}
