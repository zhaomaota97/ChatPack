'use client'

import { Word } from '@/lib/types'
import { RarityBadge } from './RarityBadge'
import { useAppStore } from '@/store/useAppStore'

interface WordCardProps {
  word: Word
  isOwned?: boolean
  showFavorite?: boolean
}

export function WordCard({ word, isOwned = true, showFavorite = false }: WordCardProps) {
  const { setSelectedWord, inventory } = useAppStore()

  const inventoryWord = inventory.find((w) => w.word === word.word)

  return (
    <div
      onClick={() => setSelectedWord(word)}
      className="border border-gray-300 p-2.5 text-center cursor-pointer hover:bg-gray-100"
    >
      <strong>{word.word}</strong>
      <div className="text-xs text-gray-500">{word.meaning}</div>
      <RarityBadge rarity={word.rarity} />
      {!isOwned && (
        <div className="inline-block px-2 py-0.5 text-xs rounded bg-red-500 text-white ml-1">
          未获得
        </div>
      )}
      {showFavorite && inventoryWord?.favorite && (
        <div className="text-orange-500">⭐</div>
      )}
    </div>
  )
}
