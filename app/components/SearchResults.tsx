'use client'

import { useEffect, useState, useMemo } from 'react'
import { cn } from '@/app/lib/util'
import type { Database } from '@/types/supabase'

type Entity = Database['public']['Tables']['entity']['Row']
type Memo = Database['public']['Tables']['memo']['Row']

interface SearchResultsProps {
  entities: Entity[]
  memos: Memo[]
  isLoading: boolean
  query: string
  onSelectEntity: (entity: Entity) => void
  onSelectMemo: (memo: Memo) => void
  onClose: () => void
}

type FlatResult =
  | { type: 'entity'; data: Entity; id: string }
  | { type: 'memo'; data: Memo; id: string }

/**
 * 검색 결과 표시 컴포넌트
 * Entity와 Memo 검색 결과를 그룹별로 표시하고 키보드 네비게이션 지원
 */
export default function SearchResults({
  entities,
  memos,
  isLoading,
  query,
  onSelectEntity,
  onSelectMemo,
  onClose,
}: SearchResultsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Entity를 이름 매치 우선으로 정렬
  const sortedEntities = useMemo(() => {
    const withNameMatch = entities.filter(e =>
      e.name.toLowerCase().includes(query.toLowerCase())
    )
    const withoutNameMatch = entities.filter(e =>
      !e.name.toLowerCase().includes(query.toLowerCase())
    )
    return [...withNameMatch, ...withoutNameMatch]
  }, [entities, query])

  // Entity + Memo를 우선순위에 따라 정렬
  const flatResults: FlatResult[] = useMemo(() => {
    return [
      ...sortedEntities.map((entity) => ({ type: 'entity' as const, data: entity, id: entity.id })),
      ...memos.map((memo) => ({ type: 'memo' as const, data: memo, id: memo.id })),
    ]
  }, [sortedEntities, memos])

  // 결과가 변경되면 선택 인덱스 초기화
  useEffect(() => {
    setSelectedIndex(0)
  }, [entities.length, memos.length])

  // 키보드 네비게이션
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev < flatResults.length - 1 ? prev + 1 : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatResults.length - 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const selected = flatResults[selectedIndex]
        if (selected) {
          if (selected.type === 'entity') {
            onSelectEntity(selected.data)
          } else {
            onSelectMemo(selected.data)
          }
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [flatResults, selectedIndex, onSelectEntity, onSelectMemo, onClose])

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="text-gray-400 text-sm">검색 중...</div>
      </div>
    )
  }

  // 빈 결과
  if (entities.length === 0 && memos.length === 0) {
    return (
      <div className="p-4">
        <div className="text-gray-400 text-sm">
          &quot;{query}&quot;에 대한 검색 결과가 없습니다
        </div>
      </div>
    )
  }

  // Entity 타입별 색상
  const getEntityTypeColor = (type: string | null) => {
    switch (type) {
      case 'person':
        return 'bg-mention-person/20 text-mention-person'
      case 'project':
        return 'bg-mention-project/20 text-mention-project'
      default:
        return 'bg-gray-400/20 text-gray-400'
    }
  }

  // 검색어 하이라이트 (대소문자 구분 없이)
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return <span>{text}</span>
    }

    const regex = new RegExp(`(${highlight})`, 'gi')
    const parts = text.split(regex)

    return (
      <span>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <mark key={index} className="bg-yellow-500/30 text-yellow-200 px-0.5 rounded">
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </span>
    )
  }

  // Memo 내용 미리보기 (100자 제한)
  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  // 날짜 포맷팅
  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return '오늘'
    if (days === 1) return '어제'
    if (days < 7) return `${days}일 전`

    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  let currentIndex = 0

  return (
    <div className="py-2">
      {/* Entity 섹션 */}
      {sortedEntities.length > 0 && (
        <div className="mb-2">
          <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">
            Entities
          </div>
          {sortedEntities.map((entity) => {
            const index = currentIndex++
            const isSelected = index === selectedIndex

            return (
              <button
                key={entity.id}
                className={cn(
                  'w-full px-3 py-2 text-left transition-colors',
                  isSelected
                    ? 'bg-blue-500/20 text-white'
                    : 'text-gray-300 hover:bg-bg-card'
                )}
                onClick={() => onSelectEntity(entity)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-xs font-medium',
                      getEntityTypeColor(entity.type)
                    )}
                  >
                    {entity.type || 'unknown'}
                  </span>
                  <span className="font-medium">{highlightText(entity.name, query)}</span>
                </div>
                {entity.description && (
                  <div className="text-xs text-gray-400 mt-1 line-clamp-1">
                    {highlightText(entity.description, query)}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Memo 섹션 */}
      {memos.length > 0 && (
        <div>
          <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">
            Memos
          </div>
          {memos.map((memo) => {
            const index = currentIndex++
            const isSelected = index === selectedIndex

            return (
              <button
                key={memo.id}
                className={cn(
                  'w-full px-3 py-2 text-left transition-colors',
                  isSelected
                    ? 'bg-blue-500/20 text-white'
                    : 'text-gray-300 hover:bg-bg-card'
                )}
                onClick={() => onSelectMemo(memo)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="text-sm line-clamp-2">
                  {highlightText(truncateContent(memo.content), query)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {formatDate(memo.created_at)}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
