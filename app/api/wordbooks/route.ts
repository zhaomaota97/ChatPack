import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, errorResponse } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const { data: wordbooks, error } = await supabase
      .from('wordbooks')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching wordbooks:', error)
      return errorResponse('FETCH_FAILED', '获取单词书列表失败', 500)
    }

    const formattedWordbooks = (wordbooks || []).map((wb: any) => ({
      id: wb.id,
      name: wb.name,
      level: wb.level,
      description: wb.description,
      orderIndex: wb.order_index,
      isActive: wb.is_active,
      createdAt: wb.created_at,
      updatedAt: wb.updated_at,
    }))

    return NextResponse.json({
      success: true,
      data: formattedWordbooks,
    })
  } catch (error) {
    console.error('Get wordbooks error:', error)
    return errorResponse('INTERNAL_ERROR', '服务器内部错误', 500)
  }
}
