import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, errorResponse } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

// 获取单词列表
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const search = searchParams.get('search') || ''
  const rarity = searchParams.get('rarity')

  try {
    let query = supabase
      .from('words')
      .select('*', { count: 'exact' })

    if (search) {
      query = query.or(`word.ilike.%${search}%,definition.ilike.%${search}%`)
    }

    if (rarity) {
      query = query.eq('rarity', rarity)
    }

    const { data: words, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      console.error('Error fetching words:', error)
      return errorResponse('FETCH_FAILED', '获取单词列表失败', 500)
    }

    // 获取每个单词的单词书关联
    const wordsWithWordbooks = await Promise.all(
      (words || []).map(async (word: any) => {
        const { data: wordbooks } = await supabase
          .from('wordbook_words')
          .select('wordbook_id')
          .eq('word_id', word.id)

        return {
          id: word.id,
          word: word.word,
          definition: word.definition,
          pronunciation: word.pronunciation,
          rarity: word.rarity,
          exampleSentence: word.example_sentence,
          imageUrl: word.image_url,
          audioUrl: word.audio_url,
          wordbookIds: (wordbooks || []).map((wb: any) => wb.wordbook_id),
          createdAt: word.created_at,
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        items: wordsWithWordbooks,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Get words error:', error)
    return errorResponse('INTERNAL_ERROR', '服务器内部错误', 500)
  }
}

// 创建单词
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const body = await request.json()
    const { word, definition, pronunciation, rarity, exampleSentence, imageUrl, audioUrl, wordbookIds } = body

    if (!word || !definition || !rarity || !wordbookIds || wordbookIds.length === 0) {
      return errorResponse('MISSING_FIELDS', '缺少必填字段')
    }

    // 检查单词是否已存在
    const { data: existingWord } = await supabase
      .from('words')
      .select('id')
      .ilike('word', word)
      .single()

    if (existingWord) {
      return errorResponse('WORD_EXISTS', '单词已存在', 409)
    }

    // 创建单词
    const { data: newWord, error: wordError } = await supabase
      .from('words')
      .insert({
        word: word.toLowerCase(),
        definition,
        pronunciation,
        rarity,
        example_sentence: exampleSentence,
        image_url: imageUrl,
        audio_url: audioUrl,
      })
      .select()
      .single()

    if (wordError || !newWord) {
      console.error('Error creating word:', wordError)
      return errorResponse('CREATE_FAILED', '创建单词失败', 500)
    }

    // 关联单词书
    const wordbookRelations = wordbookIds.map((wbId: string) => ({
      wordbook_id: wbId,
      word_id: newWord.id,
    }))

    await supabase.from('wordbook_words').insert(wordbookRelations)

    return NextResponse.json({
      success: true,
      data: {
        id: newWord.id,
        word: newWord.word,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Create word error:', error)
    return errorResponse('INTERNAL_ERROR', '服务器内部错误', 500)
  }
}
