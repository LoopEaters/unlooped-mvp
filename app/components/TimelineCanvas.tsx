'use client'

import { Line, Circle, Text, Group, Rect } from 'react-konva'
import type { Database } from '@/types/supabase'
import { timestampToY, formatTimelineDate } from '@/app/lib/util'
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
  hoveredMemoId: string | null
  selectedMemoId: string | null
  onMemoClick: (memoId: string) => void
  onMemoHover: (memoId: string | null) => void
}

const ENTITY_COLUMN_WIDTH = 200
const LEFT_PADDING = 100
const TOP_PADDING = 60

// Entity type별 색상
const ENTITY_COLORS: Record<string, string> = {
  person: '#3B82F6', // 파랑
  project: '#10B981', // 초록
  unknown: '#6B7280', // 회색
}

export default function TimelineCanvas({
  entities,
  memos,
  timeRange,
  canvasWidth,
  canvasHeight,
  hoveredMemoId,
  selectedMemoId,
  onMemoClick,
  onMemoHover,
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

  // 시간 눈금 생성
  const timeMarks = []
  const totalRange = timeRange.end - timeRange.start
  const markCount = Math.min(10, Math.max(5, Math.floor(canvasHeight / 100)))
  for (let i = 0; i <= markCount; i++) {
    const timestamp = timeRange.start + (totalRange * i) / markCount
    const y = timestampToY(
      new Date(timestamp).toISOString(),
      timeRange,
      canvasHeight,
      TOP_PADDING
    )
    timeMarks.push({ timestamp, y })
  }

  return (
    <>
      {/* 시간 눈금 (왼쪽) */}
      {timeMarks.map((mark, i) => (
        <Group key={`time-mark-${i}`}>
          <Text
            x={10}
            y={mark.y - 8}
            text={formatTimelineDate(mark.timestamp, totalRange)}
            fontSize={12}
            fill="#9CA3AF"
            align="left"
          />
          <Line
            points={[LEFT_PADDING - 20, mark.y, LEFT_PADDING - 5, mark.y]}
            stroke="#4B5563"
            strokeWidth={1}
          />
        </Group>
      ))}

      {/* Entity 수직선 및 레이블 */}
      {entities.map((entity, index) => {
        const x = entityXPositions[entity.id]
        const color = ENTITY_COLORS[entity.type || 'unknown'] || ENTITY_COLORS.unknown

        return (
          <Group key={entity.id}>
            {/* Entity 이름 */}
            <Text
              x={x - 50}
              y={20}
              width={100}
              text={entity.name}
              fontSize={14}
              fill="#FFFFFF"
              align="center"
              fontStyle="bold"
            />
            {/* Type 레이블 */}
            <Text
              x={x - 50}
              y={40}
              width={100}
              text={entity.type || 'unknown'}
              fontSize={10}
              fill={color}
              align="center"
            />
            {/* 수직선 */}
            <Line
              points={[x, TOP_PADDING, x, canvasHeight - 40]}
              stroke="#374151"
              strokeWidth={2}
              dash={[5, 5]}
            />
          </Group>
        )
      })}

      {/* Memo 렌더링 */}
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
          const color = ENTITY_COLORS[entity?.type || 'unknown'] || ENTITY_COLORS.unknown

          return (
            <Circle
              key={memo.id}
              x={x}
              y={y}
              radius={isSelected ? 8 : isHovered ? 7 : 6}
              fill={color}
              opacity={isHovered || isSelected ? 1 : 0.8}
              shadowBlur={isSelected ? 10 : isHovered ? 5 : 0}
              shadowColor={color}
              onClick={() => onMemoClick(memo.id)}
              onMouseEnter={(e) => {
                onMemoHover(memo.id)
                const stage = e.target.getStage()
                if (stage) {
                  stage.container().style.cursor = 'pointer'
                }
                setTooltipData({ memo, x, y })
              }}
              onMouseLeave={(e) => {
                onMemoHover(null)
                const stage = e.target.getStage()
                if (stage) {
                  stage.container().style.cursor = 'default'
                }
                setTooltipData(null)
              }}
            />
          )
        }

        // 2개 이상 entity: 가로선 + 점
        const entityXs = memo.entityIds
          .map((id) => entityXPositions[id])
          .filter((x) => x !== undefined)
          .sort((a, b) => a - b)

        if (entityXs.length < 2) return null

        const firstEntity = entities.find((e) => e.id === memo.entityIds[0])
        const color = ENTITY_COLORS[firstEntity?.type || 'unknown'] || ENTITY_COLORS.unknown

        return (
          <Group key={memo.id}>
            {/* 가로선 */}
            <Line
              points={[entityXs[0], y, entityXs[entityXs.length - 1], y]}
              stroke={color}
              strokeWidth={isSelected ? 4 : isHovered ? 3 : 2}
              opacity={isHovered || isSelected ? 1 : 0.7}
              shadowBlur={isSelected ? 8 : isHovered ? 4 : 0}
              shadowColor={color}
              onClick={() => onMemoClick(memo.id)}
              onMouseEnter={(e) => {
                onMemoHover(memo.id)
                const stage = e.target.getStage()
                if (stage) {
                  stage.container().style.cursor = 'pointer'
                }
                const centerX = (entityXs[0] + entityXs[entityXs.length - 1]) / 2
                setTooltipData({ memo, x: centerX, y })
              }}
              onMouseLeave={(e) => {
                onMemoHover(null)
                const stage = e.target.getStage()
                if (stage) {
                  stage.container().style.cursor = 'default'
                }
                setTooltipData(null)
              }}
            />
            {/* 양 끝 점 */}
            {entityXs.map((x, i) => (
              <Circle
                key={`${memo.id}-${i}`}
                x={x}
                y={y}
                radius={isSelected ? 6 : isHovered ? 5 : 4}
                fill={color}
                opacity={isHovered || isSelected ? 1 : 0.8}
              />
            ))}
          </Group>
        )
      })}

      {/* Tooltip */}
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
