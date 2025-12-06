'use client'

import React from 'react'
import { Send } from 'lucide-react'
import { EditorContent } from '@tiptap/react'
import { useTiptapEditor } from '@/app/hooks/useTiptapEditor'
import { useLayout } from '@/app/providers/SettingsProvider'
import { useTheme } from '@/app/providers/ThemeProvider'

// ============================================================================
// Main Component
// ============================================================================

export default function InputArea() {
  const { theme } = useTheme()
  const { editor, isSubmitting, handleSubmit } = useTiptapEditor({ theme })
  const { isFullWidth } = useLayout()

  return (
    <div className="px-4" style={{ backgroundColor: theme.ui.primaryBg }}>
      {/* 컨텐츠 Wrapper - full width 설정에 따라 중앙 정렬, border는 wrapper 내부로 */}
      <div
        className={`${isFullWidth ? 'w-full' : 'max-w-3xl mx-auto'} border-t py-3`}
        style={{ borderColor: theme.ui.border }}
      >
        {/* Single-line minimal input container */}
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2 transition-all border"
          style={{
            backgroundColor: 'transparent',
            borderColor: `${theme.ui.border}4D`, // 30% opacity = 4D
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = theme.ui.border
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = `${theme.ui.border}4D`
          }}
          onMouseEnter={(e) => {
            if (document.activeElement !== e.currentTarget) {
              e.currentTarget.style.borderColor = `${theme.ui.border}80` // 50% opacity
            }
          }}
          onMouseLeave={(e) => {
            if (document.activeElement !== e.currentTarget) {
              e.currentTarget.style.borderColor = `${theme.ui.border}4D`
            }
          }}
        >
          {/* Editor area - flex-1 to take remaining space */}
          <div className="flex-1 min-w-0">
            {!editor ? (
              // 에디터 로딩 중 스켈레톤
              <div
                className="animate-pulse text-sm"
                style={{ color: theme.ui.textMuted }}
              >
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
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: theme.ui.textMuted }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.color = '#ffffff'
                e.currentTarget.style.backgroundColor = theme.ui.secondaryBg
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.color = theme.ui.textMuted
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
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
        <div
          className="text-xs mt-1.5 px-1"
          style={{ color: `${theme.ui.textMuted}80` }} // 50% opacity
        >
          @로 엔티티 추가 • Tab/Space로 확정 • Ctrl+Enter로 저장
        </div>
      </div>
    </div>
  )
}
