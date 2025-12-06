'use client'

import { useEffect, useRef, useMemo, useState } from 'react'
import { useMemos, useEntities } from '@/app/lib/queries'
import { useAuth } from '@/app/providers/AuthProvider'
import { useEntityFilter } from '@/app/providers/EntityFilterProvider'
import { useTheme } from '@/app/providers/ThemeProvider'
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
  const { highlightedMemoId } = useEntityFilter()
  const { theme } = useTheme()
  const { data: memos, isLoading, isError, error } = useMemos(user?.id)
  const { data: entities = [] } = useEntities(user?.id)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)

  // 날짜별로 그룹화
  const groupedMemos = useMemo(() => {
    if (!memos) return {}
    return groupMemosByDate(memos)
  }, [memos])

  // 날짜 키 정렬 (오래된 것부터)
  const sortedDateKeys = useMemo(() => {
    return Object.keys(groupedMemos).sort()
  }, [groupedMemos])

  // 스크롤 위치 확인
  const handleScroll = () => {
    if (!sidebarRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = sidebarRef.current
    // 맨 아래에서 100px 이상 올라가면 버튼 표시
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
    setShowScrollToBottom(!isNearBottom)
  }

  // 맨 아래로 스크롤
  const scrollToBottom = () => {
    if (sidebarRef.current) {
      sidebarRef.current.scrollTo({
        top: sidebarRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }

  // 스크롤 이벤트 리스너 등록
  useEffect(() => {
    const sidebar = sidebarRef.current
    if (sidebar) {
      sidebar.addEventListener('scroll', handleScroll)
      return () => sidebar.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // 메모가 추가될 때마다 가장 아래로 스크롤
  useEffect(() => {
    if (sidebarRef.current && memos) {
      sidebarRef.current.scrollTop = sidebarRef.current.scrollHeight
    }
  }, [memos])

  // highlightedMemoId가 변경되면 해당 memo로 스크롤
  useEffect(() => {
    if (highlightedMemoId && sidebarRef.current) {
      // DOM 렌더링 대기
      setTimeout(() => {
        const memoElement = document.getElementById(`memo-compact-${highlightedMemoId}`)
        if (memoElement && sidebarRef.current) {
          // 부모 스크롤 컨테이너 내에서 중앙에 위치하도록 스크롤
          memoElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        }
      }, 100)
    }
  }, [highlightedMemoId])

  return (
    <div className="relative w-80 h-full">
      <div
        ref={sidebarRef}
        className="w-full h-full border-l overflow-y-auto pt-0 px-4 pb-4"
        style={{
          borderColor: theme.ui.border,
          backgroundColor: theme.ui.primaryBg,
        }}
      >
        <div className="space-y-4">
        {/* 헤더 */}
        <div className="mt-4 mb-3">
          <h2 className="text-base font-semibold" style={{ color: theme.ui.textPrimary }}>히스토리</h2>
          <p className="text-[10px] mt-0.5" style={{ color: theme.ui.textSecondary }}>
            최신 메모가 아래에 표시됩니다 ↓
          </p>
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="space-y-2">
            <div className="h-12 rounded-md animate-pulse" style={{ backgroundColor: theme.ui.loading.bg }}></div>
            <div className="h-12 rounded-md animate-pulse" style={{ backgroundColor: theme.ui.loading.bg }}></div>
            <div className="h-12 rounded-md animate-pulse" style={{ backgroundColor: theme.ui.loading.bg }}></div>
          </div>
        )}

        {/* 에러 상태 */}
        {isError && (
          <div
            className="text-center text-xs mt-10 p-4 rounded-md"
            style={{
              color: theme.ui.error.text,
              backgroundColor: theme.ui.error.bg,
            }}
          >
            <p className="font-semibold mb-1">데이터를 불러올 수 없습니다</p>
            <p className="text-[10px]" style={{ color: theme.ui.textMuted }}>{error?.message || '알 수 없는 오류'}</p>
          </div>
        )}

        {/* 날짜별 메모 그룹 */}
        {!isLoading && !isError && sortedDateKeys.length > 0 && (
          <div className="space-y-6">
            {sortedDateKeys.map((dateKey) => (
              <div key={dateKey}>
                {/* 날짜 헤더 */}
                <div
                  className="text-sm font-semibold sticky top-0 z-10 backdrop-blur-md py-2.5 -mx-4 px-4 border-b mb-2"
                  style={{
                    color: theme.ui.textPrimary,
                    backgroundColor: theme.ui.primaryBg,
                    borderColor: `${theme.ui.border}66`,
                  }}
                >
                  {formatDateHeader(dateKey)}
                </div>

                {/* 해당 날짜의 메모들 */}
                <div className="space-y-1.5">
                  {groupedMemos[dateKey].map((memo) => (
                    <MemoCardCompact
                      key={memo.id}
                      memo={memo}
                      entities={entities}
                      userId={user?.id}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 빈 상태 */}
        {!isLoading && !isError && (!memos || memos.length === 0) && (
          <div className="text-center text-xs mt-10" style={{ color: theme.ui.textMuted }}>
            아직 메모가 없습니다
          </div>
        )}
        </div>
      </div>

      {/* 맨 아래로 가기 버튼 */}
      {showScrollToBottom && (
        <button
          onClick={scrollToBottom}
          className={`absolute bottom-6 right-6 w-10 h-10 rounded-full text-white shadow-lg transition-all duration-200 flex items-center justify-center backdrop-blur-sm`}
          style={{
            backgroundColor: `${theme.ui.gray[700]}E6`,
            borderColor: `${theme.ui.gray[600]}80`
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${theme.ui.gray[600]}E6`}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${theme.ui.gray[700]}E6`}
          aria-label="맨 아래로 스크롤"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
