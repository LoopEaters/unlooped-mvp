'use client'

import { useState, useRef, useEffect } from 'react'
import { Stage, Layer } from 'react-konva'
import type { Database } from '@/types/supabase'
import { getTimeRange } from '@/app/lib/util'
import TimelineCanvas from './TimelineCanvas'
import MemoDetailSidebar from './MemoDetailSidebar'

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
  const [hoveredMemoId, setHoveredMemoId] = useState<string | null>(null)

  // 시간 범위 계산
  const timeRange = getTimeRange(memos.map((m) => m.created_at || ''))

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

  // 선택된 memo 찾기
  const selectedMemo = memos.find((m) => m.id === selectedMemoId)

  return (
    <div className="flex h-full">
      {/* Konva Canvas */}
      <div ref={containerRef} className="flex-1 bg-bg-secondary">
        <Stage width={dimensions.width} height={dimensions.height}>
          <Layer>
            <TimelineCanvas
              entities={entities}
              memos={memos}
              timeRange={timeRange}
              canvasWidth={dimensions.width}
              canvasHeight={dimensions.height}
              hoveredMemoId={hoveredMemoId}
              selectedMemoId={selectedMemoId}
              onMemoClick={setSelectedMemoId}
              onMemoHover={setHoveredMemoId}
            />
          </Layer>
        </Stage>
      </div>

      {/* Sidebar */}
      {selectedMemo && (
        <MemoDetailSidebar
          memo={selectedMemo}
          entities={entities.filter((e) => selectedMemo.entityIds.includes(e.id))}
          onClose={() => setSelectedMemoId(null)}
        />
      )}
    </div>
  )
}
