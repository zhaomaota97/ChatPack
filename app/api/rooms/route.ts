import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, errorResponse } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    // 获取所有激活的聊天室及其关联的单词书
    const { data: rooms, error: roomsError } = await supabase
      .from('chat_rooms')
      .select(`
        id,
        name,
        description,
        is_active,
        created_at
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (roomsError) {
      console.error('Error fetching rooms:', roomsError)
      return errorResponse('FETCH_FAILED', '获取聊天室失败', 500)
    }

    // 获取每个聊天室的单词书
    const roomsWithWordbooks = await Promise.all(
      (rooms || []).map(async (room: any) => {
        const { data: wordbooks } = await supabase
          .from('chat_room_wordbooks')
          .select(`
            wordbooks (
              id,
              name,
              level,
              description,
              order_index,
              is_active,
              created_at,
              updated_at
            )
          `)
          .eq('room_id', room.id)

        return {
          id: room.id,
          name: room.name,
          description: room.description,
          isActive: room.is_active,
          createdAt: room.created_at,
          wordbooks: (wordbooks || []).map((wb: any) => ({
            id: wb.wordbooks.id,
            name: wb.wordbooks.name,
            level: wb.wordbooks.level,
            description: wb.wordbooks.description,
            orderIndex: wb.wordbooks.order_index,
            isActive: wb.wordbooks.is_active,
            createdAt: wb.wordbooks.created_at,
            updatedAt: wb.wordbooks.updated_at,
          })),
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: roomsWithWordbooks,
    })
  } catch (error) {
    console.error('Get rooms error:', error)
    return errorResponse('INTERNAL_ERROR', '服务器内部错误', 500)
  }
}
