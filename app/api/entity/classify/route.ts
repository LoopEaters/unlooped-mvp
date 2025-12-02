import { NextRequest, NextResponse } from 'next/server';
import { classifyEntityType } from '@/app/lib/ai';

/**
 * POST /api/entity/classify
 *
 * Entity 이름을 받아서 AI로 타입(person/project) 분류
 *
 * Request Body:
 * {
 *   "entityName": "홍길동"
 * }
 *
 * Response:
 * {
 *   "type": "person",
 *   "confidence": 0.95
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entityName } = body;

    if (!entityName || typeof entityName !== 'string') {
      return NextResponse.json(
        { error: 'entityName is required and must be a string' },
        { status: 400 }
      );
    }

    console.log(`[API /entity/classify] 분류 시작: ${entityName}`);

    // AI 분류 실행 (서버에서만 실행됨)
    const result = await classifyEntityType(entityName);

    console.log(`[API /entity/classify] 분류 완료: ${entityName} → ${result.type}`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /entity/classify] 에러 발생:', error);

    // AI 실패 시에도 fallback 응답 반환
    return NextResponse.json(
      { type: 'unknown', confidence: 0.0 },
      { status: 200 } // 200으로 반환하여 클라이언트에서 정상 처리 가능
    );
  }
}
