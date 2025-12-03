'use client'

import React from 'react'
import { Send } from 'lucide-react'
import { EditorContent } from '@tiptap/react'
import { useTiptapEditor } from '@/app/hooks/useTiptapEditor'
import { useLayout } from '@/app/providers/SettingsProvider'

// ============================================================================
// Main Component
// ============================================================================

export default function InputArea() {
  const { editor, isSubmitting, handleSubmit } = useTiptapEditor()
  const { isFullWidth } = useLayout()

  return (
    <div className="px-4 bg-bg-primary">
      {/* 컨텐츠 Wrapper - full width 설정에 따라 중앙 정렬, border는 wrapper 내부로 */}
      <div className={`${isFullWidth ? 'w-full' : 'max-w-3xl mx-auto'} border-t border-border-main py-3`}>
        {/* Single-line minimal input container */}
        <div className="flex items-center gap-2 bg-transparent border border-border-main/30 rounded-lg px-3 py-2 transition-all focus-within:border-border-main hover:border-border-main/50">
        {/* Editor area - flex-1 to take remaining space */}
        <div className="flex-1 min-w-0">
          {!editor ? (
            // 에디터 로딩 중 스켈레톤
            <div className="text-text-muted animate-pulse text-sm">
              메모를 작성하세요...
            </div>
          ) : (
            <EditorContent editor={editor} className="tiptap-editor" />
          )}
        </div>

        {/* Minimal icon submit button */}
        <button
          onClick={handleSubmit}
          disabled={!editor || !editor.getText().trim() || isSubmitting}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md text-text-muted hover:text-white hover:bg-bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-text-muted"
          title="메모 저장 (Ctrl+Enter)"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
        </div>
        {/* Subtle hint text */}
        <div className="text-xs text-text-muted/50 mt-1.5 px-1">
          @로 엔티티 추가 • Tab/Space로 확정 • Ctrl+Enter로 저장
        </div>
      </div>
    </div>
  )
}
