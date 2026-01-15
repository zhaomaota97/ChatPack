import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, errorResponse } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

// 获取所有聊天室
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const { data: rooms, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching rooms:', error)
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

// 创建聊天室
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const body = await request.json()
    const { name, description, wordbookIds } = body

    if (!name || !wordbookIds || wordbookIds.length === 0) {
      return errorResponse('MISSING_FIELDS', '缺少必填字段')
    }

    // 创建聊天室
    const { data: newRoom, error: roomError } = await supabase
      .from('chat_rooms')
      .insert({
        name,
        description,
      })
      .select()
      .single()

    if (roomError || !newRoom) {
      console.error('Error creating room:', roomError)
      return errorResponse('CREATE_FAILED', '创建聊天室失败', 500)
    }

    // 关联单词书
    const relations = wordbookIds.map((wbId: string) => ({
      room_id: newRoom.id,
      wordbook_id: wbId,
    }))

    await supabase.from('chat_room_wordbooks').insert(relations)

    return NextResponse.json({
      success: true,
      data: {
        id: newRoom.id,
        name: newRoom.name,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Create room error:', error)
    return errorResponse('INTERNAL_ERROR', '服务器内部错误', 500)
  }
}
