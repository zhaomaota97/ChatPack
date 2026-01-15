import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, errorResponse } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { DbUser } from '@/lib/types.full'

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult

  // 获取用户拥有的单词数
  const { count: wordCount } = await supabase
    .from('user_words')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return NextResponse.json({
    success: true,
    data: {
      userId: user.id,
      username: user.username,
      nickname: user.nickname || undefined,
      avatar: user.avatar || undefined,
      role: user.role,
      totalPacksOpened: user.total_packs_opened,
      totalRoses: user.total_roses,
      totalWords: wordCount || 0,
      inviteCode: user.invite_code,
      registeredAt: user.registered_at,
      isBanned: user.is_banned,
    },
  })
}
