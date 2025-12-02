'use client'

import React from 'react'
import { Send } from 'lucide-react'
import { EditorContent } from '@tiptap/react'
import { useTiptapEditor } from '@/app/lib/hooks/useTiptapEditor'

// ============================================================================
// Main Component
// ============================================================================

export default function InputArea() {
  const { editor, isSubmitting, handleSubmit } = useTiptapEditor()

  return (
    <div className="border-t border-border-main p-4 bg-bg-primary">
      <div className="bg-bg-card rounded-lg p-4 relative">
        {/* Tiptap Editor */}
        <div className="mb-3">
          {!editor ? (
            // 에디터 로딩 중 스켈레톤
            <div className="min-h-[80px] text-text-muted animate-pulse">
              메모를 작성하세요... (@로 엔티티 추가)
            </div>
          ) : (
            <EditorContent editor={editor} className="tiptap-editor" />
          )}
        </div>

        {/* Submit button */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-text-muted">
            Tab/Space로 확정 • Ctrl+Enter로 저장
          </div>
          <button
            onClick={handleSubmit}
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
                <Send className="w-4 h-4" />
                저장
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
