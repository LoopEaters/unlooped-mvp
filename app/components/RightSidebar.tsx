'use client'

import { useEffect, useRef } from 'react'
import { useMemos } from '@/app/lib/queries'
import { useAuth } from '@/app/providers/AuthProvider'
import MemoCard from './MemoCard'

export default function RightSidebar() {
  const sidebarRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const { data: memos, isLoading } = useMemos(user?.id)

  // 메모가 추가될 때마다 가장 아래로 스크롤
  useEffect(() => {
    if (sidebarRef.current && memos) {
      sidebarRef.current.scrollTop = sidebarRef.current.scrollHeight
    }
  }, [memos])

  return (
    <div
      ref={sidebarRef}
      className="w-80 border-l border-border-main overflow-y-auto p-6 bg-bg-primary"
    >
      <div className="space-y-4">
        {/* 헤더 */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-200">히스토리</h2>
          <p className="text-xs text-text-muted mt-1">
            최신 메모가 아래에 표시됩니다 ↓
          </p>
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
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

        {/* 빈 상태 */}
        {!isLoading && (!memos || memos.length === 0) && (
          <div className="text-center text-gray-400 text-sm mt-10">
            아직 메모가 없습니다
          </div>
        )}
      </div>
    </div>
  )
}
