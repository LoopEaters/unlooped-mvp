/**
 * AI 모듈 메인 엔트리 포인트
 * Entity 타입 분류 기능 제공
 */

import 'server-only';
import { aiProvider } from './factory';
import { EntityType } from './types';
import type { EntityClassificationResult } from './types';
import { getCachedType, setCachedType } from './cache';

/**
 * Entity 이름으로 타입 분류
 *
 * @param entityName - 분류할 Entity 이름
 * @returns 분류 결과 (type, confidence)
 *
 * @example
 * const result = await classifyEntityType('홍길동');
 * // { type: 'person', confidence: 0.95 }
 */
export async function classifyEntityType(entityName: string): Promise<EntityClassificationResult> {
  // 1. 캐시 확인
  const cached = getCachedType(entityName);
  if (cached) {
    console.log(`[AI] 캐시 히트: ${entityName} → ${cached}`);
    return { type: cached, confidence: 1.0 };
  }

  try {
    console.log(`[AI] 분류 시작: ${entityName}`);

    // 2. AI 호출
    const result = await aiProvider.classify(entityName);

    console.log(`[AI] 분류 완료: ${entityName} → ${result.type} (신뢰도: ${result.confidence})`);

    // 3. 캐싱
    setCachedType(entityName, result.type);

    return result;
  } catch (error) {
    console.error('[AI] Classification failed:', error);
    // 에러 시 unknown 반환 (폴백)
    return { type: EntityType.UNKNOWN, confidence: 0.0 };
  }
}

// 타입 re-export
export { EntityType } from './types';
export type { EntityClassificationResult } from './types';
