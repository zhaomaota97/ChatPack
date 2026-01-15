import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof NextResponse) return authResult
    const user = authResult.user
    
    const { isFavorite } = await request.json()
    const userWordId = params.id

    // 验证是否是用户自己的单词
    const { data: userWord, error: checkError } = await supabase
      .from('user_words')
      .select('user_id')
      .eq('id', userWordId)
      .single()

    if (checkError || !userWord) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: '单词不存在' } },
        { status: 404 }
      )
    }

    if ((userWord as any).user_id !== user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: '无权操作' } },
        { status: 403 }
      )
    }

    // 更新收藏状态
    const { error: updateError } = await supabase
      .from('user_words')
      .update({ is_favorite: isFavorite })
      .eq('id', userWordId)

    if (updateError) {
      console.error('Toggle favorite error:', updateError)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: '操作失败' } },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      data: { success: true, isFavorite }
    })
  } catch (error: any) {
    console.error('Toggle favorite error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    )
  }
}
