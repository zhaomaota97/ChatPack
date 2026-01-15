import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, errorResponse } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult
  const messageId = params.id

  try {
    // 检查消息是否存在
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('id, user_id, roses')
      .eq('id', messageId)
      .single()

    if (messageError || !message) {
      return errorResponse('MESSAGE_NOT_FOUND', '消息不存在', 404)
    }

    // 不能给自己的消息送花
    if (message.user_id === user.id) {
      return errorResponse('CANNOT_ROSE_OWN_MESSAGE', '不能给自己的消息送花', 400)
    }

    // 检查是否已经送过花
    const { data: existingRose } = await supabase
      .from('rose_transactions')
      .select('id')
      .eq('message_id', messageId)
      .eq('sender_id', user.id)
      .single()

    if (existingRose) {
      return errorResponse('ALREADY_ROSED', '已经送过花了', 400)
    }

    // 创建送花记录
    const { error: roseError } = await supabase
      .from('rose_transactions')
      .insert({
        message_id: messageId,
        sender_id: user.id,
      })

    if (roseError) {
      console.error('Error creating rose:', roseError)
      return errorResponse('ROSE_FAILED', '送花失败', 500)
    }

    // 更新消息的鲜花数
    await supabase
      .from('messages')
      .update({ roses: message.roses + 1 })
      .eq('id', messageId)

    // 更新消息作者的总鲜花数
    await supabase.rpc('increment_user_roses', {
      user_id: message.user_id,
      amount: 1,
    })

    return NextResponse.json({
      success: true,
      data: {
        messageId,
        roses: message.roses + 1,
      },
    })
  } catch (error) {
    console.error('Rose message error:', error)
    return errorResponse('INTERNAL_ERROR', '服务器内部错误', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult
  const messageId = params.id

  try {
    // 检查消息是否存在
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('id, user_id, roses')
      .eq('id', messageId)
      .single()

    if (messageError || !message) {
      return errorResponse('MESSAGE_NOT_FOUND', '消息不存在', 404)
    }

    // 检查是否送过花
    const { data: existingRose, error: roseError } = await supabase
      .from('rose_transactions')
      .select('id')
      .eq('message_id', messageId)
      .eq('sender_id', user.id)
      .single()

    if (roseError || !existingRose) {
      return errorResponse('NOT_ROSED', '还没有送过花', 400)
    }

    // 删除送花记录
    await supabase
      .from('rose_transactions')
      .delete()
      .eq('message_id', messageId)
      .eq('sender_id', user.id)

    // 更新消息的鲜花数
    await supabase
      .from('messages')
      .update({ roses: Math.max(0, message.roses - 1) })
      .eq('id', messageId)

    // 更新消息作者的总鲜花数
    await supabase.rpc('increment_user_roses', {
      user_id: message.user_id,
      amount: -1,
    })

    return NextResponse.json({
      success: true,
      data: {
        messageId,
        roses: Math.max(0, message.roses - 1),
      },
    })
  } catch (error) {
    console.error('Unrose message error:', error)
    return errorResponse('INTERNAL_ERROR', '服务器内部错误', 500)
  }
}
