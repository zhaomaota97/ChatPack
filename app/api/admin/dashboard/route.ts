import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, errorResponse } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    // 获取各种统计数据
    const [usersCount, wordsCount, packsCount, roomsCount, messagesCount] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('words').select('*', { count: 'exact', head: true }),
      supabase.from('packs').select('*', { count: 'exact', head: true }),
      supabase.from('chat_rooms').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
    ])

    // 获取最近7天活跃用户数
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const { count: activeUsersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_login_at', sevenDaysAgo.toISOString())

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: usersCount.count || 0,
        totalWords: wordsCount.count || 0,
        totalPacks: packsCount.count || 0,
        totalRooms: roomsCount.count || 0,
        totalMessages: messagesCount.count || 0,
        activeUsers: activeUsersCount || 0,
      },
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return errorResponse('INTERNAL_ERROR', '服务器内部错误', 500)
  }
}
