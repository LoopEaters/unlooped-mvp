'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X, Save } from 'lucide-react'
import { EditorContent } from '@tiptap/react'
import { useTiptapEditorForEdit } from '@/app/lib/hooks/useTiptapEditorForEdit'
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

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

        {/* Drawer Content */}
        <Dialog.Content
          className="drawer-content fixed right-0 top-0 h-full w-[600px] z-50 bg-bg-primary border-l border-border-main shadow-xl flex flex-col"
          onEscapeKeyDown={onClose}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-main">
            <Dialog.Title className="text-lg font-semibold text-white">
              메모 편집
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-1.5 text-text-muted hover:text-white transition-colors rounded-md hover:bg-bg-secondary"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-y-auto p-4">
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

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-border-main">
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
