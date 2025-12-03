'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Stage, Layer } from 'react-konva'
import type { Database } from '@/types/supabase'
import { getTimeRange, optimizeEntityLayout, calculateCrossings, timestampToY, formatTimelineDate } from '@/app/lib/util'
import { defaultTheme } from '@/app/lib/theme'
import TimelineCanvas from './TimelineCanvas'
import MemoDetailSidebar from './MemoDetailSidebar'
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
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [selectedMemoId, setSelectedMemoId] = useState<string | null>(null)
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)
  const [hoveredMemoId, setHoveredMemoId] = useState<string | null>(null)
  const [hoveredEntityId, setHoveredEntityId] = useState<string | null>(null)

  // 드래그 스크롤 상태
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  // Entity 배치 최적화
  const optimizedEntities = useMemo(() => {
    const optimized = optimizeEntityLayout(entities, memos)

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
    const markCount = Math.min(12, Math.max(6, Math.floor(canvasHeight / 80)))

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
  }, [timeRange, canvasHeight])

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

  // Entity 중간을 화면 중앙에 배치 (초기 스크롤 위치 설정)
  useEffect(() => {
    if (!containerRef.current || optimizedEntities.length === 0) return

    // Entity들의 중간 지점 계산
    const entityMiddleX = 120 + (optimizedEntities.length * 85) / 2 // LEFT_PADDING + (총 너비 / 2)

    // 화면 중앙
    const viewportCenterX = dimensions.width / 2

    // 스크롤 위치 = Entity 중간 - 화면 중앙
    const scrollX = entityMiddleX - viewportCenterX

    // 스크롤 (음수면 0으로)
    containerRef.current.scrollLeft = Math.max(0, scrollX)
  }, [optimizedEntities.length, dimensions.width])

  // 드래그 스크롤 핸들러
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - containerRef.current.offsetLeft)
    setScrollLeft(containerRef.current.scrollLeft)
    containerRef.current.style.cursor = 'grabbing'
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab'
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab'
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return
    e.preventDefault()
    const x = e.pageX - containerRef.current.offsetLeft
    const walk = (x - startX) * 1.5 // 드래그 속도 (1.5배)
    containerRef.current.scrollLeft = scrollLeft - walk
  }

  // 선택된 memo와 entity 찾기
  const selectedMemo = memos.find((m) => m.id === selectedMemoId) || null
  const selectedEntity = optimizedEntities.find((e) => e.id === selectedEntityId) || null

  // Memo 클릭 핸들러 (Entity drawer에서 사용)
  const handleMemoClickFromEntity = (memoId: string) => {
    setSelectedEntityId(null) // Entity drawer 닫기
    setSelectedMemoId(memoId) // Memo drawer 열기
  }

  return (
    <div className="flex h-full">
      {/* Canvas Container - relative positioning for fixed date scale */}
      <div className="flex-1 relative">
        {/* Fixed Date Scale (HTML) */}
        <div
          className="absolute left-0 top-0 z-10 pointer-events-none"
          style={{
            width: `${LEFT_PADDING - 10}px`,
            height: '100%',
            backgroundColor: defaultTheme.timeline.background,
          }}
        >
          {timeMarks.map((mark, i) => (
            <div
              key={`time-${i}`}
              className="absolute left-2.5"
              style={{
                top: `${mark.y}px`,
                transform: 'translateY(-50%)',
              }}
            >
              <span
                className={mark.isMajor ? 'font-bold' : 'font-normal'}
                style={{
                  fontSize: mark.isMajor ? '13px' : '11px',
                  color: defaultTheme.timeline.timeScale.text,
                }}
              >
                {formatTimelineDate(mark.timestamp, mark.totalRange)}
              </span>
            </div>
          ))}
        </div>

        {/* Konva Canvas - 스크롤 가능 + 드래그 스크롤 */}
        <div
          ref={containerRef}
          className="w-full h-full bg-bg-secondary overflow-auto"
          style={{ cursor: 'grab' }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <Stage width={canvasWidth} height={canvasHeight}>
            <Layer>
              <TimelineCanvas
                entities={optimizedEntities}
                memos={memos}
                timeRange={timeRange}
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
                hoveredMemoId={hoveredMemoId}
                selectedMemoId={selectedMemoId}
                hoveredEntityId={hoveredEntityId}
                onMemoClick={setSelectedMemoId}
                onMemoHover={setHoveredMemoId}
                onEntityHover={setHoveredEntityId}
                onEntityClick={setSelectedEntityId}
              />
            </Layer>
          </Stage>
        </div>
      </div>

      {/* Memo Detail Drawer */}
      <MemoDetailSidebar
        isOpen={!!selectedMemoId}
        memo={selectedMemo}
        entities={optimizedEntities.filter((e) => selectedMemo?.entityIds.includes(e.id))}
        onClose={() => setSelectedMemoId(null)}
      />

      {/* Entity Detail Drawer */}
      <EntityDetailDrawer
        isOpen={!!selectedEntityId}
        entity={selectedEntity}
        memos={memos}
        onClose={() => setSelectedEntityId(null)}
        onMemoClick={handleMemoClickFromEntity}
      />
    </div>
  )
}
