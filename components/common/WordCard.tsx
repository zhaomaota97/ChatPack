'use client'

import type { UserWord } from '@/lib/types.full'
import { RarityBadge } from './RarityBadge'
import { useAppStore } from '@/store/useAppStore'

interface WordCardProps {
  word: UserWord
  isOwned?: boolean
  showFavorite?: boolean
}

export function WordCard({ word, isOwned = true, showFavorite = false }: WordCardProps) {
  const { setSelectedWord } = useAppStore()

  return (
    <div
      onClick={() => setSelectedWord(word)}
      className="border border-gray-300 p-2.5 text-center cursor-pointer hover:bg-gray-100"
    >
      <strong>{word.word}</strong>
      <div className="text-xs text-gray-500">{word.definition}</div>
      <RarityBadge rarity={word.rarity} />
      {!isOwned && (
        <div className="inline-block px-2 py-0.5 text-xs rounded bg-red-500 text-white ml-1">
          未获得
        </div>
      )}
      {showFavorite && word.isFavorite && (
        <div className="text-orange-500">⭐</div>
      )}
    </div>
  )
}
