'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { mockWords } from '@/lib/mockData'
import { RarityBadge } from '../common/RarityBadge'
import { RarityType } from '@/lib/types'

export function PackPage() {
  const { totalPacks, incrementTotalPacks, addToInventory } = useAppStore()
  const [showResult, setShowResult] = useState(false)
  const [openedCards, setOpenedCards] = useState<any[]>([])
  const [inviteCode, setInviteCode] = useState('')

  const openPack = (packType: string) => {
    const count = 5
    const results = []

    for (let i = 0; i < count; i++) {
      let rarity: RarityType
      if (packType === 'common') {
        const r = Math.random()
        rarity =
          r < 0.6
            ? 'COMMON'
            : r < 0.9
            ? 'RARE'
            : r < 0.98
            ? 'EPIC'
            : 'LEGENDARY'
      } else {
        rarity = packType.toUpperCase() as RarityType
      }

      const filtered = mockWords.filter((w) => w.rarity === rarity)
      const word = filtered[Math.floor(Math.random() * filtered.length)] || mockWords[0]
      results.push(word)
      addToInventory(word)
    }

    incrementTotalPacks()
    setOpenedCards(results)
    setShowResult(true)
  }

  const handleClaimInvite = () => {
    if (!inviteCode.trim()) {
      alert('请输入邀请码')
      return
    }
    alert(`使用邀请码 ${inviteCode} 领取卡包成功！获得普通卡包 x1`)
  }

  return (
    <div className="h-full">
      <h1 className="text-xl mb-4 border-b-2 border-gray-800 pb-1">🎴 卡包商店</h1>
      <p className="mb-4">打开卡包获得单词卡片，不会重复获得已有单词</p>

      <h2 className="text-base my-4">领取卡包</h2>
      <div className="mb-5 p-4 border border-gray-300 bg-gray-50">
        <p className="mb-2.5">输入邀请码或完成任务领取卡包</p>
        <input
          type="text"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="输入邀请码..."
          className="w-[200px] px-2 py-1 mr-1"
        />
        <button onClick={handleClaimInvite} className="px-2.5 py-1 mx-0.5 cursor-pointer">
          使用邀请码领取
        </button>
        <button
          onClick={() => alert('每日签到成功！获得普通卡包 x1')}
          className="px-2.5 py-1 mx-0.5 cursor-pointer ml-2.5"
        >
          每日签到领取 (普通卡包 x1)
        </button>
        <button
          onClick={() => alert('领取新手礼包成功！获得普通卡包 x3')}
          className="px-2.5 py-1 mx-0.5 cursor-pointer ml-2.5"
        >
          新手礼包 (普通卡包 x3)
        </button>
      </div>

      <h2 className="text-base my-4">我的卡包 (3个)</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2.5">
        <div className="border border-gray-300 p-4">
          <h3 className="mb-2.5">普通卡包</h3>
          <p>包含5张单词卡</p>
          <p className="text-xs">概率: 普通60% 稀有30% 史诗8% 传说2%</p>
          <button
            onClick={() => openPack('common')}
            className="px-2.5 py-1 mx-0.5 cursor-pointer mt-2"
          >
            打开卡包
          </button>
        </div>
        <div className="border border-gray-300 p-4">
          <h3 className="mb-2.5">稀有卡包</h3>
          <p>包含5张稀有单词</p>
          <p className="text-xs">100%稀有稀有度</p>
          <button
            onClick={() => openPack('rare')}
            className="px-2.5 py-1 mx-0.5 cursor-pointer mt-2"
          >
            打开卡包
          </button>
        </div>
        <div className="border border-gray-300 p-4">
          <h3 className="mb-2.5">史诗卡包</h3>
          <p>包含5张史诗单词</p>
          <p className="text-xs">100%史诗稀有度</p>
          <button
            onClick={() => openPack('epic')}
            className="px-2.5 py-1 mx-0.5 cursor-pointer mt-2"
          >
            打开卡包
          </button>
        </div>
        <div className="border border-gray-300 p-4">
          <h3 className="mb-2.5">传说卡包</h3>
          <p>包含5张传说单词</p>
          <p className="text-xs">100%传说稀有度</p>
          <button
            onClick={() => openPack('legendary')}
            className="px-2.5 py-1 mx-0.5 cursor-pointer mt-2"
          >
            打开卡包
          </button>
        </div>
      </div>

      {showResult && (
        <div className="mt-5 border-2 border-gray-800 p-4">
          <h2 className="text-base mb-2.5">✨ 获得单词</h2>
          <div className="grid grid-cols-5 gap-2.5 mt-2.5">
            {openedCards.map((card, index) => (
              <div key={index} className="border border-gray-600 p-2.5 text-center">
                <RarityBadge rarity={card.rarity} />
                <h3 className="my-2">{card.word}</h3>
                <p className="text-xs">{card.meaning}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowResult(false)}
            className="px-2.5 py-1 mx-0.5 cursor-pointer mt-2.5"
          >
            关闭
          </button>
        </div>
      )}

      <h2 className="text-base my-4">统计</h2>
      <p>
        累计开包数: <strong>{totalPacks}</strong>
      </p>
    </div>
  )
}
