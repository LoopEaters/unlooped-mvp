'use client'

import { highlightEntities } from '@/app/lib/utils/highlightEntities'
import type { Database } from '@/types/supabase'

type Memo = Database['public']['Tables']['memo']['Row']
type Entity = Database['public']['Tables']['entity']['Row']

interface MemoCardCompactProps {
  memo: Memo
  entities?: Entity[]
}

export default function MemoCardCompact({ memo, entities = [] }: MemoCardCompactProps) {
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
    <div className="bg-bg-card border border-border-main rounded-md p-2.5 hover:bg-bg-secondary/50 transition-colors cursor-pointer">
      {/* 작성 시간 */}
      <div className="text-[10px] text-text-muted mb-1">
        {formatTime(memo.created_at || '')}
      </div>

      {/* 메모 내용 (Entity 하이라이트) */}
      <div className="text-xs text-white leading-relaxed whitespace-pre-wrap wrap-break-word">
        {highlightedContent}
      </div>
    </div>
  )
}
