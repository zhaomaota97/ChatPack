import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, errorResponse } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

// 获取所有卡包
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const { data: packs, error } = await supabase
      .from('packs')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching packs:', error)
      return errorResponse('FETCH_FAILED', '获取卡包列表失败', 500)
    }

    const formattedPacks = (packs || []).map((pack: any) => ({
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
      data: formattedPacks,
    })
  } catch (error) {
    console.error('Get packs error:', error)
    return errorResponse('INTERNAL_ERROR', '服务器内部错误', 500)
  }
}

// 创建卡包
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const body = await request.json()
    const { name, description, cardCount, packType, rarityType, rarityWeights } = body

    if (!name || !packType || cardCount < 1) {
      return errorResponse('MISSING_FIELDS', '缺少必填字段')
    }

    // 验证约束
    if (packType === 'SPECIAL' && !rarityType) {
      return errorResponse('INVALID_PARAMS', '特殊卡包必须指定稀有度类型')
    }

    if (packType === 'NORMAL' && !rarityWeights) {
      return errorResponse('INVALID_PARAMS', '普通卡包必须指定稀有度权重')
    }

    // 创建卡包
    const { data: newPack, error: packError } = await supabase
      .from('packs')
      .insert({
        name,
        description,
        card_count: cardCount,
        pack_type: packType,
        rarity_type: rarityType || null,
        rarity_weights: rarityWeights || null,
      })
      .select()
      .single()

    if (packError || !newPack) {
      console.error('Error creating pack:', packError)
      return errorResponse('CREATE_FAILED', '创建卡包失败', 500)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: newPack.id,
        name: newPack.name,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Create pack error:', error)
    return errorResponse('INTERNAL_ERROR', '服务器内部错误', 500)
  }
}
