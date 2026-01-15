import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, errorResponse } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

// 更新卡包
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const packId = params.id

  try {
    const body = await request.json()
    const { name, description, cardCount, rarityWeights, isActive } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (cardCount !== undefined) updateData.card_count = cardCount
    if (rarityWeights !== undefined) updateData.rarity_weights = rarityWeights
    if (isActive !== undefined) updateData.is_active = isActive

    // 更新卡包
    const { error } = await supabase
      .from('packs')
      .update(updateData)
      .eq('id', packId)

    if (error) {
      console.error('Error updating pack:', error)
      return errorResponse('UPDATE_FAILED', '更新卡包失败', 500)
    }

    return NextResponse.json({
      success: true,
      data: { id: packId },
    })
  } catch (error) {
    console.error('Update pack error:', error)
    return errorResponse('INTERNAL_ERROR', '服务器内部错误', 500)
  }
}

// 删除卡包
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const packId = params.id

  try {
    const { error } = await supabase
      .from('packs')
      .delete()
      .eq('id', packId)

    if (error) {
      console.error('Error deleting pack:', error)
      return errorResponse('DELETE_FAILED', '删除卡包失败', 500)
    }

    return NextResponse.json({
      success: true,
      data: { id: packId },
    })
  } catch (error) {
    console.error('Delete pack error:', error)
    return errorResponse('INTERNAL_ERROR', '服务器内部错误', 500)
  }
}
