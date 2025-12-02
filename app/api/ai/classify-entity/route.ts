import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { classifyEntityType } from '@/app/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { entityId, entityName } = await request.json()

    if (!entityId || !entityName) {
      return NextResponse.json(
        { error: 'entityId and entityName are required' },
        { status: 400 }
      )
    }

    console.log('🤖 [AI API] Entity 타입 분류 시작', { entityId, entityName })

    // Supabase 클라이언트 생성
    const supabase = await createClient()

    // 1. AI 분류 호출
    const { type, confidence } = await classifyEntityType(entityName)

    console.log('✅ [AI API] 분류 완료', { entityName, type, confidence })

    // 2. DB 업데이트
    const { error: updateError } = await supabase
      .from('entity')
      .update({ type })
      .eq('id', entityId)

    if (updateError) {
      console.error('❌ [AI API] DB 업데이트 실패', updateError)
      return NextResponse.json(
        { error: 'Failed to update entity type' },
        { status: 500 }
      )
    }

    console.log('💾 [AI API] DB 업데이트 성공', { entityId, type })

    return NextResponse.json({
      success: true,
      type,
      confidence,
    })
  } catch (error) {
    console.error('❌ [AI API] 예상치 못한 에러', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
