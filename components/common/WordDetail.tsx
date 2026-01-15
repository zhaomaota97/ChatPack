'use client'

import { useAppStore } from '@/store/useAppStore'
import { RarityBadge } from './RarityBadge'
import { userApi } from '@/lib/api'
import { useState } from 'react'

export function WordDetail() {
  const { selectedWord, setSelectedWord, userWords, setUserWords } = useAppStore()
  const [updating, setUpdating] = useState(false)

  if (!selectedWord) return null

  const handleToggleFavorite = async () => {
    if (updating) return
    
    setUpdating(true)
    try {
      const newFavoriteState = !selectedWord.isFavorite
      await userApi.toggleFavorite(selectedWord.userWordId, newFavoriteState)
      
      // Update local state
      setUserWords(
        userWords.map(w => 
          w.userWordId === selectedWord.userWordId 
            ? { ...w, isFavorite: newFavoriteState }
            : w
        )
      )
      
      // Update selected word
      setSelectedWord({ ...selectedWord, isFavorite: newFavoriteState })
      
      alert(newFavoriteState ? '已加入生词本' : '已从生词本移除')
    } catch (error: any) {
      alert(error?.error?.message || '操作失败')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[999]"
        onClick={() => setSelectedWord(null)}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-gray-800 p-5 min-w-[300px] shadow-lg z-[1000]">
        <h2 className="text-xl font-bold mb-3">{selectedWord.word}</h2>
        <p className="mb-2">
          <strong>音标:</strong> <span>{selectedWord.phonetic || '暂无'}</span>
        </p>
        <p className="mb-2">
          <strong>释义:</strong> <span>{selectedWord.definition}</span>
        </p>
        <p className="mb-2">
          <strong>稀有度:</strong> <RarityBadge rarity={selectedWord.rarity} />
        </p>
        <p className="mb-2">
          <strong>所属单词书:</strong>{' '}
          <span>{selectedWord.wordbookName || '未知'}</span>
        </p>
        <p className="mb-2">
          <strong>例句:</strong>
        </p>
        <p className="italic text-gray-600 mb-4">
          {selectedWord.exampleSentence || '暂无例句'}
        </p>
        <hr className="my-4" />
        <button
          onClick={handleToggleFavorite}
          className="px-2.5 py-1 mx-0.5 cursor-pointer"
          disabled={updating}
        >
          ⭐ {selectedWord.isFavorite ? '从生词本移除' : '加入生词本'}
        </button>
        <button
          onClick={() => setSelectedWord(null)}
          className="px-2.5 py-1 mx-0.5 cursor-pointer"
        >
          关闭
        </button>
      </div>
    </>
  )
}
