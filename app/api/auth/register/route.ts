import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hashPassword, validateUsername, validatePassword, createAuthResponse, errorResponse } from '@/lib/auth'
import { DbUser } from '@/lib/types.full'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, inviteCode } = body

    // 验证输入
    const usernameError = validateUsername(username)
    if (usernameError) {
      return errorResponse('INVALID_USERNAME', usernameError)
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      return errorResponse('INVALID_PASSWORD', passwordError)
    }

    // 检查用户名是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUser) {
      return errorResponse('USERNAME_EXISTS', '用户名已存在', 409)
    }

    // 验证邀请码（如果提供）
    let invitedBy: string | undefined
    if (inviteCode) {
      const { data: inviter } = await supabase
        .from('users')
        .select('id')
        .eq('invite_code', inviteCode)
        .single()

      if (!inviter) {
        return errorResponse('INVALID_INVITE_CODE', '邀请码不存在', 404)
      }
      invitedBy = inviter.id
    }

    // 哈希密码
    const passwordHash = await hashPassword(password)

    // 创建用户
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        username,
        password_hash: passwordHash,
        invited_by: invitedBy,
      })
      .select()
      .single()

    if (error || !newUser) {
      console.error('Error creating user:', error)
      return errorResponse('CREATE_USER_FAILED', '创建用户失败', 500)
    }

    const user = newUser as DbUser

    return createAuthResponse(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        inviteCode: user.invite_code,
      },
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      }
    )
  } catch (error) {
    console.error('Register error:', error)
    return errorResponse('INTERNAL_ERROR', '服务器内部错误', 500)
  }
}
