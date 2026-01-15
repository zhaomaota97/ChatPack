'use client'

import { useState, useEffect } from 'react'
import { StatItem } from '../common/StatItem'
import { adminApi } from '@/lib/api'

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    newThisWeek: 0,
    bannedUsers: 0,
    totalWords: 0,
    totalPacks: 0,
    totalMessages: 0,
    totalRoses: 0
  })

  useEffect(() => {
    const loadStats = async () => {
      try {
        // 获取用户统计
        const usersResult = await adminApi.users.getAll()
        if (usersResult.success && usersResult.data) {
          const users = usersResult.data
          setStats(prev => ({
            ...prev,
            totalUsers: users.length,
            bannedUsers: users.filter(u => u.isBanned).length
          }))
        }

        // 获取单词统计
        const wordsResult = await adminApi.words.getAll()
        if (wordsResult.success && wordsResult.data) {
          setStats(prev => ({
            ...prev,
            totalWords: wordsResult.data.length
          }))
        }

        // 获取卡包统计
        const packsResult = await adminApi.packs.getAll()
        if (packsResult.success && packsResult.data) {
          setStats(prev => ({
            ...prev,
            totalPacks: packsResult.data.length
          }))
        }
      } catch (error) {
        console.error('加载统计数据失败:', error)
      }
    }

    loadStats()
  }, [])

  return (
    <div>
      <h2 className="text-base mb-4">📊 数据统计仪表盘</h2>
      
      <div className="grid grid-cols-4 gap-2.5 mb-4">
        <StatItem value={stats.totalUsers} label="总用户数" />
        <StatItem value={stats.activeToday} label="今日活跃" />
        <StatItem value={stats.newThisWeek} label="本周新增" />
        <StatItem value={stats.bannedUsers} label="封禁用户" />
      </div>

      <div className="grid grid-cols-4 gap-2.5 mb-4">
        <StatItem value={stats.totalWords} label="单词总数" />
        <StatItem value={stats.totalPacks} label="卡包总数" />
        <StatItem value={stats.totalMessages} label="消息总数" />
        <StatItem value={stats.totalRoses} label="总鲜花数" />
      </div>

      <h3 className="text-base mt-5 mb-2">用户增长趋势</h3>
      <div className="border border-gray-300 p-5 text-center text-gray-400">
        [图表占位：折线图 - 用户增长趋势]
      </div>

      <h3 className="text-base mt-5 mb-2">单词稀有度分布</h3>
      <div className="border border-gray-300 p-5 text-center text-gray-400">
        [图表占位：饼图 - 稀有度分布]
      </div>
    </div>
  )
}
