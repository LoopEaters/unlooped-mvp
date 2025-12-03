import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Tailwind CSS 클래스명을 조건부로 병합하는 유틸리티 함수
 * clsx와 tailwind-merge를 결합하여 중복된 클래스를 제거하고 최적화합니다.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isProduction() {
    return process.env.VERCEL_ENV === 'production';
}

// ==================== Timeline Utilities ====================

/**
 * 타임라인 시간 범위 계산
 */
export function getTimeRange(timestamps: string[]) {
  if (timestamps.length === 0) {
    const now = new Date();
    return {
      start: now.getTime() - 24 * 60 * 60 * 1000, // 24시간 전
      end: now.getTime(),
    };
  }

  const times = timestamps.map((ts) => new Date(ts).getTime());
  const start = Math.min(...times);
  const end = Math.max(...times);

  // 시작/끝에 여백 추가 (전체 범위의 5%)
  const padding = (end - start) * 0.05;

  return {
    start: start - padding,
    end: end + padding,
  };
}

/**
 * Timestamp를 픽셀 Y좌표로 변환
 * @param timestamp - ISO 8601 timestamp string
 * @param timeRange - 시간 범위 { start, end } (Unix timestamp)
 * @param canvasHeight - 캔버스 전체 높이
 * @param topPadding - 상단 여백 (날짜 레이블 등)
 * @returns Y 좌표 (픽셀)
 */
export function timestampToY(
  timestamp: string,
  timeRange: { start: number; end: number },
  canvasHeight: number,
  topPadding = 60
): number {
  const time = new Date(timestamp).getTime();
  const totalTime = timeRange.end - timeRange.start;
  const ratio = (time - timeRange.start) / totalTime;

  const availableHeight = canvasHeight - topPadding - 40; // 하단 여백 40px
  return topPadding + ratio * availableHeight;
}

/**
 * Y좌표를 timestamp로 역변환
 */
export function yToTimestamp(
  y: number,
  timeRange: { start: number; end: number },
  canvasHeight: number,
  topPadding = 60
): number {
  const availableHeight = canvasHeight - topPadding - 40;
  const ratio = (y - topPadding) / availableHeight;
  return timeRange.start + ratio * (timeRange.end - timeRange.start);
}

/**
 * 시간 간격에 따라 적절한 날짜 포맷 반환
 */
export function formatTimelineDate(timestamp: number, totalRange: number): string {
  const date = new Date(timestamp);

  // 1일 미만: 시간:분
  if (totalRange < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  }

  // 30일 미만: 월/일 시간
  if (totalRange < 30 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  }

  // 그 외: 년/월/일
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * 상대적 시간 표시 (n일 전, n시간 전)
 * @param dateString - ISO timestamp string
 * @returns "n일 전" 또는 "n시간 전" 형식의 문자열
 */
export function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();

  // 밀리초를 시간 단위로 변환
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // 0일 (24시간 이내)
  if (diffDays === 0) {
    if (diffHours === 0) {
      if (diffMinutes === 0) {
        return '방금 전';
      }
      return `${diffMinutes}분 전`;
    }
    return `${diffHours}시간 전`;
  }

  // 1일 이상
  return `${diffDays}일 전`;
}

// ==================== Entity Layout Optimization ====================

interface EntityWithConnections<T> {
  entity: T
  connections: Map<string, number> // entityId -> 공유 메모 수
}

/**
 * Entity 배치 최적화: 중간 entity 건너뛰기를 최소화
 *
 * Greedy Connection-based 알고리즘:
 * 1. Entity 간 연결 강도(공유 메모 수) 계산
 * 2. 가장 강하게 연결된 entity들을 가까이 배치
 *
 * @param entities - Entity 배열
 * @param memos - Memo 배열 (entityIds 포함)
 * @returns 최적화된 순서의 Entity 배열
 */
export function optimizeEntityLayout<T extends { id: string; name: string }>(
  entities: T[],
  memos: Array<{ entityIds: string[] }>
): T[] {
  if (entities.length <= 2) return entities

  // 1. Entity 간 연결 강도 행렬 생성
  const connectionMatrix = new Map<string, Map<string, number>>()

  entities.forEach((entity) => {
    connectionMatrix.set(entity.id, new Map())
  })

  // 각 memo에서 entity pair의 연결 강도 증가
  memos.forEach((memo) => {
    const entityIds = memo.entityIds
    for (let i = 0; i < entityIds.length; i++) {
      for (let j = i + 1; j < entityIds.length; j++) {
        const id1 = entityIds[i]
        const id2 = entityIds[j]

        if (connectionMatrix.has(id1) && connectionMatrix.has(id2)) {
          const map1 = connectionMatrix.get(id1)!
          const map2 = connectionMatrix.get(id2)!

          map1.set(id2, (map1.get(id2) || 0) + 1)
          map2.set(id1, (map2.get(id1) || 0) + 1)
        }
      }
    }
  })

  // 2. Greedy 배치
  const ordered: T[] = []
  const remaining = new Set(entities.map((e) => e.id))

  // 시작: 가장 많은 연결을 가진 entity
  let maxConnections = 0
  let startEntityId = entities[0].id

  entities.forEach((entity) => {
    const totalConnections = Array.from(connectionMatrix.get(entity.id)!.values()).reduce(
      (sum, count) => sum + count,
      0
    )
    if (totalConnections > maxConnections) {
      maxConnections = totalConnections
      startEntityId = entity.id
    }
  })

  ordered.push(entities.find((e) => e.id === startEntityId)!)
  remaining.delete(startEntityId)

  // 3. 순차적으로 가장 강하게 연결된 entity 추가
  while (remaining.size > 0) {
    let bestEntityId: string | null = null
    let bestScore = -1

    // 이미 배치된 entity들과의 연결 강도 합산
    remaining.forEach((entityId) => {
      let score = 0

      ordered.forEach((placedEntity) => {
        const connections = connectionMatrix.get(entityId)!
        score += connections.get(placedEntity.id) || 0
      })

      // 마지막 entity와의 거리 가중치 (더 최근에 배치된 것과 가까이)
      const lastEntityConnections = connectionMatrix.get(ordered[ordered.length - 1].id)!
      const lastScore = lastEntityConnections.get(entityId) || 0
      score += lastScore * 2 // 마지막 entity와의 연결 2배 가중치

      if (score > bestScore) {
        bestScore = score
        bestEntityId = entityId
      }
    })

    if (bestEntityId) {
      ordered.push(entities.find((e) => e.id === bestEntityId)!)
      remaining.delete(bestEntityId)
    } else {
      // 연결이 없는 entity는 뒤에 배치
      const remainingEntity = entities.find((e) => remaining.has(e.id))!
      ordered.push(remainingEntity)
      remaining.delete(remainingEntity.id)
    }
  }

  return ordered
}

/**
 * 현재 배치의 crossing 수 계산 (디버깅/평가용)
 */
export function calculateCrossings(
  entities: Array<{ id: string }>,
  memos: Array<{ entityIds: string[] }>
): number {
  const entityIndexMap = new Map<string, number>()
  entities.forEach((entity, index) => {
    entityIndexMap.set(entity.id, index)
  })

  let crossings = 0

  // 각 memo pair에 대해 crossing 확인
  for (let i = 0; i < memos.length; i++) {
    for (let j = i + 1; j < memos.length; j++) {
      const memo1 = memos[i]
      const memo2 = memos[j]

      if (memo1.entityIds.length < 2 || memo2.entityIds.length < 2) continue

      // memo1의 범위
      const memo1Indices = memo1.entityIds
        .map((id) => entityIndexMap.get(id))
        .filter((idx): idx is number => idx !== undefined)
      const memo1Min = Math.min(...memo1Indices)
      const memo1Max = Math.max(...memo1Indices)

      // memo2의 범위
      const memo2Indices = memo2.entityIds
        .map((id) => entityIndexMap.get(id))
        .filter((idx): idx is number => idx !== undefined)
      const memo2Min = Math.min(...memo2Indices)
      const memo2Max = Math.max(...memo2Indices)

      // Crossing 조건: 범위가 교차하지만 완전히 포함되지 않음
      if (
        (memo1Min < memo2Min && memo2Min < memo1Max && memo1Max < memo2Max) ||
        (memo2Min < memo1Min && memo1Min < memo2Max && memo2Max < memo1Max)
      ) {
        crossings++
      }
    }
  }

  return crossings
}

