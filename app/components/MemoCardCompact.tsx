'use client'

import { useState } from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import { highlightEntities } from '@/app/lib/utils/highlightEntities'
import type { Database } from '@/types/supabase'

type Memo = Database['public']['Tables']['memo']['Row']
type Entity = Database['public']['Tables']['entity']['Row']

interface MemoCardCompactProps {
  memo: Memo
  entities?: Entity[]
  userId?: string
}

export default function MemoCardCompact({ memo, entities = [], userId }: MemoCardCompactProps) {
  const [isHovered, setIsHovered] = useState(false)

  // 작성 시간 포맷팅 (시:분만)
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  // Entity 하이라이트 처리
  const highlightedContent = highlightEntities(memo.content, entities)

  return (
    <div
      className="relative bg-bg-card border border-border-main rounded-md p-2 hover:bg-bg-secondary/50 transition-colors cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover 시 액션 버튼 표시 (오버레이) */}
      {isHovered && (
        <div className="absolute top-1.5 right-1.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-bg-card/80 backdrop-blur-sm rounded px-0.5 py-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation()
              console.log('편집 클릭:', memo.id)
              // TODO: 편집 모달 열기
            }}
            className="p-0.5 text-text-muted hover:text-blue-400 transition-colors"
            title="편집"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              console.log('삭제 클릭:', memo.id)
              // TODO: 삭제 confirm 또는 모달
            }}
            className="p-0.5 text-text-muted hover:text-red-400 transition-colors"
            title="삭제"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 시간 */}
      <div className="text-[10px] text-text-muted mb-1">{formatTime(memo.created_at || '')}</div>

      {/* 메모 내용 (Entity 하이라이트) */}
      <div className="text-xs text-white leading-relaxed whitespace-pre-wrap wrap-break-word">
        {highlightedContent}
      </div>
    </div>
  )
}
