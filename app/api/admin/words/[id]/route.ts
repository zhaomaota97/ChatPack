import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, errorResponse } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

// 更新单词
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const wordId = params.id

  try {
    const body = await request.json()
    const { word, definition, pronunciation, rarity, exampleSentence, imageUrl, audioUrl, wordbookIds } = body

    const updateData: any = {}
    if (word !== undefined) updateData.word = word.toLowerCase()
    if (definition !== undefined) updateData.definition = definition
    if (pronunciation !== undefined) updateData.pronunciation = pronunciation
    if (rarity !== undefined) updateData.rarity = rarity
    if (exampleSentence !== undefined) updateData.example_sentence = exampleSentence
    if (imageUrl !== undefined) updateData.image_url = imageUrl
    if (audioUrl !== undefined) updateData.audio_url = audioUrl

    // 更新单词信息
    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('words')
        .update(updateData)
        .eq('id', wordId)

      if (error) {
        console.error('Error updating word:', error)
        return errorResponse('UPDATE_FAILED', '更新单词失败', 500)
      }
    }

    // 更新单词书关联
    if (wordbookIds && Array.isArray(wordbookIds)) {
      // 删除旧关联
      await supabase.from('wordbook_words').delete().eq('word_id', wordId)

      // 添加新关联
      const relations = wordbookIds.map((wbId: string) => ({
        wordbook_id: wbId,
        word_id: wordId,
      }))

      await supabase.from('wordbook_words').insert(relations)
    }

    return NextResponse.json({
      success: true,
      data: { id: wordId },
    })
  } catch (error) {
    console.error('Update word error:', error)
    return errorResponse('INTERNAL_ERROR', '服务器内部错误', 500)
  }
}

// 删除单词
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const wordId = params.id

  try {
    const { error } = await supabase
      .from('words')
      .delete()
      .eq('id', wordId)

    if (error) {
      console.error('Error deleting word:', error)
      return errorResponse('DELETE_FAILED', '删除单词失败', 500)
    }

    return NextResponse.json({
      success: true,
      data: { id: wordId },
    })
  } catch (error) {
    console.error('Delete word error:', error)
    return errorResponse('INTERNAL_ERROR', '服务器内部错误', 500)
  }
}
