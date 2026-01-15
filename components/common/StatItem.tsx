'use client'

interface StatItemProps {
  value: string | number
  label: string
}

export function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="border border-gray-300 p-4 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}
