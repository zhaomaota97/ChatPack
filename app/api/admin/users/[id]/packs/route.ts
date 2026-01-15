import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, errorResponse } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function POST(
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
    const { packId, count } = body

    if (!packId || !count || count <= 0) {
      return errorResponse('INVALID_PARAMS', '参数错误')
    }

    // 检查卡包是否存在
    const { data: pack, error: packError } = await supabase
      .from('packs')
      .select('id, name')
      .eq('id', packId)
      .single()

    if (packError || !pack) {
      return errorResponse('PACK_NOT_FOUND', '卡包不存在', 404)
    }

    // 检查用户是否存在
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return errorResponse('USER_NOT_FOUND', '用户不存在', 404)
    }

    // 查询用户是否已有该卡包
    const { data: existingPack } = await supabase
      .from('user_packs')
      .select('count')
      .eq('user_id', userId)
      .eq('pack_id', packId)
      .single()

    if (existingPack) {
      // 增加数量
      await supabase
        .from('user_packs')
        .update({ count: existingPack.count + count })
        .eq('user_id', userId)
        .eq('pack_id', packId)
    } else {
      // 新增记录
      await supabase
        .from('user_packs')
        .insert({
          user_id: userId,
          pack_id: packId,
          count,
        })
    }

    return NextResponse.json({
      success: true,
      data: {
        userId,
        packId,
        packName: pack.name,
        count,
      },
    })
  } catch (error) {
    console.error('Give pack error:', error)
    return errorResponse('INTERNAL_ERROR', '服务器内部错误', 500)
  }
}
