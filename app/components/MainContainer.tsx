'use client'

import { useEffect, useRef } from 'react'
import { useMemosByEntities } from '@/app/lib/queries'
import { useEntityFilter } from '@/app/providers/EntityFilterProvider'
import MemoCard from './MemoCard'

export default function MainContainer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { filteredEntityIds } = useEntityFilter()
  const { data: memos, isLoading } = useMemosByEntities(filteredEntityIds)

  // 메모가 추가될 때마다 가장 아래로 스크롤
  useEffect(() => {
    if (containerRef.current && memos) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [memos])

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-6 bg-bg-primary"
    >
      <div className="space-y-4">
        {/* 헤더 */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-200">Entity 추천</h2>
          <p className="text-xs text-text-muted mt-1">
            {filteredEntityIds.length > 0
              ? '입력한 엔티티와 관련된 메모'
              : '아래 입력창에서 @로 엔티티를 언급하면 관련 메모가 표시됩니다'}
          </p>
        </div>

        {/* 로딩 상태 */}
        {isLoading && filteredEntityIds.length > 0 && (
          <div className="space-y-3">
            <div className="bg-bg-card h-20 rounded-lg animate-pulse"></div>
            <div className="bg-bg-card h-20 rounded-lg animate-pulse"></div>
            <div className="bg-bg-card h-20 rounded-lg animate-pulse"></div>
          </div>
        )}

        {/* 메모 목록 */}
        {!isLoading && memos && memos.length > 0 && (
          <div className="space-y-3">
            {memos.map((memo) => (
              <MemoCard key={memo.id} memo={memo} />
            ))}
          </div>
        )}

        {/* 빈 상태 - entity를 언급했지만 관련 메모가 없을 때 */}
        {!isLoading && filteredEntityIds.length > 0 && (!memos || memos.length === 0) && (
          <div className="text-center text-gray-400 text-sm mt-10">
            이 엔티티와 관련된 메모가 없습니다
          </div>
        )}

        {/* 기본 상태 - entity를 아직 언급하지 않았을 때 */}
        {filteredEntityIds.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-lg">@로 엔티티를 언급해보세요</p>
            <p className="text-sm mt-2">관련된 과거 메모들이 여기에 표시됩니다</p>
          </div>
        )}
      </div>
    </div>
  )
}
