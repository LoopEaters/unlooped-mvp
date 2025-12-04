'use client'

import { useState } from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import { highlightEntities } from '@/app/lib/utils/highlightEntities'
import { getRelativeTime } from '@/app/lib/util'
import { useDeleteMemoWithOrphanedEntities } from '@/app/lib/queries'
import { defaultTheme } from '@/app/lib/theme'
import MemoEditDrawer from './MemoEditDrawer'
import MemoDeleteModal from './MemoDeleteModal'
import type { Database } from '@/types/supabase'

type Memo = Database['public']['Tables']['memo']['Row']
type Entity = Database['public']['Tables']['entity']['Row']

interface MemoCardProps {
  memo: Memo
  entities?: Entity[]
  currentEntityId?: string  // 현재 entity section의 entity ID
  userId?: string
}

export default function MemoCard({ memo, entities = [], currentEntityId, userId }: MemoCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showEditDrawer, setShowEditDrawer] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const deleteMemo = useDeleteMemoWithOrphanedEntities(userId || '')

  const handleDelete = () => {
    deleteMemo.mutate(memo.id, {
      onSuccess: () => {
        setShowDeleteModal(false)
        // Toast는 mutation의 onSuccess에서 처리됨
      },
    })
  }

  // Entity 하이라이트 처리 (현재 entity 강조)
  const highlightedContent = highlightEntities(memo.content, entities, currentEntityId)

  return (
    <>
      <div
        className="relative bg-bg-card border border-border-main rounded-lg p-4 hover:bg-bg-secondary/50 transition-colors cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Hover 시 액션 버튼 표시 (오버레이) */}
        {isHovered && (
          <div className="absolute top-2 right-2 flex gap-0.5 bg-bg-card/80 backdrop-blur-sm rounded px-0.5 py-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowEditDrawer(true)
              }}
              className={`p-0.5 text-text-muted ${defaultTheme.ui.interactive.primaryText} transition-colors`}
              title="편집"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowDeleteModal(true)
              }}
              className={`p-0.5 text-text-muted ${defaultTheme.ui.interactive.dangerTextHover} transition-colors`}
              title="삭제"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* 작성 시간 (상대 시간) */}
        <div className="text-xs text-text-muted mb-2">
          {getRelativeTime(memo.created_at || '')}
        </div>

        {/* 메모 내용 (Entity 하이라이트) */}
        <div className="text-sm text-white leading-relaxed whitespace-pre-wrap wrap-break-word">
          {highlightedContent}
        </div>
      </div>

      {/* Edit Drawer */}
      {userId && (
        <MemoEditDrawer
          isOpen={showEditDrawer}
          onClose={() => setShowEditDrawer(false)}
          memo={memo}
          entities={entities}
          userId={userId}
        />
      )}

      {/* Delete Modal */}
      <MemoDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        memoContent={memo.content}
        isDeleting={deleteMemo.isPending}
      />
    </>
  )
}
