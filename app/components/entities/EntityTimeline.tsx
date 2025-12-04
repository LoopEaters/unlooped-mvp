'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Stage, Layer } from 'react-konva'
import type { Database } from '@/types/supabase'
import { getTimeRange, optimizeEntityLayout, optimizeEntityLayoutCostBased, calculateCrossings, timestampToY, formatTimelineDate } from '@/app/lib/util'
import { defaultTheme } from '@/app/lib/theme'
import { useAuth } from '@/app/providers/AuthProvider'
import TimelineCanvas from './TimelineCanvas'
import MemoDetailDrawer from './MemoDetailDrawer'
import EntityDetailDrawer from './EntityDetailDrawer'

type Entity = Database['public']['Tables']['entity']['Row']
type Memo = Database['public']['Tables']['memo']['Row'] & {
  entityIds: string[]
}

interface EntityTimelineProps {
  entities: Entity[]
  memos: Memo[]
}

export default function EntityTimeline({ entities, memos }: EntityTimelineProps) {
  const { userProfile } = useAuth()
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<any>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [selectedMemoId, setSelectedMemoId] = useState<string | null>(null)
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)
  const [hoveredMemoId, setHoveredMemoId] = useState<string | null>(null)
  const [hoveredEntityId, setHoveredEntityId] = useState<string | null>(null)

  // 스케일 및 위치 상태
  const [scale, setScale] = useState(1)
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 })

  // Entity 배치 최적화
  const optimizedEntities = useMemo(() => {
    // 비용 기반 최적화 (거리제곱 + 교차 패널티)로 시도
    // 빠른 로컬서치(인접 스왑, 시간예산 250ms)
    const optimized = optimizeEntityLayoutCostBased(entities, memos, {
      lambda: 1.0,
      maxPasses: 4,
      timeBudgetMs: 250,
    })

    // 디버깅: crossing 수 비교
    if (process.env.NODE_ENV === 'development') {
      const originalCrossings = calculateCrossings(entities, memos)
      const optimizedCrossings = calculateCrossings(optimized, memos)
      console.log('🎯 [Entity Layout]', {
        original: originalCrossings,
        optimized: optimizedCrossings,
        improvement: originalCrossings - optimizedCrossings,
      })
    }

    return optimized
  }, [entities, memos])

  // 시간 범위 계산
  const timeRange = getTimeRange(memos.map((m) => m.created_at || ''))

  // 캔버스 크기 계산 (entity 개수에 따라 동적)
  const LEFT_PADDING = 120
  const TOP_PADDING = 80
  const canvasWidth = Math.max(
    dimensions.width,
    LEFT_PADDING + optimizedEntities.length * 85 + 100 // LEFT_PADDING + entity columns (85px) + right padding
  )
  const canvasHeight = Math.max(dimensions.height, 800) // 최소 높이

  // 시간 눈금 계산 (Date scale용)
  const timeMarks = useMemo(() => {
    const marks = []
    const totalRange = timeRange.end - timeRange.start
    const baseInterval = 80 / scale
    const markCount = Math.min(24, Math.max(6, Math.floor(canvasHeight / baseInterval)))

    for (let i = 0; i <= markCount; i++) {
      const timestamp = timeRange.start + (totalRange * i) / markCount
      const y = timestampToY(
        new Date(timestamp).toISOString(),
        timeRange,
        canvasHeight,
        TOP_PADDING
      )
      const isMajor = i % 3 === 0
      marks.push({ timestamp, y, isMajor, totalRange })
    }

    return marks
  }, [timeRange, canvasHeight, scale])

  // 컨테이너 크기 감지
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  // Entity 중간을 화면 중앙에 배치 (초기 위치 설정)
  useEffect(() => {
    if (optimizedEntities.length === 0) return

    // Entity들의 중간 지점 계산
    const entityMiddleX = LEFT_PADDING + (optimizedEntities.length * 85) / 2

    // 화면 중앙
    const viewportCenterX = dimensions.width / 2

    // Stage 위치 = 화면 중앙 - Entity 중간
    const offsetX = viewportCenterX - entityMiddleX

    setStagePosition({ x: offsetX, y: 0 })
  }, [optimizedEntities.length, dimensions.width])

  // 위치 제한 (bounds)
  const clampPosition = (pos: { x: number; y: number }, currentScale: number) => {
    // 화면 크기
    const viewWidth = dimensions.width
    const viewHeight = dimensions.height

    // Canvas 실제 크기 (scale 적용)
    const scaledCanvasWidth = canvasWidth * currentScale
    const scaledCanvasHeight = canvasHeight * currentScale

    // X 범위: 캔버스가 화면보다 크면 일부만 보이도록, 작으면 중앙 정렬
    let minX = viewWidth - scaledCanvasWidth
    let maxX = 0

    // 캔버스가 화면보다 작으면 중앙 정렬을 위한 여백 허용
    if (scaledCanvasWidth < viewWidth) {
      minX = (viewWidth - scaledCanvasWidth) / 2
      maxX = (viewWidth - scaledCanvasWidth) / 2
    }

    // Y 범위: 상하 여백 허용 (약 200px)
    const verticalPadding = 200
    const minY = -(scaledCanvasHeight - viewHeight) - verticalPadding
    const maxY = verticalPadding

    return {
      x: Math.max(minX, Math.min(maxX, pos.x)),
      y: Math.max(minY, Math.min(maxY, pos.y)),
    }
  }

  // 마우스 휠 줌
  const handleWheel = (e: any) => {
    e.evt.preventDefault()

    const stage = e.target.getStage()
    const oldScale = stage.scaleX()
    const pointer = stage.getPointerPosition()

    // 줌 방향
    const scaleBy = 1.05
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy

    // 스케일 제한 (0.5x ~ 2.0x)
    const clampedScale = Math.max(0.5, Math.min(2.0, newScale))

    // 마우스 포인터 기준으로 줌
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    }

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    }

    // 위치 제한 적용
    const clampedPos = clampPosition(newPos, clampedScale)

    setScale(clampedScale)
    setStagePosition(clampedPos)
  }

  // 선택된 memo와 entity 찾기
  const selectedMemo = memos.find((m) => m.id === selectedMemoId) || null
  const selectedEntity = optimizedEntities.find((e) => e.id === selectedEntityId) || null

  // Memo 클릭 핸들러 (Entity drawer에서 사용 또는 Timeline에서 직접)
  const handleMemoClick = (memoId: string) => {
    setSelectedEntityId(null) // Entity drawer 닫기
    setSelectedMemoId(memoId) // Memo drawer 열기
  }

  // Entity 클릭 핸들러
  const handleEntityClick = (entityId: string) => {
    setSelectedMemoId(null) // Memo drawer 닫기
    setSelectedEntityId(entityId) // Entity drawer 열기
  }

  return (
    <div className="flex h-full">
      {/* Canvas Container */}
      <div className="flex-1 relative">
        {/* Fixed Date Scale (HTML Overlay) */}
        <div
          className="absolute left-0 top-0 z-20 pointer-events-none"
          style={{
            width: '80px',
            height: '100%',
          }}
        >
          {timeMarks
            .filter(mark => mark.isMajor)
            .map((mark, i) => (
              <div
                key={`time-${i}`}
                className="absolute left-2"
                style={{
                  top: `${mark.y * scale + stagePosition.y}px`,
                  transform: 'translateY(-50%)',
                }}
              >
                <span
                  className="font-medium text-xs"
                  style={{
                    color: defaultTheme.timeline.timeScale.text,
                  }}
                >
                  {formatTimelineDate(mark.timestamp, mark.totalRange)}
                </span>
              </div>
            ))}
        </div>

        {/* Konva Canvas - 드래그 가능 + 휠 줌 */}
        <div
          ref={containerRef}
          className="w-full h-full bg-bg-secondary overflow-hidden"
        >
          <Stage
            ref={stageRef}
            width={dimensions.width}
            height={dimensions.height}
            scaleX={scale}
            scaleY={scale}
            x={stagePosition.x}
            y={stagePosition.y}
            draggable
            dragBoundFunc={(pos) => {
              // 드래그 중 위치 제한 (경계 밖으로 못 나가게)
              const viewWidth = dimensions.width
              const viewHeight = dimensions.height
              const scaledCanvasWidth = canvasWidth * scale
              const scaledCanvasHeight = canvasHeight * scale

              // X 범위: 캔버스가 화면보다 크면 일부만 보이도록, 작으면 중앙 정렬
              let minX = viewWidth - scaledCanvasWidth
              let maxX = 0

              if (scaledCanvasWidth < viewWidth) {
                minX = (viewWidth - scaledCanvasWidth) / 2
                maxX = (viewWidth - scaledCanvasWidth) / 2
              }

              // Y 범위: 상하 여백 허용 (약 200px)
              const verticalPadding = 200
              const minY = -(scaledCanvasHeight - viewHeight) - verticalPadding
              const maxY = verticalPadding

              return {
                x: Math.max(minX, Math.min(maxX, pos.x)),
                y: Math.max(minY, Math.min(maxY, pos.y)),
              }
            }}
            onWheel={handleWheel}
            onDragMove={(e) => {
              // 드래그 중 실시간 위치 업데이트
              setStagePosition({
                x: e.target.x(),
                y: e.target.y(),
              })
            }}
            onDragEnd={(e) => {
              // dragBoundFunc가 이미 경계를 적용했으므로 위치만 업데이트
              setStagePosition({
                x: e.target.x(),
                y: e.target.y(),
              })
            }}
          >
            <Layer>
              <TimelineCanvas
                entities={optimizedEntities}
                memos={memos}
                timeRange={timeRange}
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
                scale={scale}
                hoveredMemoId={hoveredMemoId}
                selectedMemoId={selectedMemoId}
                hoveredEntityId={hoveredEntityId}
                onMemoClick={handleMemoClick}
                onMemoHover={setHoveredMemoId}
                onEntityHover={setHoveredEntityId}
                onEntityClick={handleEntityClick}
              />
            </Layer>
          </Stage>
        </div>
      </div>

      {/* Memo Detail Drawer */}
      <MemoDetailDrawer
        isOpen={!!selectedMemoId}
        memo={selectedMemo}
        entities={optimizedEntities.filter((e) => selectedMemo?.entityIds.includes(e.id))}
        onClose={() => setSelectedMemoId(null)}
        userId={userProfile?.id || ''}
        allEntities={optimizedEntities}
      />

      {/* Entity Detail Drawer */}
      <EntityDetailDrawer
        isOpen={!!selectedEntityId}
        entity={selectedEntity}
        memos={memos}
        entities={optimizedEntities}
        onClose={() => setSelectedEntityId(null)}
        onMemoClick={handleMemoClick}
      />
    </div>
  )
}
