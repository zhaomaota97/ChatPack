import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, errorResponse } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult
  const { searchParams } = new URL(request.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const search = searchParams.get('search') || ''
  const rarity = searchParams.get('rarity')
  const favorited = searchParams.get('favorited') === 'true'

  try {
    // 构建查询
    let query = supabase
      .from('user_words')
      .select(`
        word_id,
        is_favorited,
        obtained_at,
        words (
          id,
          word,
          definition,
          pronunciation,
          rarity,
          example_sentence,
          image_url,
          audio_url,
          created_at,
          updated_at
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)

    if (favorited) {
      query = query.eq('is_favorited', true)
    }

    // 获取数据
    const { data, error, count } = await query
      .order('obtained_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      console.error('Error fetching user words:', error)
      return errorResponse('FETCH_FAILED', '获取单词失败', 500)
    }

    // 过滤和处理数据
    let userWords = (data || []).map((item: any) => ({
      userId: user.id,
      wordId: item.word_id,
      word: {
        id: item.words.id,
        word: item.words.word,
        definition: item.words.definition,
        pronunciation: item.words.pronunciation,
        rarity: item.words.rarity,
        exampleSentence: item.words.example_sentence,
        imageUrl: item.words.image_url,
        audioUrl: item.words.audio_url,
        createdAt: item.words.created_at,
        updatedAt: item.words.updated_at,
      },
      isFavorited: item.is_favorited,
      obtainedAt: item.obtained_at,
    }))

    // 前端过滤（搜索和稀有度）
    if (search) {
      const searchLower = search.toLowerCase()
      userWords = userWords.filter((uw: any) =>
        uw.word.word.toLowerCase().includes(searchLower) ||
        uw.word.definition.toLowerCase().includes(searchLower)
      )
    }

    if (rarity) {
      userWords = userWords.filter((uw: any) => uw.word.rarity === rarity)
    }

    return NextResponse.json({
      success: true,
      data: {
        items: userWords,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Get user words error:', error)
    return errorResponse('INTERNAL_ERROR', '服务器内部错误', 500)
  }
}
