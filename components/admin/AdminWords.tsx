'use client'

import { useState, useEffect } from 'react'
import { RarityBadge } from '../common/RarityBadge'
import { adminApi } from '@/lib/api'
import type { Word } from '@/lib/types.full'

export function AdminWords() {
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    const loadWords = async () => {
      setLoading(true)
      try {
        const result = await adminApi.words.getAll()
        if (result.success && result.data) {
          console.log('加载单词数据:', result.data)
          setWords(result.data)
        }
      } catch (error) {
        console.error('加载单词失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadWords()
  }, [])

  const filteredWords = words.filter(w => 
    w.word.toLowerCase().includes(searchText.toLowerCase()) ||
    w.definition.includes(searchText)
  )

  return (
    <div>
      <h2 className="text-base mb-4">📝 单词管理</h2>

      <div className="mb-4">
        <button
          onClick={() => alert('打开添加单词对话框')}
          className="px-2.5 py-1 mx-0.5 cursor-pointer"
        >
          ➕ 添加单词
        </button>
        <button
          onClick={() => alert('打开批量导入对话框')}
          className="px-2.5 py-1 mx-0.5 cursor-pointer ml-1"
        >
          📥 批量导入
        </button>
        <button
          onClick={() => alert('下载模板')}
          className="px-2.5 py-1 mx-0.5 cursor-pointer ml-1"
        >
          📄 下载模板
        </button>
      </div>

      <div className="mb-4 p-2.5 border border-gray-300">
        <input
          type="text"
          placeholder="搜索单词或释义..."
          className="w-[200px] px-2 py-1"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select className="px-2 py-1 ml-2.5">
          <option value="">全部稀有度</option>
          <option>COMMON</option>
          <option>RARE</option>
          <option>EPIC</option>
          <option>LEGENDARY</option>
        </select>
        <select className="px-2 py-1 ml-2.5">
          <option value="">全部单词书</option>
          <option>小学词汇</option>
          <option>初中词汇</option>
          <option>高中词汇</option>
        </select>
        <button className="px-2.5 py-1 mx-0.5 cursor-pointer ml-2.5">搜索</button>
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-500">加载中...</div>
      )}

      {!loading && words.length === 0 && (
        <div className="text-center py-8 text-gray-500">暂无单词数据</div>
      )}

      {!loading && words.length > 0 && (
      <table className="w-full border-collapse mt-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 p-2">单词</th>
            <th className="border border-gray-300 p-2">释义</th>
            <th className="border border-gray-300 p-2">音标</th>
            <th className="border border-gray-300 p-2">稀有度</th>
            <th className="border border-gray-300 p-2">所属单词书</th>
            <th className="border border-gray-300 p-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {filteredWords.map((word) => (
          <tr key={word.id}>
            <td className="border border-gray-300 p-2">{word.word}</td>
            <td className="border border-gray-300 p-2">{word.definition}</td>
            <td className="border border-gray-300 p-2">{word.pronunciation || '-'}</td>
            <td className="border border-gray-300 p-2">
              <RarityBadge rarity={word.rarity} />
            </td>
            <td className="border border-gray-300 p-2">-</td>
            <td className="border border-gray-300 p-2">
              <button
                onClick={() => alert('编辑')}
                className="px-2.5 py-1 mx-0.5 cursor-pointer"
              >
                编辑
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

      {!loading && words.length > 0 && (
      <p className="mt-4">
        显示 1-{filteredWords.length} / 总共 {words.length} 条
        <button className="px-2.5 py-1 mx-0.5 cursor-pointer ml-2">上一页</button>
        <button className="px-2.5 py-1 mx-0.5 cursor-pointer">下一页</button>
      </p>
      )}
    </div>
  )
}
