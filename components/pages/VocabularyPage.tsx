'use client'

import { useState, useMemo, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useUserWords } from '@/hooks/useApp'
import { adminApi } from '@/lib/api'
import { StatItem } from '../common/StatItem'
import { WordCard } from '../common/WordCard'

export function VocabularyPage() {
  const { userWords } = useAppStore()
  const [bookFilter, setBookFilter] = useState<string>('all')
  const [rarityFilter, setRarityFilter] = useState<string>('all')
  const [searchText, setSearchText] = useState('')
  const [unownedOnly, setUnownedOnly] = useState(false)
  const [totalWords, setTotalWords] = useState(0)

  useEffect(() => {
    // 加载总词汇数
    const loadTotalWords = async () => {
      try {
        const result = await adminApi.words.getAll()
        if (result.success && result.data) {
          setTotalWords(result.data.length)
        }
      } catch (error) {
        console.error('加载总词汇数失败:', error)
      }
    }

    loadTotalWords()
  }, [])

  const ownedWords = userWords.length
  const progress = totalWords > 0 ? ((ownedWords / totalWords) * 100).toFixed(1) : '0'

  const filteredWords = useMemo(() => {
    return userWords.filter((w) => {
      const matchesRarity = rarityFilter === 'all' || w.rarity === rarityFilter
      const matchesSearch =
        w.word.toLowerCase().includes(searchText.toLowerCase()) ||
        w.definition.includes(searchText)

      return matchesRarity && matchesSearch
    })
  }, [userWords, rarityFilter, searchText])

  return (
    <div className="h-full">
      <h1 className="text-xl mb-4 border-b-2 border-gray-800 pb-1">📚 词汇库</h1>
      <p className="mb-4">浏览所有可收集的单词（包括未获得的）</p>

      <div className="mb-4 p-2.5 border border-gray-300">
        <label className="mr-2.5">
          单词书:
          <select
            value={bookFilter}
            onChange={(e) => setBookFilter(e.target.value)}
            className="px-2 py-1 mx-0.5 ml-2"
          >
            <option value="all">全部</option>
            <option value="primary">小学词汇</option>
            <option value="middle">初中词汇</option>
            <option value="high">高中词汇</option>
            <option value="cet4">四级词汇</option>
            <option value="cet6">六级词汇</option>
            <option value="kaoyan">考研词汇</option>
          </select>
        </label>
        <label className="ml-2.5">
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
            checked={unownedOnly}
            onChange={(e) => setUnownedOnly(e.target.checked)}
            className="mr-1"
          />
          只看未获得
        </label>
      </div>

      <div className="grid grid-cols-4 gap-2.5 mb-4">
        <StatItem value={totalWords} label="词汇库总数" />
        <StatItem value={ownedWords} label="已收集" />
        <StatItem value={`${progress}%`} label="收集进度" />
        <StatItem value={filteredWords.length} label="当前筛选结果" />
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2.5">
        {filteredWords.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">暂无单词数据</div>
        ) : (
          filteredWords.map((word) => (
            <WordCard key={word.userWordId} word={word} isOwned={true} />
          ))
        )}
      </div>
    </div>
  )
}
