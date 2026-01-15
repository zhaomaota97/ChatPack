import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, errorResponse } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    // 获取所有激活的卡包
    const { data, error } = await supabase
      .from('packs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching packs:', error)
      return errorResponse('FETCH_FAILED', '获取卡包列表失败', 500)
    }

    const packs = (data || []).map((pack: any) => ({
      id: pack.id,
      name: pack.name,
      description: pack.description,
      cardCount: pack.card_count,
      packType: pack.pack_type,
      rarityType: pack.rarity_type,
      rarityWeights: pack.rarity_weights,
      isActive: pack.is_active,
      createdAt: pack.created_at,
    }))

    return NextResponse.json({
      success: true,
      data: packs,
    })
  } catch (error) {
    console.error('Get packs error:', error)
    return errorResponse('INTERNAL_ERROR', '服务器内部错误', 500)
  }
}
