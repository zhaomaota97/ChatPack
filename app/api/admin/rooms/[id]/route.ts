import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, errorResponse } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

// 更新聊天室
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const roomId = params.id

  try {
    const body = await request.json()
    const { name, description, wordbookIds, isActive } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (isActive !== undefined) updateData.is_active = isActive

    // 更新聊天室信息
    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('chat_rooms')
        .update(updateData)
        .eq('id', roomId)

      if (error) {
        console.error('Error updating room:', error)
        return errorResponse('UPDATE_FAILED', '更新聊天室失败', 500)
      }
    }

    // 更新单词书关联
    if (wordbookIds && Array.isArray(wordbookIds)) {
      // 删除旧关联
      await supabase.from('chat_room_wordbooks').delete().eq('room_id', roomId)

      // 添加新关联
      if (wordbookIds.length > 0) {
        const relations = wordbookIds.map((wbId: string) => ({
          room_id: roomId,
          wordbook_id: wbId,
        }))

        await supabase.from('chat_room_wordbooks').insert(relations)
      }
    }

    return NextResponse.json({
      success: true,
      data: { id: roomId },
    })
  } catch (error) {
    console.error('Update room error:', error)
    return errorResponse('INTERNAL_ERROR', '服务器内部错误', 500)
  }
}

// 删除聊天室
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const roomId = params.id

  try {
    const { error } = await supabase
      .from('chat_rooms')
      .delete()
      .eq('id', roomId)

    if (error) {
      console.error('Error deleting room:', error)
      return errorResponse('DELETE_FAILED', '删除聊天室失败', 500)
    }

    return NextResponse.json({
      success: true,
      data: { id: roomId },
    })
  } catch (error) {
    console.error('Delete room error:', error)
    return errorResponse('INTERNAL_ERROR', '服务器内部错误', 500)
  }
}
