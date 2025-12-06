'use client'

import type { Database } from '@/types/supabase'
import BaseDrawer from '@/app/components/common/BaseDrawer'
import { useTheme } from '@/app/providers/ThemeProvider'
import { useState } from 'react'
import { EditorContent } from '@tiptap/react'
import { useTiptapEditorForEdit } from '@/app/hooks/useTiptapEditorForEdit'

type Memo = Database['public']['Tables']['memo']['Row']
type Entity = Database['public']['Tables']['entity']['Row']

interface MemoDetailDrawerProps {
  isOpen: boolean
  memo: Memo | null
  entities: Entity[]
  onClose: () => void
  userId?: string // userId 추가
  allEntities?: Entity[] // 전체 entity 목록 (편집 시 필요)
}

export default function MemoDetailDrawer({
  isOpen,
  memo,
  entities,
  onClose,
  userId = '',
  allEntities = [],
}: MemoDetailDrawerProps) {
  const { theme } = useTheme()

  // React Hook 규칙: 조건문 전에 early return
  if (!memo) return null

  const [saveButtonHovered, setSaveButtonHovered] = useState(false)
  const [cancelButtonHovered, setCancelButtonHovered] = useState(false)

  // Tiptap 에디터 훅 사용 (편집 모드)
  const { editor, isSubmitting, handleUpdate } = useTiptapEditorForEdit({
    memo,
    onSuccess: onClose,
    theme,
  })

  // Cancel handler
  const handleCancel = () => {
    onClose()
  }

  const dateStr = memo.created_at
    ? new Date(memo.created_at).toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Unknown date'

  const updatedStr = memo.updated_at
    ? new Date(memo.updated_at).toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  // 에디터가 비어있거나 공백만 있는지 확인
  const hasContent = editor?.getText().trim() || false

  return (
    <BaseDrawer
      isOpen={isOpen}
      onClose={handleCancel}
      title="Edit Memo"
      width="w-[500px]"
      modal={false}
      footer={
        <div className="px-6 py-4 flex gap-3">
          <button
            onClick={handleCancel}
            onMouseEnter={() => setCancelButtonHovered(true)}
            onMouseLeave={() => setCancelButtonHovered(false)}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            style={{
              backgroundColor: cancelButtonHovered
                ? theme.drawer.card.borderHover
                : theme.drawer.card.background,
              color: theme.drawer.section.text,
              border: `1px solid ${theme.drawer.card.border}`,
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => handleUpdate()}
            onMouseEnter={() => setSaveButtonHovered(true)}
            onMouseLeave={() => setSaveButtonHovered(false)}
            disabled={isSubmitting || !hasContent}
            className="flex-1 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            style={{
              backgroundColor: saveButtonHovered
                ? theme.drawer.button.secondary.bgHover
                : theme.drawer.button.secondary.bg,
              color: theme.drawer.button.secondary.text,
            }}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      }
    >
      <div className="px-6 py-4 space-y-6">
        {/* Date */}
        <div>
          <h3
            className="text-xs uppercase tracking-wide mb-2"
            style={{ color: theme.drawer.section.title }}
          >
            Created
          </h3>
          <p style={{ color: theme.drawer.section.text }}>{dateStr}</p>
          {updatedStr && updatedStr !== dateStr && (
            <>
              <h3
                className="text-xs uppercase tracking-wide mb-2 mt-3"
                style={{ color: theme.drawer.section.title }}
              >
                Last Updated
              </h3>
              <p style={{ color: theme.drawer.section.text }}>{updatedStr}</p>
            </>
          )}
        </div>

        {/* Entities */}
        <div>
          <h3
            className="text-xs uppercase tracking-wide mb-3"
            style={{ color: theme.drawer.section.title }}
          >
            Connected Entities ({entities.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {entities.map((entity) => (
              <span
                key={entity.id}
                className="px-3 py-1.5 text-sm rounded-full"
                style={{
                  backgroundColor: theme.drawer.card.background,
                  color: theme.drawer.section.text,
                  border: `1px solid ${theme.drawer.card.border}`,
                }}
              >
                {entity.name}
                {entity.type && (
                  <span className="ml-2 text-xs" style={{ color: theme.drawer.section.textMuted }}>
                    ({entity.type})
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Content (Editable with Tiptap) */}
        <div>
          <h3
            className="text-xs uppercase tracking-wide mb-3"
            style={{ color: theme.drawer.section.title }}
          >
            Content
          </h3>
          <div
            className="w-full rounded-lg p-4 focus-within:ring-2 focus-within:ring-orange-500/50 transition-all"
            style={{
              backgroundColor: theme.drawer.card.background,
              border: `1px solid ${theme.drawer.card.border}`,
              color: theme.drawer.section.text,
              minHeight: '200px',
            }}
          >
            {!editor ? (
              <div className="text-text-muted animate-pulse text-sm">
                에디터 로딩 중...
              </div>
            ) : (
              <EditorContent editor={editor} className="tiptap-editor" />
            )}
          </div>
          <div className="text-xs text-text-muted/50 mt-2 px-1">
            @로 엔티티 추가 • Tab/Space로 확정 • Ctrl+Enter로 저장
          </div>
        </div>
      </div>
    </BaseDrawer>
  )
}
