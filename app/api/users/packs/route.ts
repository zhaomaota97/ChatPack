import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, errorResponse } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult

  try {
    // 获取用户所有卡包
    const { data, error } = await supabase
      .from('user_packs')
      .select(`
        user_id,
        pack_id,
        count,
        packs (
          id,
          name,
          description,
          card_count,
          pack_type,
          rarity_type,
          rarity_weights,
          is_active,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .gt('count', 0)

    if (error) {
      console.error('Error fetching user packs:', error)
      return errorResponse('FETCH_FAILED', '获取卡包失败', 500)
    }

    const userPacks = (data || []).map((item: any) => ({
      userId: item.user_id,
      packId: item.pack_id,
      count: item.count,
      pack: {
        id: item.packs.id,
        name: item.packs.name,
        description: item.packs.description,
        cardCount: item.packs.card_count,
        packType: item.packs.pack_type,
        rarityType: item.packs.rarity_type,
        rarityWeights: item.packs.rarity_weights,
        isActive: item.packs.is_active,
        createdAt: item.packs.created_at,
      },
    }))

    return NextResponse.json({
      success: true,
      data: userPacks,
    })
  } catch (error) {
    console.error('Get user packs error:', error)
    return errorResponse('INTERNAL_ERROR', '服务器内部错误', 500)
  }
}
