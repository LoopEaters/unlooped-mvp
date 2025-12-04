'use client'

import { Line, Circle, Text, Group, Rect, Path } from 'react-konva'
import type { Database } from '@/types/supabase'
import { timestampToY, formatTimelineDate } from '@/app/lib/util'
import { getEntityTypeHexColor, defaultTheme } from '@/app/lib/theme'
import { useState } from 'react'
import MemoTooltip from './MemoTooltip'
import EntityTooltip from './EntityTooltip'

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

  const [entityTooltipData, setEntityTooltipData] = useState<{
    entity: Entity
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
            85, // date scale 오른쪽에서 시작 (80px + 여백)
            mark.y,
            canvasWidth,
            mark.y,
          ]}
          stroke={
            mark.isMajor
              ? defaultTheme.timeline.timeScale.majorLine
              : defaultTheme.timeline.timeScale.line
          }
          strokeWidth={(mark.isMajor ? 1.5 : 0.5) / scale} // scale에 따라 조정
          dash={mark.isMajor ? undefined : [4 / scale, 4 / scale]}
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
            strokeWidth={(isHovered ? 3 : 2) / scale} // scale에 따라 조정
            opacity={isHovered ? 0.9 : 0.5}
            shadowBlur={(isHovered ? 12 : 0) / scale} // Hover 시 빛나는 효과
            shadowColor={color}
            hitStrokeWidth={20 / scale} // Hover 감지 영역 넓게 (scale 고정)
            onClick={() => onEntityClick(entity.id)} // 클릭 시 entity drawer 열기
            onMouseEnter={(e) => {
              onEntityHover(entity.id)
              const stage = e.target.getStage()
              if (stage) stage.container().style.cursor = 'pointer'
              // Entity tooltip 표시
              setEntityTooltipData({ entity, x, y: (range.minY + range.maxY) / 2 })
            }}
            onMouseLeave={(e) => {
              onEntityHover(null)
              const stage = e.target.getStage()
              if (stage) stage.container().style.cursor = 'default'
              // Entity tooltip 숨김
              setEntityTooltipData(null)
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

          const color = defaultTheme.timeline.memo.color

          return (
            <Circle
              key={memo.id}
              x={x}
              y={y}
              radius={(isSelected ? 4.9 : isHovered ? 4.2 : 3.5) / scale} // scale에 따라 반지름 조정 (70%)
              fill={color}
              opacity={
                isSelected
                  ? defaultTheme.timeline.memo.selectedOpacity
                  : isHovered
                    ? defaultTheme.timeline.memo.hoverOpacity
                    : 0.8
              }
              shadowBlur={(isSelected ? 12 : isHovered ? 8 : 0) / scale}
              shadowColor={color}
              hitStrokeWidth={16 / scale} // Hover 영역 넓게 (scale 고정)
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

        const color = defaultTheme.timeline.memo.color

        // 중간에 건너뛰는 entity 찾기
        const firstIndex = entities.findIndex((e) => e.id === entityXs[0].id)
        const lastIndex = entities.findIndex((e) => e.id === entityXs[entityXs.length - 1].id)

        // 건너뛰는 entity들의 X 좌표와 arc 방향
        const skippedEntities: Array<{ x: number; goUp: boolean }> = []
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
                // memo가 선분의 중간보다 위에 있으면 아래로, 아래에 있으면 위로 우회
                const rangeMidY = (range.minY + range.maxY) / 2
                const goUp = y > rangeMidY // memo가 중간보다 아래에 있으면 위로
                skippedEntities.push({ x: entityXPositions[entityId], goUp })
              }
              // Y 범위 밖이면 교차하지 않으므로 건너뜀
            }
          }
        }

        // 경로 생성
        let pathData: string
        let maxArcOffset = 0 // 최대 arc 오프셋 (tooltip 위치 계산용)
        if (skippedEntities.length > 0) {
          // 반원으로 우회하는 경로
          const startX = entityXs[0].x!
          const endX = entityXs[entityXs.length - 1].x!
          // scale에 따라 반지름 조정 (화면상 크기 일정하게 유지, 70%)
          const arcRadius = 8.4 / scale

          let path = `M ${startX} ${y}` // 시작점

          // 각 건너뛰는 entity마다 반원 그리기
          skippedEntities.forEach(({ x: skipX, goUp }) => {
            // 반원 전까지 직선
            const beforeArcX = skipX - arcRadius
            path += ` L ${beforeArcX} ${y}`

            // 반원 (위 또는 아래로 우회)
            // goUp이 true면 위로 (sweep=0), false면 아래로 (sweep=1)
            const afterArcX = skipX + arcRadius
            const sweep = goUp ? 0 : 1
            path += ` A ${arcRadius} ${arcRadius} 0 0 ${sweep} ${afterArcX} ${y}`

            // 최대 오프셋 계산
            maxArcOffset = Math.max(maxArcOffset, arcRadius)
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
              strokeWidth={(isSelected ? 3 : isHovered ? 2.5 : 2) / scale} // scale에 따라 조정
              opacity={
                isSelected
                  ? defaultTheme.timeline.memo.selectedOpacity
                  : isHovered
                    ? defaultTheme.timeline.memo.hoverOpacity
                    : 0.7
              }
              shadowBlur={(isSelected ? 10 : isHovered ? 6 : 0) / scale}
              shadowColor={color}
              hitStrokeWidth={16 / scale} // Hover 영역 넓게 (scale 고정)
              onClick={() => onMemoClick(memo.id)}
              onMouseEnter={(e) => {
                onMemoHover(memo.id)
                const stage = e.target.getStage()
                if (stage) stage.container().style.cursor = 'pointer'
                const centerX = (entityXs[0].x! + entityXs[entityXs.length - 1].x!) / 2
                // 반원이 있으면 위쪽 여백 추가
                const tooltipY = skippedEntities.length > 0 ? y - maxArcOffset - 23 : y
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
                radius={(isSelected ? 3.5 : isHovered ? 3.15 : 2.8) / scale} // scale에 따라 조정 (70%)
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

        const typeText = entity.type || 'unknown'
        const memoText = `${range.memoCount} ${range.memoCount === 1 ? 'memo' : 'memos'}`

        // Entity name의 예상 줄 수 계산 (Canvas measureText 사용)
        const fontSize = 11
        const textWidth = 80
        const lineHeight = fontSize * 1.5

        // Canvas measureText로 정확한 너비 계산
        let actualWidth = textWidth // fallback
        if (typeof document !== 'undefined') {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.font = '600 11px sans-serif' // fontStyle과 fontSize 동일하게
            actualWidth = ctx.measureText(entity.name).width
          }
        }
        const estimatedLines = Math.ceil(actualWidth / textWidth)
        const actualLines = Math.min(Math.max(estimatedLines, 1), 3) // 최소 1줄, 최대 3줄

        // 배경 높이 계산 (padding 포함)
        const namePadding = 8
        const nameBoxHeight = lineHeight * actualLines + namePadding * 2

        // 전체 높이 계산
        const badgeHeight = 16
        const spacing = 4.5 // entity name과 badge 사이 간격 (1.5 * 3)
        const totalHeight = nameBoxHeight + spacing + badgeHeight + 12 // 아래 여유 공간

        return (
          <Group
            key={`entity-label-${entity.id}`}
            x={x}
            y={range.minY}
            scaleX={1 / scale}
            scaleY={1 / scale}
          >
            {/* 전체 클릭 영역 */}
            <Rect
              x={-48}
              y={-totalHeight - 4}
              width={96}
              height={totalHeight + 4}
              fill="transparent"
              onClick={() => onEntityClick(entity.id)}
              onMouseEnter={(e) => {
                onEntityHover(entity.id)
                const stage = e.target.getStage()
                if (stage) stage.container().style.cursor = 'pointer'
                // Entity tooltip 표시
                setEntityTooltipData({ entity, x, y: range.minY - totalHeight / 2 })
              }}
              onMouseLeave={(e) => {
                onEntityHover(null)
                const stage = e.target.getStage()
                if (stage) stage.container().style.cursor = 'default'
                // Entity tooltip 숨김
                setEntityTooltipData(null)
              }}
            />

            {/* Entity 이름 배경 */}
            <Rect
              x={-42}
              y={-totalHeight}
              width={84}
              height={nameBoxHeight}
              fill={isHovered ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)'}
              cornerRadius={6}
              shadowBlur={isHovered ? 8 : 4}
              shadowColor="rgba(0, 0, 0, 0.3)"
              shadowOffsetY={2}
              listening={false}
            />

            {/* Entity 이름 */}
            <Text
              x={-40}
              y={-totalHeight + namePadding}
              width={80}
              text={entity.name}
              fontSize={11}
              fill="#FFFFFF"
              align="center"
              fontStyle="600"
              wrap="word"
              ellipsis={false}
              lineHeight={1.5}
              listening={false}
            />

            {/* Type Badge 배경 */}
            <Rect
              x={-40}
              y={-badgeHeight - 4}
              width={80}
              height={badgeHeight}
              fill={color}
              opacity={isHovered ? 0.3 : 0.2}
              cornerRadius={8}
              listening={false}
            />

            {/* Type 텍스트 */}
            <Text
              x={-40}
              y={-badgeHeight - 4 + (badgeHeight - 8) / 2}
              width={40}
              text={typeText}
              fontSize={8}
              fill={color}
              align="center"
              fontStyle="600"
              listening={false}
            />

            {/* Memo count */}
            <Text
              x={0}
              y={-badgeHeight - 4 + (badgeHeight - 8) / 2}
              width={40}
              text={memoText}
              fontSize={8}
              fill="#FFFFFF"
              align="center"
              opacity={0.7}
              listening={false}
            />
          </Group>
        )
      })}

      {/* ===== Tooltips (최최상위) ===== */}
      {tooltipData && (
        <MemoTooltip
          memo={tooltipData.memo}
          x={tooltipData.x}
          y={tooltipData.y}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          entities={entities}
          scale={scale}
        />
      )}

      {entityTooltipData && (
        <EntityTooltip
          entity={entityTooltipData.entity}
          x={entityTooltipData.x}
          y={entityTooltipData.y}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          scale={scale}
        />
      )}
    </>
  )
}
