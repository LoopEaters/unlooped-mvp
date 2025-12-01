'use client'

import { highlightEntities } from '@/app/lib/utils/highlightEntities'
import type { Database } from '@/types/supabase'

type Memo = Database['public']['Tables']['memo']['Row']

interface MemoCardProps {
  memo: Memo
}

export default function MemoCard({ memo }: MemoCardProps) {
  // 작성 시간 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

  // Entity 하이라이트 처리
  const highlightedContent = highlightEntities(memo.content)

  return (
    <div className="bg-bg-card border border-border-main rounded-lg p-4 hover:bg-bg-secondary/50 transition-colors cursor-pointer">
      {/* 작성 시간 */}
      <div className="text-xs text-text-muted mb-2">
        {formatDate(memo.created_at || '')}
      </div>

      {/* 메모 내용 (Entity 하이라이트) */}
      <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
        {highlightedContent}
      </div>
    </div>
  )
}
