import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { getEntityByName, createEntityDirect } from '@/app/lib/queries'
import type { ImportExecuteRequest, ImportExecuteResult } from '@/types/import'

export async function POST(request: NextRequest) {
  try {
    const { memos, userId }: ImportExecuteRequest = await request.json()

    if (!memos || !Array.isArray(memos) || !userId) {
      return NextResponse.json(
        { error: 'memos and userId are required' },
        { status: 400 }
      )
    }

    // 메모 개수 제한 (500개)
    if (memos.length > 500) {
      return NextResponse.json(
        { error: 'Too many memos (max 500)' },
        { status: 400 }
      )
    }

    console.log(`[Import Execute] 시작: ${memos.length}개 메모, userId: ${userId}`)

    const supabase = await createClient()

    // === Step 1: 전체 Entity 이름 수집 ===
    const allEntityNames = new Set<string>()
    memos.forEach(memo => {
      memo.entities.forEach(name => allEntityNames.add(name))
    })

    console.log(`[Import Execute] Entity 총 ${allEntityNames.size}개`)

    // === Step 2: 기존 Entity 조회 (Batch) ===
    const entityMap = new Map<string, any>()

    for (const name of Array.from(allEntityNames)) {
      const existing = await getEntityByName(name, userId)
      if (existing) {
        entityMap.set(name, existing)
      }
    }

    console.log(`[Import Execute] 기존 Entity ${entityMap.size}개 재사용`)

    // === Step 3: 새 Entity 생성 (AI 분류 포함) ===
    const newEntityNames = Array.from(allEntityNames).filter(
      name => !entityMap.has(name)
    )

    let createdEntityCount = 0

    for (const name of newEntityNames) {
      // AI 타입 분류는 createEntityDirect 내부에서 수행됨
      const entity = await createEntityDirect(name, userId)
      entityMap.set(name, entity)
      createdEntityCount++
    }

    console.log(`[Import Execute] 새 Entity ${createdEntityCount}개 생성`)

    // === Step 4: Memo 생성 (Batch Insert) ===
    const memoInserts = memos.map(parsed => ({
      content: parsed.content,
      user_id: userId,
      created_at: new Date(parsed.date).toISOString(),
    }))

    const { data: createdMemos, error: memoError } = await supabase
      .from('memo')
      .insert(memoInserts)
      .select()

    if (memoError) {
      console.error('[Import Execute] Memo 생성 실패:', memoError)
      throw new Error('Failed to create memos')
    }

    console.log(`[Import Execute] Memo ${createdMemos.length}개 생성`)

    // === Step 5: memo_entity 관계 생성 (Batch) ===
    const memoEntityInserts: Array<{ memo_id: string; entity_id: string }> = []

    createdMemos.forEach((memo, idx) => {
      const parsed = memos[idx]
      parsed.entities.forEach(entityName => {
        const entity = entityMap.get(entityName)
        if (entity) {
          memoEntityInserts.push({
            memo_id: memo.id,
            entity_id: entity.id,
          })
        }
      })
    })

    if (memoEntityInserts.length > 0) {
      const { error: linkError } = await supabase
        .from('memo_entity')
        .insert(memoEntityInserts)

      if (linkError) {
        console.error('[Import Execute] memo_entity 생성 실패:', linkError)
        throw new Error('Failed to link entities')
      }
    }

    console.log(`[Import Execute] 관계 ${memoEntityInserts.length}개 생성`)

    // === 결과 반환 ===
    const result: ImportExecuteResult = {
      success: true,
      stats: {
        memosCreated: createdMemos.length,
        entitiesCreated: createdEntityCount,
        entitiesReused: entityMap.size - createdEntityCount,
        errors: 0,
      },
    }

    console.log('[Import Execute] 완료:', result)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[Import Execute] 에러:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
