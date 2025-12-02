/**
 * Entity 타입 분류 결과 캐시
 * 간단한 LRU 캐시 구현
 */

import { EntityType } from './types';

const entityTypeCache = new Map<string, EntityType>();
const MAX_CACHE_SIZE = 100;

/**
 * 캐시에서 Entity 타입 조회
 */
export function getCachedType(name: string): EntityType | undefined {
  return entityTypeCache.get(name);
}

/**
 * 캐시에 Entity 타입 저장
 * LRU 방식: 캐시 크기가 MAX_CACHE_SIZE를 초과하면 가장 오래된 항목 제거
 */
export function setCachedType(name: string, type: EntityType): void {
  if (entityTypeCache.size >= MAX_CACHE_SIZE) {
    // 첫 번째 항목 제거 (가장 오래된 항목)
    const firstKey = entityTypeCache.keys().next().value;
    if (firstKey) {
      entityTypeCache.delete(firstKey);
    }
  }
  entityTypeCache.set(name, type);
}

/**
 * 캐시 초기화 (테스트용)
 */
export function clearCache(): void {
  entityTypeCache.clear();
}
