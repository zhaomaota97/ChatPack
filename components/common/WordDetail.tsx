'use client'

import { useAppStore } from '@/store/useAppStore'
import { RarityBadge } from './RarityBadge'

export function WordDetail() {
  const { selectedWord, setSelectedWord, inventory, notebook, addToNotebook, removeFromNotebook } = useAppStore()

  if (!selectedWord) return null

  const inventoryWord = inventory.find((w) => w.word === selectedWord.word)
  const isInNotebook = notebook.some((w) => w.word === selectedWord.word)

  const handleToggleFavorite = () => {
    if (!inventoryWord) {
      alert('请先收集此单词')
      return
    }

    if (isInNotebook) {
      removeFromNotebook(selectedWord.word)
      alert('已从生词本移除')
    } else {
      addToNotebook(inventoryWord)
      alert('已加入生词本')
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
          <strong>音标:</strong> <span>{selectedWord.phonetic}</span>
        </p>
        <p className="mb-2">
          <strong>释义:</strong> <span>{selectedWord.meaning}</span>
        </p>
        <p className="mb-2">
          <strong>稀有度:</strong> <RarityBadge rarity={selectedWord.rarity} />
        </p>
        <p className="mb-2">
          <strong>所属单词书:</strong>{' '}
          <span>{selectedWord.books ? selectedWord.books.join(', ') : '未知'}</span>
        </p>
        <p className="mb-2">
          <strong>例句:</strong>
        </p>
        <p className="italic text-gray-600 mb-4">
          {selectedWord.example || '暂无例句'}
        </p>
        <hr className="my-4" />
        <button
          onClick={handleToggleFavorite}
          className="px-2.5 py-1 mx-0.5 cursor-pointer"
        >
          ⭐ {isInNotebook ? '从生词本移除' : '加入生词本'}
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
