'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useOpenPack } from '@/hooks/useApp'
import { RarityBadge } from '../common/RarityBadge'
import type { Word, Rarity } from '@/lib/types.full'

export function PackPage() {
  const { user, userPacks, availablePacks } = useAppStore()
  const { openPack } = useOpenPack()
  const [showResult, setShowResult] = useState(false)
  const [openedCards, setOpenedCards] = useState<Array<Word & { isNew: boolean }>>([])
  const [isOpening, setIsOpening] = useState(false)

  const handleOpenPack = async (packId: string) => {
    setIsOpening(true)
    try {
      const result = await openPack(packId)
      if (result) {
        setOpenedCards(result.words)
        setShowResult(true)
      }
    } catch (error: any) {
      alert(error?.error?.message || '开包失败，请重试')
    } finally {
      setIsOpening(false)
    }
  }

  // 获取用户拥有的卡包数量
  const getPackCount = (packId: string) => {
    const userPack = userPacks.find(p => p.packId === packId)
    return userPack?.count || 0
  }

  // 显示稀有度描述
  const getRarityDescription = (pack: any) => {
    if (pack.packType === 'SPECIAL' && pack.rarityType) {
      const rarityNames: Record<Rarity, string> = {
        COMMON: '普通',
        RARE: '稀有',
        EPIC: '史诗',
        LEGENDARY: '传说'
      }
      return `100% ${rarityNames[pack.rarityType]}稀有度`
    } else if (pack.packType === 'NORMAL' && pack.rarityWeights) {
      const weights = pack.rarityWeights
      return `概率: 普通${weights.COMMON}% 稀有${weights.RARE}% 史诗${weights.EPIC}% 传说${weights.LEGENDARY}%`
    }
    return '未知配置'
  }

  return (
    <div className="h-full">
      <h1 className="text-xl mb-4 border-b-2 border-gray-800 pb-1">🎴 卡包商店</h1>
      <p className="mb-4">打开卡包获得单词卡片，不会重复获得已有单词</p>

      <div className="mb-5 p-4 border border-gray-300 bg-gray-50">
        <p className="text-sm text-gray-600">
          💡 提示：卡包需要管理员赠送。邀请码：<strong>{user?.inviteCode || '加载中...'}</strong>
        </p>
      </div>

      <h2 className="text-base my-4">我的卡包</h2>
      
      {availablePacks.length === 0 ? (
        <div className="text-gray-500 py-8 text-center">正在加载卡包...</div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2.5">
          {availablePacks.map((pack) => {
            const count = getPackCount(pack.id)
            return (
              <div key={pack.id} className="border border-gray-300 p-4">
                <h3 className="mb-2.5 font-bold">{pack.name}</h3>
                <p className="text-sm mb-2">{pack.description || `包含${pack.cardCount}张单词卡`}</p>
                <p className="text-xs text-gray-600 mb-3">{getRarityDescription(pack)}</p>
                <p className="text-sm mb-2">拥有: <strong>{count}个</strong></p>
                <button
                  onClick={() => handleOpenPack(pack.id)}
                  disabled={count === 0 || isOpening}
                  className={`px-2.5 py-1 cursor-pointer mt-2 w-full ${
                    count === 0 || isOpening ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isOpening ? '开包中...' : count > 0 ? '打开卡包' : '暂无卡包'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {showResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl mb-4">✨ 获得单词</h2>
            <div className="grid grid-cols-5 gap-2.5 mt-2.5">
              {openedCards.map((card, index) => (
                <div key={index} className="border border-gray-600 p-2.5 text-center">
                  <RarityBadge rarity={card.rarity} />
                  <h3 className="my-2 font-bold">{card.word}</h3>
                  <p className="text-xs">{card.definition}</p>
                  {card.isNew && <p className="text-xs text-green-600 mt-1">★ 新单词</p>}
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowResult(false)}
              className="px-4 py-2 cursor-pointer mt-4 w-full bg-gray-800 text-white"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

