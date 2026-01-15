'use client'

import { StatItem } from '../common/StatItem'

export function AdminDashboard() {
  return (
    <div>
      <h2 className="text-base mb-4">📊 数据统计仪表盘</h2>
      
      <div className="grid grid-cols-4 gap-2.5 mb-4">
        <StatItem value="1,234" label="总用户数" />
        <StatItem value="89" label="今日活跃" />
        <StatItem value="45" label="本周新增" />
        <StatItem value="3" label="封禁用户" />
      </div>

      <div className="grid grid-cols-4 gap-2.5 mb-4">
        <StatItem value="5,000" label="单词总数" />
        <StatItem value="8,765" label="总开包数" />
        <StatItem value="23,456" label="消息总数" />
        <StatItem value="9,876" label="总鲜花数" />
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
