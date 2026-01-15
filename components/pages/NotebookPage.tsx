'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { RarityBadge } from '../common/RarityBadge'

export function NotebookPage() {
  const { notebook, removeFromNotebook, setSelectedWord } = useAppStore()
  const [sortBy, setSortBy] = useState<string>('time')
  const [searchText, setSearchText] = useState('')

  const sortedNotebook = useMemo(() => {
    let sorted = [...notebook]

    if (sortBy === 'alpha') {
      sorted.sort((a, b) => a.word.localeCompare(b.word))
    } else if (sortBy === 'rarity') {
      const order = { LEGENDARY: 0, EPIC: 1, RARE: 2, COMMON: 3 }
      sorted.sort((a, b) => order[a.rarity] - order[b.rarity])
    }

    if (searchText) {
      sorted = sorted.filter(
        (w) =>
          w.word.toLowerCase().includes(searchText.toLowerCase()) ||
          w.meaning.includes(searchText)
      )
    }

    return sorted
  }, [notebook, sortBy, searchText])

  return (
    <div className="h-full">
      <h1 className="text-xl mb-4 border-b-2 border-gray-800 pb-1">📖 生词本</h1>
      <p className="mb-4">收藏的生词和学习笔记</p>

      <div className="mb-4 p-2.5 border border-gray-300">
        <button
          onClick={() => alert('添加当前查看的单词到生词本')}
          className="px-2.5 py-1 mx-0.5 cursor-pointer"
        >
          ➕ 添加生词
        </button>
        <label className="ml-2.5">
          排序:
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2 py-1 mx-0.5 ml-2"
          >
            <option value="time">添加时间</option>
            <option value="alpha">字母顺序</option>
            <option value="rarity">稀有度</option>
          </select>
        </label>
        <label className="ml-2.5">
          搜索:
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="搜索生词..."
            className="px-2 py-1 mx-0.5 ml-2"
          />
        </label>
      </div>

      <p className="my-4">
        生词总数: <strong>{notebook.length}</strong>
      </p>

      <div>
        {sortedNotebook.length === 0 ? (
          <p className="text-gray-500">暂无生词，在词汇库或我的单词中点击"加入生词本"</p>
        ) : (
          sortedNotebook.map((word, index) => (
            <div key={index} className="border border-gray-300 p-2.5 mb-2.5">
              <h3 className="inline-block mr-2">{word.word}</h3>
              <RarityBadge rarity={word.rarity} />
              <p className="my-1">{word.meaning}</p>
              <p className="text-xs text-gray-500">
                添加时间: {word.obtainedAt ? new Date(word.obtainedAt).toLocaleString() : '未知'}
              </p>
              <button
                onClick={() => removeFromNotebook(word.word)}
                className="px-2.5 py-1 mx-0.5 cursor-pointer mt-2"
              >
                移除
              </button>
              <button
                onClick={() => setSelectedWord(word)}
                className="px-2.5 py-1 mx-0.5 cursor-pointer"
              >
                查看详情
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
