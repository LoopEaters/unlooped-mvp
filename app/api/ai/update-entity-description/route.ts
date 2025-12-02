import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/app/lib/supabase/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { entityId } = await request.json()

    if (!entityId) {
      return NextResponse.json(
        { error: 'entityId is required' },
        { status: 400 }
      )
    }

    console.log('🤖 [AI API] Entity description 업데이트 시작', { entityId })

    // Supabase 클라이언트 생성
    const supabase = await createClient()

    // 1. Entity 정보 조회
    const { data: entity, error: entityError } = await supabase
      .from('entity')
      .select('id, name, description')
      .eq('id', entityId)
      .single()

    if (entityError || !entity) {
      console.error('❌ [AI API] Entity 조회 실패', entityError)
      return NextResponse.json(
        { error: 'Entity not found' },
        { status: 404 }
      )
    }

    console.log('✅ [AI API] Entity 조회 성공', entity.name)

    // 2. 해당 Entity와 연결된 모든 메모 조회
    const { data: memoLinks, error: memoError } = await supabase
      .from('memo_entity')
      .select(`
        memo:memo_id (
          id,
          content,
          created_at
        )
      `)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
      .limit(20) // 최근 20개만

    if (memoError) {
      console.error('❌ [AI API] 메모 조회 실패', memoError)
      return NextResponse.json(
        { error: 'Failed to fetch memos' },
        { status: 500 }
      )
    }

    const memos = memoLinks?.map((link) => link.memo).filter(Boolean) || []

    console.log('✅ [AI API] 메모 조회 성공', { count: memos.length })

    // 3. 메모가 없으면 업데이트하지 않음
    if (memos.length === 0) {
      console.log('⏭️ [AI API] 메모가 없어 스킵')
      return NextResponse.json({
        success: true,
        description: entity.description,
        updated: false,
      })
    }

    // 4. OpenAI API 호출
    const prompt = `다음은 "${entity.name}" 엔티티와 관련된 메모들입니다:

${memos.map((m: { content: string }) => `- ${m.content}`).join('\n')}

위 메모들을 바탕으로 이 엔티티에 대한 간결하고 정확한 설명(description)을 2-3문장으로 작성해주세요. 핵심 정보만 포함하세요.`

    console.log('🚀 [AI API] OpenAI 호출 시작')

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            '당신은 메모를 분석하여 엔티티에 대한 간결하고 유용한 설명을 작성하는 어시스턴트입니다.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 200,
    })

    const newDescription = completion.choices[0]?.message?.content?.trim()

    if (!newDescription) {
      console.error('❌ [AI API] OpenAI 응답 없음')
      return NextResponse.json(
        { error: 'No response from OpenAI' },
        { status: 500 }
      )
    }

    console.log('✅ [AI API] OpenAI 응답 성공', { newDescription })

    // 5. Entity description 업데이트
    const { error: updateError } = await supabase
      .from('entity')
      .update({ description: newDescription })
      .eq('id', entityId)

    if (updateError) {
      console.error('❌ [AI API] Entity 업데이트 실패', updateError)
      return NextResponse.json(
        { error: 'Failed to update entity' },
        { status: 500 }
      )
    }

    console.log('✅ [AI API] Entity 업데이트 성공')

    return NextResponse.json({
      success: true,
      description: newDescription,
      updated: true,
    })
  } catch (error) {
    console.error('❌ [AI API] 예상치 못한 에러', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
