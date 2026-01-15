import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ChatPack - 单词学习游戏平台',
  description: '通过卡包收集单词，在聊天室中学习交流',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
