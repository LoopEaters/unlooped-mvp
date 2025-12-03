'use client'

import BaseDrawer from '@/app/components/BaseDrawer'
import { Save } from 'lucide-react'
import { EditorContent } from '@tiptap/react'
import { useTiptapEditorForEdit } from '@/app/hooks/useTiptapEditorForEdit'
import type { Database } from '@/types/supabase'

type Memo = Database['public']['Tables']['memo']['Row']
type Entity = Database['public']['Tables']['entity']['Row']

interface MemoEditDrawerProps {
  isOpen: boolean
  onClose: () => void
  memo: Memo
  entities: Entity[]
  userId: string
}

export default function MemoEditDrawer({
  isOpen,
  onClose,
  memo,
  entities,
  userId,
}: MemoEditDrawerProps) {
  const { editor, isSubmitting, handleUpdate } = useTiptapEditorForEdit({
    memo,
    onSuccess: onClose,
  })

  const handleSave = () => {
    handleUpdate()
  }

  const footer = (
    <div className="flex items-center justify-end gap-3 p-4">
      <button
        onClick={onClose}
        disabled={isSubmitting}
        className="px-4 py-2 text-white bg-bg-secondary hover:bg-bg-card transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        취소
      </button>
      <button
        onClick={handleSave}
        disabled={!editor || !editor.getText().trim() || isSubmitting}
        className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            저장 중...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            저장
          </>
        )}
      </button>
    </div>
  )

  return (
    <BaseDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="메모 편집"
      footer={footer}
    >
      <div className="p-4">
        <div className="bg-bg-card rounded-lg p-4">
          {!editor ? (
            // 에디터 로딩 중 스켈레톤
            <div className="min-h-[200px] text-text-muted animate-pulse">
              메모를 불러오는 중...
            </div>
          ) : (
            <EditorContent editor={editor} className="tiptap-editor" />
          )}
        </div>

        {/* Hint */}
        <div className="mt-3 text-xs text-text-muted">
          <p>• Tab/Space로 엔티티 확정</p>
          <p>• Ctrl+Enter로 저장</p>
          <p>• ESC로 취소</p>
        </div>
      </div>
    </BaseDrawer>
  )
}
