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

// ==================== Cost-based Entity Layout ====================

export interface CostLayoutOptions {
  lambda?: number // crossing penalty weight
  maxPasses?: number // number of adjacent-swap passes
  timeBudgetMs?: number // time budget for local search
}

/**
 * Cost-based entity ordering using a lightweight local search.
 * Cost(order) = sum_{i<j} w_ij * (pos(i) - pos(j))^2 + lambda * crossings(order)
 * - w_ij: number of shared memos between entity i and j
 * - crossings: based on memo [minIdx, maxIdx] interval crossing heuristic
 *
 * Heuristic:
 * - Seed with optimizeEntityLayout (connection-based greedy)
 * - Perform adjacent-swap hill-climbing with efficient delta updates
 */
export function optimizeEntityLayoutCostBased<T extends { id: string; name: string }>(
  entities: T[],
  memos: Array<{ entityIds: string[] }>,
  options: CostLayoutOptions = {}
): T[] {
  const n = entities.length
  if (n <= 2) return entities

  const lambda = options.lambda ?? 1.0
  const maxPasses = options.maxPasses ?? 4
  const timeBudgetMs = options.timeBudgetMs ?? 250

  // Build weights w_ij from memos (shared memo counts)
  const weights = new Map<string, Map<string, number>>()
  entities.forEach((e) => weights.set(e.id, new Map()))
  memos.forEach((m) => {
    const ids = m.entityIds.filter((id) => weights.has(id))
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = ids[i]
        const b = ids[j]
        const wa = weights.get(a)!
        const wb = weights.get(b)!
        wa.set(b, (wa.get(b) || 0) + 1)
        wb.set(a, (wb.get(a) || 0) + 1)
      }
    }
  })

  // Seed order: use existing greedy optimizer
  let order = optimizeEntityLayout(entities, memos)
  let pos = new Map<string, number>()
  order.forEach((e, i) => pos.set(e.id, i))

  // Preprocess memos: filter to known ids and store per-entity membership
  const memoEntities: string[][] = memos.map((m) => m.entityIds.filter((id) => pos.has(id)))
  const memosOf = new Map<string, number[]>() // entityId -> memo indices
  entities.forEach((e) => memosOf.set(e.id, []))
  memoEntities.forEach((ids, mi) => {
    ids.forEach((id) => {
      const arr = memosOf.get(id)
      if (arr) arr.push(mi)
    })
  })

  // Helper: compute [minIdx, maxIdx] for memo
  const memoMin = new Array<number>(memoEntities.length)
  const memoMax = new Array<number>(memoEntities.length)
  const recomputeMemoRange = (mi: number) => {
    const ids = memoEntities[mi]
    let minV = Infinity
    let maxV = -Infinity
    for (const id of ids) {
      const p = pos.get(id)!
      if (p < minV) minV = p
      if (p > maxV) maxV = p
    }
    memoMin[mi] = isFinite(minV) ? minV : -1
    memoMax[mi] = isFinite(maxV) ? maxV : -1
  }
  for (let i = 0; i < memoEntities.length; i++) recomputeMemoRange(i)

  // Helper: crossing predicate with memo ranges
  const crosses = (aMin: number, aMax: number, bMin: number, bMax: number) =>
    (aMin < bMin && bMin < aMax && aMax < bMax) || (bMin < aMin && aMin < bMax && bMax < aMax)

  // Compute initial costs
  const distanceCost = () => {
    let sum = 0
    for (let i = 0; i < n; i++) {
      const idI = order[i].id
      const wi = weights.get(idI)!
      wi.forEach((w, idJ) => {
        const j = pos.get(idJ)!
        if (i < j) {
          const d = j - i
          sum += w * d * d
        }
      })
    }
    return sum
  }
  const crossingCount = () => {
    let c = 0
    for (let i = 0; i < memoEntities.length; i++) {
      if (memoEntities[i].length < 2) continue
      for (let j = i + 1; j < memoEntities.length; j++) {
        if (memoEntities[j].length < 2) continue
        if (crosses(memoMin[i], memoMax[i], memoMin[j], memoMax[j])) c++
      }
    }
    return c
  }

  let curDist = distanceCost()
  let curCross = crossingCount()
  let curCost = curDist + lambda * curCross

  // Local search: adjacent swaps with delta updates
  const startTime = Date.now()
  const degMemo = (id: string) => memosOf.get(id)?.length || 0

  const trySwap = (i: number) => {
    const a = order[i]
    const b = order[i + 1]
    const posA = i
    const posB = i + 1

    // Distance delta: only pairs involving a or b
    let deltaDist = 0
    const contrib = (idX: string, oldPosX: number, newPosX: number) => {
      const wx = weights.get(idX)!
      let dSum = 0
      wx.forEach((w, idY) => {
        const py = pos.get(idY)!
        if (idY === a.id || idY === b.id) return // handled separately via (a,b)
        const oldD = Math.abs(oldPosX - py)
        const newD = Math.abs(newPosX - py)
        dSum += w * (newD * newD - oldD * oldD)
      })
      return dSum
    }
    deltaDist += contrib(a.id, posA, posB)
    deltaDist += contrib(b.id, posB, posA)
    // pair (a,b)
    const wab = weights.get(a.id)!.get(b.id) || 0
    if (wab) {
      const oldD = posB - posA // 1
      const newD = posA - posB // -1
      deltaDist += wab * (newD * newD - oldD * oldD) // same here (1-1=0), but keep for generality
    }

    // Crossing delta: only pairs involving memos that include a or b
    const affectedSet = new Set<number>()
    for (const mi of memosOf.get(a.id) || []) affectedSet.add(mi)
    for (const mi of memosOf.get(b.id) || []) affectedSet.add(mi)
    if (affectedSet.size > 0) {
      const affected = Array.from(affectedSet)

      // Snapshot old mins/maxes for affected
      const oldRanges = new Map<number, { min: number; max: number }>()
      affected.forEach((mi) => oldRanges.set(mi, { min: memoMin[mi], max: memoMax[mi] }))

      // Apply swap virtually to positions of a and b
      // We won't mutate pos until we accept the move; recompute ranges on the fly
      const newRange = (mi: number) => {
        const ids = memoEntities[mi]
        let minV = Infinity
        let maxV = -Infinity
        for (const id of ids) {
          let p = pos.get(id)!
          if (id === a.id) p = posB
          else if (id === b.id) p = posA
          if (p < minV) minV = p
          if (p > maxV) maxV = p
        }
        return { min: minV, max: maxV }
      }

      // Collect pairs to evaluate (unique, unordered)
      const pairKey = (x: number, y: number) => (x < y ? `${x},${y}` : `${y},${x}`)
      const pairs = new Set<string>()
      for (const mi of affected) {
        for (let mj = 0; mj < memoEntities.length; mj++) {
          if (mi === mj) continue
          if (memoEntities[mj].length < 2) continue
          pairs.add(pairKey(mi, mj))
        }
      }

      let deltaCross = 0
      pairs.forEach((key) => {
        const [s1, s2] = key.split(',')
        const i1 = parseInt(s1, 10)
        const i2 = parseInt(s2, 10)
        const aOld = oldRanges.has(i1) ? oldRanges.get(i1)! : { min: memoMin[i1], max: memoMax[i1] }
        const bOld = oldRanges.has(i2) ? oldRanges.get(i2)! : { min: memoMin[i2], max: memoMax[i2] }
        const oldC = crosses(aOld.min, aOld.max, bOld.min, bOld.max) ? 1 : 0

        const aNew = oldRanges.has(i1) ? newRange(i1) : aOld
        const bNew = oldRanges.has(i2) ? newRange(i2) : bOld
        const newC = crosses(aNew.min, aNew.max, bNew.min, bNew.max) ? 1 : 0

        deltaCross += newC - oldC
      })

      const delta = deltaDist + lambda * deltaCross
      if (delta < 0) {
        // Accept swap: mutate order, pos, and update ranges for affected memos
        const tmp = order[i]
        order[i] = order[i + 1]
        order[i + 1] = tmp
        pos.set(a.id, posB)
        pos.set(b.id, posA)

        // Update memo ranges for affected
        affected.forEach((mi) => {
          const r = newRange(mi)
          memoMin[mi] = r.min
          memoMax[mi] = r.max
        })

        curDist += deltaDist
        curCross += deltaCross
        curCost += delta
        return true
      }
      return false
    } else {
      // No crossing change possible, only distance matters
      if (deltaDist < 0) {
        const tmp = order[i]
        order[i] = order[i + 1]
        order[i + 1] = tmp
        pos.set(a.id, posB)
        pos.set(b.id, posA)
        curDist += deltaDist
        curCost += deltaDist
        return true
      }
      return false
    }
  }

  // Perform passes until no improvement or time budget reached
  for (let pass = 0; pass < maxPasses; pass++) {
    let improved = false
    for (let i = 0; i < n - 1; i++) {
      if (Date.now() - startTime > timeBudgetMs) break
      const ok = trySwap(i)
      if (ok) {
        improved = true
        // allow backtracking one step to catch chains
        if (i > 0) i -= 2
      }
    }
    if (!improved || Date.now() - startTime > timeBudgetMs) break
  }

  return order
}
