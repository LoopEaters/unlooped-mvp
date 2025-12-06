'use client'

import { useState } from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import { highlightEntities } from '@/app/lib/utils/highlightEntities'
import { getRelativeTime } from '@/app/lib/util'
import { useDeleteMemoWithOrphanedEntities } from '@/app/lib/queries'
import { useTheme } from '@/app/providers/ThemeProvider'
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
  const { theme } = useTheme()

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
  const highlightedContent = highlightEntities(memo.content, entities, currentEntityId, theme)

  return (
    <>
      <div
        className="relative border rounded-lg p-4 transition-colors cursor-pointer group"
        style={{
          backgroundColor: theme.ui.cardBg,
          borderColor: theme.ui.border,
        }}
        onMouseEnter={(e) => {
          setIsHovered(true)
          e.currentTarget.style.backgroundColor = theme.ui.cardBgHover
        }}
        onMouseLeave={(e) => {
          setIsHovered(false)
          e.currentTarget.style.backgroundColor = theme.ui.cardBg
        }}
      >
        {/* Hover 시 액션 버튼 표시 (오버레이) */}
        {isHovered && (
          <div
            className="absolute top-2 right-2 flex gap-0.5 backdrop-blur-sm rounded px-0.5 py-0.5"
            style={{ backgroundColor: `${theme.ui.cardBg}CC` }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowEditDrawer(true)
              }}
              className="p-0.5 transition-colors"
              style={{ color: theme.ui.textMuted }}
              onMouseEnter={(e) => e.currentTarget.style.color = theme.ui.interactive.primaryText}
              onMouseLeave={(e) => e.currentTarget.style.color = theme.ui.textMuted}
              title="편집"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowDeleteModal(true)
              }}
              className="p-0.5 transition-colors"
              style={{ color: theme.ui.textMuted }}
              onMouseEnter={(e) => e.currentTarget.style.color = theme.ui.interactive.dangerTextHover}
              onMouseLeave={(e) => e.currentTarget.style.color = theme.ui.textMuted}
              title="삭제"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* 작성 시간 (상대 시간) */}
        <div className="text-xs mb-2" style={{ color: theme.ui.textMuted }}>
          {getRelativeTime(memo.created_at || '')}
        </div>

        {/* 메모 내용 (Entity 하이라이트) */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word" style={{ color: theme.ui.textPrimary }}>
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
