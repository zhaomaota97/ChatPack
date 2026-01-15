'use client'

import { useState, useMemo, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useUserWords } from '@/hooks/useApp'
import { StatItem } from '../common/StatItem'
import { WordCard } from '../common/WordCard'
import type { Rarity } from '@/lib/types.full'

export function InventoryPage() {
  const { userWords } = useAppStore()
  const [rarityFilter, setRarityFilter] = useState<string>('all')
  const [searchText, setSearchText] = useState('')
  const [favoriteOnly, setFavoriteOnly] = useState(false)

  const stats = useMemo(() => {
    return {
      total: userWords.length,
      rare: userWords.filter((w) => w.rarity === 'RARE').length,
      epic: userWords.filter((w) => w.rarity === 'EPIC').length,
      legendary: userWords.filter((w) => w.rarity === 'LEGENDARY').length,
    }
  }, [userWords])

  const filteredWords = useMemo(() => {
    return userWords.filter((w) => {
      const matchesRarity = rarityFilter === 'all' || w.rarity === rarityFilter
      const matchesSearch =
        w.word.toLowerCase().includes(searchText.toLowerCase()) ||
        w.definition.includes(searchText)
      const matchesFavorite = !favoriteOnly || w.isFavorite

      return matchesRarity && matchesSearch && matchesFavorite
    })
  }, [userWords, rarityFilter, searchText, favoriteOnly])

  return (
    <div className="h-full">
      <h1 className="text-xl mb-4 border-b-2 border-gray-800 pb-1">📦 我的单词库存</h1>
      <p className="mb-4">查看和管理已收集的单词</p>

      <div className="grid grid-cols-4 gap-2.5 mb-4">
        <StatItem value={stats.total} label="总单词数" />
        <StatItem value={stats.rare} label="稀有单词" />
        <StatItem value={stats.epic} label="史诗单词" />
        <StatItem value={stats.legendary} label="传说单词" />
      </div>

      <div className="mb-4 p-2.5 border border-gray-300">
        <label className="mr-2.5">
          稀有度:
          <select
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value)}
            className="px-2 py-1 mx-0.5 ml-2"
          >
            <option value="all">全部</option>
            <option value="COMMON">普通</option>
            <option value="RARE">稀有</option>
            <option value="EPIC">史诗</option>
            <option value="LEGENDARY">传说</option>
          </select>
        </label>
        <label className="ml-2.5">
          搜索:
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="输入单词..."
            className="px-2 py-1 mx-0.5 ml-2"
          />
        </label>
        <label className="ml-2.5">
          <input
            type="checkbox"
            checked={favoriteOnly}
            onChange={(e) => setFavoriteOnly(e.target.checked)}
            className="mr-1"
          />
          只看收藏
        </label>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2.5">
        {filteredWords.map((word, index) => (
          <WordCard key={index} word={word} showFavorite={true} />
        ))}
      </div>
    </div>
  )
}
