import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, errorResponse } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult

  try {
    const body = await request.json()
    const { packId } = body

    if (!packId) {
      return errorResponse('MISSING_PACK_ID', '卡包ID不能为空')
    }

    // 检查卡包是否存在
    const { data: pack, error: packError } = await supabase
      .from('packs')
      .select('*')
      .eq('id', packId)
      .eq('is_active', true)
      .single()

    if (packError || !pack) {
      return errorResponse('PACK_NOT_FOUND', '卡包不存在', 404)
    }

    // 检查用户是否拥有该卡包
    const { data: userPack, error: userPackError } = await supabase
      .from('user_packs')
      .select('count')
      .eq('user_id', user.id)
      .eq('pack_id', packId)
      .single()

    if (userPackError || !userPack || userPack.count <= 0) {
      return errorResponse('NO_PACK_AVAILABLE', '您没有该卡包', 400)
    }

    // 调用数据库函数开包
    let drawnWords: any[] = []

    if (pack.pack_type === 'SPECIAL') {
      // 特殊卡包
      const { data, error } = await supabase.rpc('draw_words_special_pack', {
        p_user_id: user.id,
        p_pack_id: packId,
        p_card_count: pack.card_count,
        p_rarity_type: pack.rarity_type,
      })

      if (error) {
        console.error('Error drawing from special pack:', error)
        return errorResponse('DRAW_FAILED', '开包失败', 500)
      }

      drawnWords = data || []
    } else {
      // 普通卡包
      const { data, error } = await supabase.rpc('draw_words_normal_pack', {
        p_user_id: user.id,
        p_pack_id: packId,
        p_card_count: pack.card_count,
        p_rarity_weights: pack.rarity_weights,
      })

      if (error) {
        console.error('Error drawing from normal pack:', error)
        return errorResponse('DRAW_FAILED', '开包失败', 500)
      }

      drawnWords = data || []
    }

    // 减少卡包数量
    await supabase
      .from('user_packs')
      .update({ count: userPack.count - 1 })
      .eq('user_id', user.id)
      .eq('pack_id', packId)

    // 增加用户开包数
    await supabase
      .from('users')
      .update({ total_packs_opened: user.total_packs_opened + 1 })
      .eq('id', user.id)

    // 格式化返回数据
    const words = drawnWords.map((w: any) => ({
      id: w.word_id,
      word: w.word,
      definition: w.definition,
      rarity: w.word_rarity,
      pronunciation: w.pronunciation,
      exampleSentence: w.example_sentence,
      imageUrl: w.image_url,
      audioUrl: w.audio_url,
      isNew: true, // 数据库函数已经处理了去重，这里的都是新的
    }))

    return NextResponse.json({
      success: true,
      data: {
        words,
        packName: pack.name,
      },
    })
  } catch (error) {
    console.error('Open pack error:', error)
    return errorResponse('INTERNAL_ERROR', '服务器内部错误', 500)
  }
}
