import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyPassword, createAuthResponse, errorResponse } from '@/lib/auth'
import { DbUser } from '@/lib/types.full'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return errorResponse('MISSING_FIELDS', '用户名和密码不能为空')
    }

    // 查找用户
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !user) {
      return errorResponse('INVALID_CREDENTIALS', '用户名或密码错误', 401)
    }

    const dbUser = user as DbUser

    // 验证密码
    const isValid = await verifyPassword(password, dbUser.password_hash)
    if (!isValid) {
      return errorResponse('INVALID_CREDENTIALS', '用户名或密码错误', 401)
    }

    // 检查是否被封禁
    if (dbUser.is_banned) {
      return errorResponse('USER_BANNED', '用户已被封禁', 403)
    }

    // 更新最后登录时间
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', dbUser.id)

    return createAuthResponse(
      {
        userId: dbUser.id,
        username: dbUser.username,
        nickname: dbUser.nickname || undefined,
        avatar: dbUser.avatar || undefined,
        role: dbUser.role,
      },
      {
        userId: dbUser.id,
        username: dbUser.username,
        role: dbUser.role,
      }
    )
  } catch (error) {
    console.error('Login error:', error)
    return errorResponse('INTERNAL_ERROR', '服务器内部错误', 500)
  }
}
