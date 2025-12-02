'use client'

import { useEffect, useRef, useMemo } from 'react'
import { useMemos, useEntities } from '@/app/lib/queries'
import { useAuth } from '@/app/providers/AuthProvider'
import MemoCardCompact from './MemoCardCompact'
import type { Database } from '@/types/supabase'

type Memo = Database['public']['Tables']['memo']['Row']

// 날짜별로 메모 그룹화
function groupMemosByDate(memos: Memo[]) {
  const groups: Record<string, Memo[]> = {}

  memos.forEach((memo) => {
    const date = new Date(memo.created_at || '')
    // YYYY-MM-DD 형식
    const dateKey = date.toISOString().split('T')[0]

    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(memo)
  })

  return groups
}

// 날짜 포맷팅 (2025-12-01 → 2025년 12월 1일)
function formatDateHeader(dateString: string) {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${year}년 ${month}월 ${day}일`
}

export default function RightSidebar() {
  const sidebarRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const { data: memos, isLoading, isError, error } = useMemos(user?.id)
  const { data: entities = [] } = useEntities(user?.id)

  // 날짜별로 그룹화
  const groupedMemos = useMemo(() => {
    if (!memos) return {}
    return groupMemosByDate(memos)
  }, [memos])

  // 날짜 키 정렬 (오래된 것부터)
  const sortedDateKeys = useMemo(() => {
    return Object.keys(groupedMemos).sort()
  }, [groupedMemos])

  // 메모가 추가될 때마다 가장 아래로 스크롤
  useEffect(() => {
    if (sidebarRef.current && memos) {
      sidebarRef.current.scrollTop = sidebarRef.current.scrollHeight
    }
  }, [memos])

  return (
    <div
      ref={sidebarRef}
      className="w-80 border-l border-border-main overflow-y-auto p-4 bg-bg-primary"
    >
      <div className="space-y-4">
        {/* 헤더 */}
        <div className="mb-3">
          <h2 className="text-base font-semibold text-white">히스토리</h2>
          <p className="text-[10px] text-white mt-0.5">
            최신 메모가 아래에 표시됩니다 ↓
          </p>
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="space-y-2">
            <div className="bg-bg-card h-12 rounded-md animate-pulse"></div>
            <div className="bg-bg-card h-12 rounded-md animate-pulse"></div>
            <div className="bg-bg-card h-12 rounded-md animate-pulse"></div>
          </div>
        )}

        {/* 에러 상태 */}
        {isError && (
          <div className="text-center text-red-400 text-xs mt-10 p-4 bg-red-500/10 rounded-md">
            <p className="font-semibold mb-1">데이터를 불러올 수 없습니다</p>
            <p className="text-[10px] text-gray-400">{error?.message || '알 수 없는 오류'}</p>
          </div>
        )}

        {/* 날짜별 메모 그룹 */}
        {!isLoading && !isError && sortedDateKeys.length > 0 && (
          <div className="space-y-4">
            {sortedDateKeys.map((dateKey) => (
              <div key={dateKey} className="space-y-2">
                {/* 날짜 헤더 */}
                <div className="text-xs font-semibold text-white sticky top-0 bg-bg-primary py-1">
                  {formatDateHeader(dateKey)}
                </div>

                {/* 해당 날짜의 메모들 */}
                <div className="space-y-1.5">
                  {groupedMemos[dateKey].map((memo) => (
                    <MemoCardCompact key={memo.id} memo={memo} entities={entities} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 빈 상태 */}
        {!isLoading && !isError && (!memos || memos.length === 0) && (
          <div className="text-center text-gray-400 text-xs mt-10">
            아직 메모가 없습니다
          </div>
        )}
      </div>
    </div>
  )
}
