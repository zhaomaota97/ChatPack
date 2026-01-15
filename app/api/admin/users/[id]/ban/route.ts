import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, errorResponse } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const userId = params.id

  try {
    const body = await request.json()
    const { banned } = body

    if (typeof banned !== 'boolean') {
      return errorResponse('INVALID_PARAM', '参数错误')
    }

    // 更新用户封禁状态
    const { error } = await supabase
      .from('users')
      .update({ is_banned: banned })
      .eq('id', userId)

    if (error) {
      console.error('Error updating user ban status:', error)
      return errorResponse('UPDATE_FAILED', '更新失败', 500)
    }

    return NextResponse.json({
      success: true,
      data: {
        userId,
        banned,
      },
    })
  } catch (error) {
    console.error('Ban user error:', error)
    return errorResponse('INTERNAL_ERROR', '服务器内部错误', 500)
  }
}
