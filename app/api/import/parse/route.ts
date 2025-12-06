import { NextRequest, NextResponse } from 'next/server'
import { aiProvider } from '@/app/lib/ai/factory'
import type { BulkImportParseResult } from '@/types/import'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'text is required' },
        { status: 400 }
      )
    }

    // 텍스트 길이 제한 (100,000자)
    if (text.length > 100_000) {
      return NextResponse.json(
        { error: 'Text too long (max 100,000 characters)' },
        { status: 400 }
      )
    }

    console.log(`[Import Parse] 시작: ${text.length}자`)

    // Gemini AI 파싱
    const result: BulkImportParseResult = await aiProvider.parseBulkImport(text)

    console.log(`[Import Parse] 완료: ${result.stats.totalMemos}개 메모`)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[Import Parse] 에러:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
