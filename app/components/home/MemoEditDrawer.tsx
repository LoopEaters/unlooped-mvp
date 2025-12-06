'use client'

import BaseDrawer from '@/app/components/common/BaseDrawer'
import { Save, Calendar } from 'lucide-react'
import { EditorContent } from '@tiptap/react'
import { useTiptapEditorForEdit } from '@/app/hooks/useTiptapEditorForEdit'
import { useTheme } from '@/app/providers/ThemeProvider'
import { getEntityTypeColor } from '@/app/lib/theme'
import { getRelativeTime } from '@/app/lib/util'
import { useState, useEffect } from 'react'
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
  const { theme } = useTheme()

  // 생성일자 상태 관리
  const [createdAt, setCreatedAt] = useState<string>(memo.created_at || '')

  // memo.created_at이 변경되면 state 업데이트
  useEffect(() => {
    setCreatedAt(memo.created_at || '')
  }, [memo.created_at])

  const { editor, isSubmitting, handleUpdate } = useTiptapEditorForEdit({
    memo,
    onSuccess: onClose,
    createdAt,
  })

  const handleSave = () => {
    handleUpdate(createdAt)
  }

  // 에디터에서 실시간으로 연결된 엔티티 추출
  const [connectedEntities, setConnectedEntities] = useState<Entity[]>([])

  useEffect(() => {
    if (!editor) return

    const updateConnectedEntities = () => {
      try {
        const json = editor.getJSON()
        const entityNames: string[] = []

        const traverse = (node: any) => {
          if (node.type === 'mention' && node.attrs?.id) {
            entityNames.push(node.attrs.id)
          }
          if (node.content) {
            node.content.forEach(traverse)
          }
        }

        traverse(json)

        const uniqueNames = [...new Set(entityNames)]
        const connected = uniqueNames
          .map((name) => entities.find((e) => e.name === name))
          .filter((e): e is Entity => e !== undefined)

        setConnectedEntities(connected)
      } catch {
        setConnectedEntities([])
      }
    }

    // 초기 로드
    updateConnectedEntities()

    // 에디터 업데이트 시 실시간 반영
    editor.on('update', updateConnectedEntities)

    return () => {
      editor.off('update', updateConnectedEntities)
    }
  }, [editor, entities])

  // datetime-local input 포맷 변환
  const formatDateTimeLocal = (isoString: string) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  // datetime-local에서 ISO string으로 변환
  const parseDateTimeLocal = (dateTimeLocal: string) => {
    if (!dateTimeLocal) return ''
    return new Date(dateTimeLocal).toISOString()
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
        className={`px-6 py-2 ${theme.ui.interactive.primaryBg} text-white font-medium rounded-lg ${theme.ui.interactive.primaryBgHover} transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
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
      width="w-[600px]"
      footer={footer}
    >
      <div className="px-6 py-4 space-y-6">
        {/* 메타정보 섹션 */}
        <div>
          {/* 생성일자 (편집 가능) + 수정일자 표시 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label
                className="text-xs uppercase tracking-wide flex items-center gap-1.5"
                style={{ color: theme.drawer.section.title }}
              >
                <Calendar className="w-3.5 h-3.5" />
                생성일자
              </label>
              {memo.updated_at && (
                <span
                  className="text-xs font-light"
                  style={{ color: theme.drawer.section.textMuted }}
                >
                  · {getRelativeTime(memo.updated_at)} 수정
                </span>
              )}
            </div>
            <input
              type="datetime-local"
              value={formatDateTimeLocal(createdAt)}
              onChange={(e) => setCreatedAt(parseDateTimeLocal(e.target.value))}
              className="w-full px-3 py-2 rounded-lg text-sm transition-colors"
              style={{
                backgroundColor: theme.drawer.card.background,
                border: `1px solid ${theme.drawer.card.border}`,
                color: theme.drawer.section.text,
              }}
            />
          </div>
        </div>

        {/* 메모 내용 편집 */}
        <div>
          <h3
            className="text-xs uppercase tracking-wide mb-2"
            style={{ color: theme.drawer.section.title }}
          >
            메모 내용
          </h3>
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

        {/* 연결된 엔티티 */}
        <div>
          <h3
            className="text-xs uppercase tracking-wide mb-3"
            style={{ color: theme.drawer.section.title }}
          >
            연결된 엔티티 ({connectedEntities.length})
          </h3>
          <div className="space-y-2">
            {connectedEntities.length === 0 ? (
              <p className="text-sm" style={{ color: theme.drawer.section.textMuted }}>
                연결된 엔티티가 없습니다.
              </p>
            ) : (
              connectedEntities.map((entity) => {
                const typeColor = getEntityTypeColor(entity.type)
                return (
                  <div
                    key={entity.id}
                    className="rounded-lg p-3 flex items-center gap-3"
                    style={{
                      backgroundColor: theme.drawer.card.background,
                      border: `1px solid ${theme.drawer.card.border}`,
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: typeColor.hex }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: theme.drawer.section.text }}
                      >
                        {entity.name}
                      </p>
                      {entity.type && (
                        <p
                          className="text-xs mt-0.5 capitalize"
                          style={{ color: typeColor.hex }}
                        >
                          {entity.type}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </BaseDrawer>
  )
}
