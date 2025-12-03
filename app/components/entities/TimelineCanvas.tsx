'use client'

import { Line, Circle, Text, Group, Rect, Path } from 'react-konva'
import type { Database } from '@/types/supabase'
import { timestampToY, formatTimelineDate } from '@/app/lib/util'
import { getEntityTypeHexColor, defaultTheme } from '@/app/lib/theme'
import { useState } from 'react'
import MemoTooltip from './MemoTooltip'

type Entity = Database['public']['Tables']['entity']['Row']
type Memo = Database['public']['Tables']['memo']['Row'] & {
  entityIds: string[]
}

interface TimelineCanvasProps {
  entities: Entity[]
  memos: Memo[]
  timeRange: { start: number; end: number }
  canvasWidth: number
  canvasHeight: number
  scale: number
  hoveredMemoId: string | null
  selectedMemoId: string | null
  hoveredEntityId: string | null
  onMemoClick: (memoId: string) => void
  onMemoHover: (memoId: string | null) => void
  onEntityHover: (entityId: string | null) => void
  onEntityClick: (entityId: string) => void
}

const ENTITY_COLUMN_WIDTH = 85 // 최소 간격 (이름이 거의 붙음)
const LEFT_PADDING = 120
const TOP_PADDING = 80

export default function TimelineCanvas({
  entities,
  memos,
  timeRange,
  canvasWidth,
  canvasHeight,
  scale,
  hoveredMemoId,
  selectedMemoId,
  hoveredEntityId,
  onMemoClick,
  onMemoHover,
  onEntityHover,
  onEntityClick,
}: TimelineCanvasProps) {
  const [tooltipData, setTooltipData] = useState<{
    memo: Memo
    x: number
    y: number
  } | null>(null)

  // Entity별 X 좌표 계산
  const entityXPositions = entities.reduce(
    (acc, entity, index) => {
      acc[entity.id] = LEFT_PADDING + index * ENTITY_COLUMN_WIDTH
      return acc
    },
    {} as Record<string, number>
  )

  // 각 Entity의 첫/마지막 메모 위치 계산
  const entityMemoRanges = entities.map((entity) => {
    const entityMemos = memos.filter((m) => m.entityIds.includes(entity.id))
    if (entityMemos.length === 0) return null

    const timestamps = entityMemos
      .map((m) => m.created_at)
      .filter((t): t is string => t !== null)
    if (timestamps.length === 0) return null

    const minY = timestampToY(
      timestamps.reduce((a, b) => (a < b ? a : b)),
      timeRange,
      canvasHeight,
      TOP_PADDING
    )
    const maxY = timestampToY(
      timestamps.reduce((a, b) => (a > b ? a : b)),
      timeRange,
      canvasHeight,
      TOP_PADDING
    )

    return { entityId: entity.id, minY, maxY, memoCount: entityMemos.length }
  }).filter((r): r is NonNullable<typeof r> => r !== null)

  // 시간 눈금 생성 (scale에 따라 동적 조정)
  const timeMarks = []
  const totalRange = timeRange.end - timeRange.start
  // scale이 클수록 더 많은 가로선 (확대 시 더 세밀하게)
  const baseInterval = 80 / scale // scale 1.0일 때 80px, 2.0일 때 40px
  const markCount = Math.min(24, Math.max(6, Math.floor(canvasHeight / baseInterval)))

  for (let i = 0; i <= markCount; i++) {
    const timestamp = timeRange.start + (totalRange * i) / markCount
    const y = timestampToY(
      new Date(timestamp).toISOString(),
      timeRange,
      canvasHeight,
      TOP_PADDING
    )
    const isMajor = i % 3 === 0 // 3의 배수마다 강조
    timeMarks.push({ timestamp, y, isMajor })
  }

  return (
    <>
      {/* ===== 눈금 선 (배경) ===== */}
      {timeMarks.map((mark, i) => (
        <Line
          key={`time-grid-${i}`}
          points={[
            LEFT_PADDING - (mark.isMajor ? 30 : 20),
            mark.y,
            canvasWidth,
            mark.y,
          ]}
          stroke={
            mark.isMajor
              ? defaultTheme.timeline.timeScale.majorLine
              : defaultTheme.timeline.timeScale.line
          }
          strokeWidth={mark.isMajor ? 1.5 : 0.5}
          dash={mark.isMajor ? undefined : [4, 4]}
          opacity={mark.isMajor ? 0.6 : 0.3}
        />
      ))}

      {/* ===== Entity 수직선 (레이블은 나중에) ===== */}
      {entityMemoRanges.map((range) => {
        const entity = entities.find((e) => e.id === range.entityId)
        if (!entity) return null

        const x = entityXPositions[entity.id]
        const color = getEntityTypeHexColor(entity.type)
        const isHovered = hoveredEntityId === entity.id

        return (
          <Line
            key={`entity-line-${entity.id}`}
            points={[x, range.minY, x, range.maxY]}
            stroke={isHovered ? defaultTheme.timeline.entityLineActive : color}
            strokeWidth={isHovered ? 3 : 2}
            opacity={isHovered ? 0.9 : 0.5}
            hitStrokeWidth={20} // Hover 감지 영역 넓게
            onMouseEnter={(e) => {
              onEntityHover(entity.id)
              const stage = e.target.getStage()
              if (stage) stage.container().style.cursor = 'pointer'
            }}
            onMouseLeave={(e) => {
              onEntityHover(null)
              const stage = e.target.getStage()
              if (stage) stage.container().style.cursor = 'default'
            }}
          />
        )
      })}

      {/* ===== Memo 렌더링 ===== */}
      {memos.map((memo) => {
        if (!memo.created_at || memo.entityIds.length === 0) return null

        const y = timestampToY(memo.created_at, timeRange, canvasHeight, TOP_PADDING)
        const isHovered = hoveredMemoId === memo.id
        const isSelected = selectedMemoId === memo.id

        // 1개 entity: 점
        if (memo.entityIds.length === 1) {
          const entityId = memo.entityIds[0]
          const x = entityXPositions[entityId]
          if (x === undefined) return null

          const entity = entities.find((e) => e.id === entityId)
          const color = getEntityTypeHexColor(entity?.type)

          return (
            <Circle
              key={memo.id}
              x={x}
              y={y}
              radius={isSelected ? 7 : isHovered ? 6 : 5}
              fill={color}
              opacity={
                isSelected
                  ? defaultTheme.timeline.memo.selectedOpacity
                  : isHovered
                    ? defaultTheme.timeline.memo.hoverOpacity
                    : 0.8
              }
              shadowBlur={isSelected ? 12 : isHovered ? 8 : 0}
              shadowColor={color}
              hitStrokeWidth={16} // Hover 영역 넓게
              onClick={() => onMemoClick(memo.id)}
              onMouseEnter={(e) => {
                onMemoHover(memo.id)
                const stage = e.target.getStage()
                if (stage) stage.container().style.cursor = 'pointer'
                setTooltipData({ memo, x, y })
              }}
              onMouseLeave={(e) => {
                onMemoHover(null)
                const stage = e.target.getStage()
                if (stage) stage.container().style.cursor = 'default'
                setTooltipData(null)
              }}
            />
          )
        }

        // 2개 이상 entity: 베지어 곡선 + 점
        const entityXs = memo.entityIds
          .map((id) => ({ id, x: entityXPositions[id] }))
          .filter((item) => item.x !== undefined)
          .sort((a, b) => a.x! - b.x!)

        if (entityXs.length < 2) return null

        const firstEntity = entities.find((e) => e.id === entityXs[0].id)
        const color = getEntityTypeHexColor(firstEntity?.type)

        // 중간에 건너뛰는 entity 찾기
        const firstIndex = entities.findIndex((e) => e.id === entityXs[0].id)
        const lastIndex = entities.findIndex((e) => e.id === entityXs[entityXs.length - 1].id)

        // 건너뛰는 entity들의 X 좌표
        const skippedEntityXs: number[] = []
        for (let i = firstIndex + 1; i < lastIndex; i++) {
          const entityId = entities[i].id

          // 이 entity가 현재 memo에 포함되지 않았는지 확인
          if (!memo.entityIds.includes(entityId)) {
            // 이 entity의 선분 범위 찾기
            const range = entityMemoRanges.find((r) => r.entityId === entityId)

            if (range) {
              // memo의 Y 좌표가 entity 선분의 Y 범위 내에 있는지 확인
              if (y >= range.minY && y <= range.maxY) {
                // 실제로 교차함 - 반원 필요
                skippedEntityXs.push(entityXPositions[entityId])
              }
              // Y 범위 밖이면 교차하지 않으므로 건너뜀
            }
          }
        }

        // 경로 생성
        let pathData: string
        if (skippedEntityXs.length > 0) {
          // 반원으로 우회하는 경로
          const startX = entityXs[0].x!
          const endX = entityXs[entityXs.length - 1].x!
          // scale에 따라 반지름 조정 (화면상 크기 일정하게 유지)
          const arcRadius = 12 / scale

          let path = `M ${startX} ${y}` // 시작점

          // 각 건너뛰는 entity마다 반원 그리기
          skippedEntityXs.forEach((skipX) => {
            // 반원 전까지 직선
            const beforeArcX = skipX - arcRadius
            path += ` L ${beforeArcX} ${y}`

            // 반원 (위로 우회)
            const afterArcX = skipX + arcRadius
            path += ` A ${arcRadius} ${arcRadius} 0 0 0 ${afterArcX} ${y}`
          })

          // 마지막까지 직선
          path += ` L ${endX} ${y}`
          pathData = path
        } else {
          // 직선 연결
          pathData = `M ${entityXs[0].x} ${y} L ${entityXs[entityXs.length - 1].x} ${y}`
        }

        return (
          <Group key={memo.id}>
            {/* 연결선 (Path 또는 Line) */}
            <Path
              data={pathData}
              stroke={color}
              strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 2}
              opacity={
                isSelected
                  ? defaultTheme.timeline.memo.selectedOpacity
                  : isHovered
                    ? defaultTheme.timeline.memo.hoverOpacity
                    : 0.7
              }
              shadowBlur={isSelected ? 10 : isHovered ? 6 : 0}
              shadowColor={color}
              hitStrokeWidth={16} // Hover 영역 넓게
              onClick={() => onMemoClick(memo.id)}
              onMouseEnter={(e) => {
                onMemoHover(memo.id)
                const stage = e.target.getStage()
                if (stage) stage.container().style.cursor = 'pointer'
                const centerX = (entityXs[0].x! + entityXs[entityXs.length - 1].x!) / 2
                // 반원이 있으면 위쪽에, 없으면 같은 높이에 (scale 고려)
                const arcRadius = 12 / scale
                const tooltipY = skippedEntityXs.length > 0 ? y - arcRadius - 23 : y
                setTooltipData({ memo, x: centerX, y: tooltipY })
              }}
              onMouseLeave={(e) => {
                onMemoHover(null)
                const stage = e.target.getStage()
                if (stage) stage.container().style.cursor = 'default'
                setTooltipData(null)
              }}
            />
            {/* 양 끝 점 */}
            {entityXs.map((item, i) => (
              <Circle
                key={`${memo.id}-${i}`}
                x={item.x!}
                y={y}
                radius={isSelected ? 5 : isHovered ? 4.5 : 4}
                fill={color}
                opacity={
                  isSelected
                    ? defaultTheme.timeline.memo.selectedOpacity
                    : isHovered
                      ? defaultTheme.timeline.memo.hoverOpacity
                      : 0.8
                }
              />
            ))}
          </Group>
        )
      })}

      {/* ===== Entity 레이블 (최상위 z-index) ===== */}
      {entityMemoRanges.map((range) => {
        const entity = entities.find((e) => e.id === range.entityId)
        if (!entity) return null

        const x = entityXPositions[entity.id]
        const color = getEntityTypeHexColor(entity.type)
        const isHovered = hoveredEntityId === entity.id

        return (
          <Group key={`entity-label-${entity.id}`}>
            {/* 클릭 영역 (투명 사각형) */}
            <Rect
              x={x - 45}
              y={range.minY - 42}
              width={90}
              height={32}
              fill="transparent"
              onClick={() => onEntityClick(entity.id)}
              onMouseEnter={(e) => {
                onEntityHover(entity.id)
                const stage = e.target.getStage()
                if (stage) stage.container().style.cursor = 'pointer'
              }}
              onMouseLeave={(e) => {
                onEntityHover(null)
                const stage = e.target.getStage()
                if (stage) stage.container().style.cursor = 'default'
              }}
            />
            {/* Entity 이름 (선 위 중앙) - 줄바꿈 가능 */}
            <Text
              x={x - 45}
              y={range.minY - 40}
              width={90}
              text={entity.name}
              fontSize={12}
              fill="#FFFFFF"
              align="center"
              fontStyle="bold"
              opacity={isHovered ? 1 : 0.9}
              wrap="word"
              ellipsis={false}
              listening={false} // 클릭은 Rect에서만 처리
            />
            {/* Type 레이블 */}
            <Text
              x={x - 45}
              y={range.minY - 14}
              width={90}
              text={`${entity.type || 'unknown'} · ${range.memoCount}`}
              fontSize={9}
              fill={isHovered ? color : color}
              align="center"
              opacity={isHovered ? 1 : 0.7}
              listening={false} // 클릭은 Rect에서만 처리
            />
          </Group>
        )
      })}

      {/* ===== Tooltip (최최상위) ===== */}
      {tooltipData && (
        <MemoTooltip
          memo={tooltipData.memo}
          x={tooltipData.x}
          y={tooltipData.y}
          canvasWidth={canvasWidth}
        />
      )}
    </>
  )
}
