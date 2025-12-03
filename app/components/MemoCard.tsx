'use client'

import { highlightEntities } from '@/app/lib/utils/highlightEntities'
import { getRelativeTime } from '@/app/lib/util'
import type { Database } from '@/types/supabase'

type Memo = Database['public']['Tables']['memo']['Row']
type Entity = Database['public']['Tables']['entity']['Row']

interface MemoCardProps {
  memo: Memo
  entities?: Entity[]
  currentEntityId?: string  // 현재 entity section의 entity ID
}

export default function MemoCard({ memo, entities = [], currentEntityId }: MemoCardProps) {
  // Entity 하이라이트 처리 (현재 entity 강조)
  const highlightedContent = highlightEntities(memo.content, entities, currentEntityId)

  return (
    <div className="bg-bg-card border border-border-main rounded-lg p-4 hover:bg-bg-secondary/50 transition-colors cursor-pointer">
      {/* 작성 시간 (상대 시간) */}
      <div className="text-xs text-text-muted mb-2">
        {getRelativeTime(memo.created_at || '')}
      </div>

      {/* 메모 내용 (Entity 하이라이트) */}
      <div className="text-sm text-white leading-relaxed whitespace-pre-wrap wrap-break-word">
        {highlightedContent}
      </div>
    </div>
  )
}
