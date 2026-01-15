import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, errorResponse } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult
  const roomId = params.id
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const before = searchParams.get('before') // 时间戳，用于分页

  try {
    // 构建查询
    let query = supabase
      .from('messages')
      .select(`
        id,
        room_id,
        user_id,
        content,
        roses,
        timestamp,
        reply_to_id,
        users (
          id,
          username,
          nickname,
          avatar
        )
      `)
      .eq('room_id', roomId)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (before) {
      query = query.lt('timestamp', before)
    }

    const { data: messages, error } = await query

    if (error) {
      console.error('Error fetching messages:', error)
      return errorResponse('FETCH_FAILED', '获取消息失败', 500)
    }

    // 检查当前用户是否给每条消息送过花
    const messageIds = (messages || []).map((m: any) => m.id)
    const { data: roses } = await supabase
      .from('rose_transactions')
      .select('message_id')
      .in('message_id', messageIds)
      .eq('sender_id', user.id)

    const rosedMessageIds = new Set((roses || []).map((r: any) => r.message_id))

    const formattedMessages = (messages || []).map((msg: any) => ({
      id: msg.id,
      roomId: msg.room_id,
      userId: msg.user_id,
      user: {
        id: msg.users.id,
        username: msg.users.username,
        nickname: msg.users.nickname,
        avatar: msg.users.avatar,
      },
      content: msg.content,
      roses: msg.roses,
      timestamp: msg.timestamp,
      replyToId: msg.reply_to_id,
      hasRosed: rosedMessageIds.has(msg.id),
    }))

    return NextResponse.json({
      success: true,
      data: formattedMessages,
    })
  } catch (error) {
    console.error('Get messages error:', error)
    return errorResponse('INTERNAL_ERROR', '服务器内部错误', 500)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult
  const roomId = params.id

  try {
    const body = await request.json()
    const { content, replyToId } = body

    if (!content || !content.trim()) {
      return errorResponse('EMPTY_MESSAGE', '消息不能为空')
    }

    // 验证聊天室是否存在且激活
    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .eq('is_active', true)
      .single()

    if (roomError || !room) {
      return errorResponse('ROOM_NOT_FOUND', '聊天室不存在', 404)
    }

    // 获取聊天室允许的单词书
    const { data: roomWordbooks } = await supabase
      .from('chat_room_wordbooks')
      .select('wordbook_id')
      .eq('room_id', roomId)

    const wordbookIds = (roomWordbooks || []).map((rw: any) => rw.wordbook_id)

    // 检查用户是否拥有该单词且该单词属于聊天室允许的单词书
    const trimmedContent = content.trim().toLowerCase()

    // 查询单词是否存在且属于允许的单词书
    const { data: wordData } = await supabase
      .from('words')
      .select(`
        id,
        word,
        wordbook_words!inner (
          wordbook_id
        )
      `)
      .ilike('word', trimmedContent)
      .in('wordbook_words.wordbook_id', wordbookIds)
      .limit(1)
      .single()

    if (!wordData) {
      return errorResponse('INVALID_WORD', '该单词不在此聊天室的单词库中', 400)
    }

    // 检查用户是否拥有该单词
    const { data: userWord } = await supabase
      .from('user_words')
      .select('word_id')
      .eq('user_id', user.id)
      .eq('word_id', wordData.id)
      .single()

    if (!userWord) {
      return errorResponse('WORD_NOT_OWNED', '您还没有收集到这个单词', 400)
    }

    // 创建消息
    const { data: newMessage, error: messageError } = await supabase
      .from('messages')
      .insert({
        room_id: roomId,
        user_id: user.id,
        content: trimmedContent,
        reply_to_id: replyToId || null,
      })
      .select(`
        id,
        room_id,
        user_id,
        content,
        roses,
        timestamp,
        reply_to_id
      `)
      .single()

    if (messageError || !newMessage) {
      console.error('Error creating message:', messageError)
      return errorResponse('CREATE_MESSAGE_FAILED', '发送消息失败', 500)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: newMessage.id,
        roomId: newMessage.room_id,
        userId: newMessage.user_id,
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          avatar: user.avatar,
        },
        content: newMessage.content,
        roses: newMessage.roses,
        timestamp: newMessage.timestamp,
        replyToId: newMessage.reply_to_id,
        hasRosed: false,
      },
    })
  } catch (error) {
    console.error('Send message error:', error)
    return errorResponse('INTERNAL_ERROR', '服务器内部错误', 500)
  }
}
