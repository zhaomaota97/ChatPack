import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, errorResponse } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const search = searchParams.get('search') || ''

  try {
    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })

    if (search) {
      query = query.or(`username.ilike.%${search}%,nickname.ilike.%${search}%`)
    }

    const { data, error, count } = await query
      .order('registered_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      console.error('Error fetching users:', error)
      return errorResponse('FETCH_FAILED', '获取用户列表失败', 500)
    }

    const users = (data || []).map((user: any) => ({
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      role: user.role,
      isBanned: user.is_banned,
      totalRoses: user.total_roses,
      totalPacksOpened: user.total_packs_opened,
      inviteCode: user.invite_code,
      registeredAt: user.registered_at,
      lastLoginAt: user.last_login_at,
    }))

    return NextResponse.json({
      success: true,
      data: {
        items: users,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Get users error:', error)
    return errorResponse('INTERNAL_ERROR', '服务器内部错误', 500)
  }
}
