// JWT 认证工具
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { supabase } from './supabase'
import { DbUser } from './types.full'
import type { UserRole } from './types.full'

const JWT_SECRET = process.env.JWT_SECRET || 'chatpack-secret-key-change-this-in-production'
const COOKIE_NAME = 'chatpack_token'

export interface JWTPayload {
  userId: string
  username: string
  role: UserRole
}

// 生成 JWT Token
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

// 验证 JWT Token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

// 哈希密码
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// 验证密码
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// 从请求中获取当前用户
export async function getCurrentUser(request: NextRequest): Promise<DbUser | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value
  
  if (!token) {
    return null
  }

  const payload = verifyToken(token)
  if (!payload) {
    return null
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', payload.userId)
    .single()

  if (error || !user) {
    return null
  }

  return user as DbUser
}

// 创建带认证Cookie的响应
export function createAuthResponse<T>(data: T, user: JWTPayload): NextResponse<{ success: boolean; data: T }> {
  const token = generateToken(user)
  const response = NextResponse.json({ success: true, data })
  
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return response
}

// 清除认证Cookie
export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.delete(COOKIE_NAME)
  return response
}

// 错误响应
export function errorResponse(code: string, message: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
    },
    { status }
  )
}

// 认证中间件
export async function requireAuth(request: NextRequest): Promise<{ user: DbUser } | NextResponse> {
  const user = await getCurrentUser(request)

  if (!user) {
    return errorResponse('UNAUTHORIZED', '请先登录', 401)
  }

  if (user.is_banned) {
    return errorResponse('FORBIDDEN', '用户已被封禁', 403)
  }

  return { user }
}

// 管理员中间件
export async function requireAdmin(request: NextRequest): Promise<{ user: DbUser } | NextResponse> {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  if (authResult.user.role !== 'ADMIN') {
    return errorResponse('FORBIDDEN', '需要管理员权限', 403)
  }

  return authResult
}

// 验证用户名格式
export function validateUsername(username: string): string | null {
  if (!username || username.length < 3 || username.length > 50) {
    return '用户名长度必须在3-50个字符之间'
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return '用户名只能包含字母、数字和下划线'
  }
  return null
}

// 验证密码格式
export function validatePassword(password: string): string | null {
  if (!password || password.length < 6 || password.length > 100) {
    return '密码长度必须在6-100个字符之间'
  }
  return null
}

// 设置认证 Cookie (保留原有接口，但已不推荐使用)
import { cookies } from 'next/headers'

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

// 清除认证 Cookie (保留原有接口)
export async function clearAuthCookieOld() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
