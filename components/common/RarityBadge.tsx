'use client'

import { RarityType } from '@/lib/types'
import { cn } from '@/lib/utils'

interface BadgeProps {
  rarity: RarityType
  className?: string
}

export function RarityBadge({ rarity, className }: BadgeProps) {
  const getBadgeClass = () => {
    switch (rarity) {
      case 'COMMON':
        return 'bg-gray-400'
      case 'RARE':
        return 'bg-blue-500 text-white'
      case 'EPIC':
        return 'bg-purple-500 text-white'
      case 'LEGENDARY':
        return 'bg-orange-500 text-white'
      default:
        return 'bg-gray-400'
    }
  }

  return (
    <span
      className={cn(
        'inline-block px-2 py-0.5 text-xs rounded',
        getBadgeClass(),
        className
      )}
    >
      {rarity}
    </span>
  )
}
