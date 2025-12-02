'use client'

import React, { useState, useRef, KeyboardEvent } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import EntityDropdown from './EntityDropdown'
import { useEntities, useCreateMemo } from '@/app/lib/queries'
import { useAuth } from '@/app/providers/AuthProvider'
import { useEntityFilter } from '@/app/providers/EntityFilterProvider'
import { useAIUpdate } from '@/app/providers/AIUpdateProvider'
import type { Database } from '@/types/supabase'
import {
  parseCurrentMention,
  extractConfirmedEntities,
  confirmMentionInContent,
  getEntityTypeColorForInput,
  setCursorPosition,
  type MentionContext,
} from '@/app/lib/mentionUtils'

type Entity = Database['public']['Tables']['entity']['Row']

// ============================================================================
// Main Component
// ============================================================================

export default function InputArea() {
  // ============ State ============
  const [content, setContent] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [pendingEntityTypes, setPendingEntityTypes] = useState<Record<string, string>>({})
  const [classifyingEntities, setClassifyingEntities] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLDivElement>(null)
  const isConfirmingRef = useRef(false)

  // ============ Hooks ============
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { data: entities = [] as Entity[] } = useEntities(user?.id)
  const createMemo = useCreateMemo(user?.id || '')
  const { setFilteredEntityIds } = useEntityFilter()
  const { addUpdatingEntity, removeUpdatingEntity } = useAIUpdate()

  // ============ Derived State ============
  const mentionContext = parseCurrentMention(content)
  const isDropdownOpen = mentionContext !== null && mentionContext.search.length > 0

  // 드롭다운에 표시할 entities (최대 5개)
  const filteredEntities = isDropdownOpen
    ? entities
        .filter((entity) =>
          entity.name.toLowerCase().startsWith(mentionContext.search.toLowerCase())
        )
        .slice(0, 5)
    : []

  // 확정된 entity들 (메모이제이션으로 안정화)
  const confirmedEntityNames = React.useMemo(
    () => extractConfirmedEntities(content),
    [content]
  )

  // ============ Effects ============

  // 확정된 entity들을 필터에 반영
  React.useEffect(() => {
    if (!user?.id || confirmedEntityNames.length === 0) {
      setFilteredEntityIds([])
      return
    }

    const entityIds = confirmedEntityNames
      .map((name) => entities.find((e) => e.name === name)?.id)
      .filter((id): id is string => id !== undefined)

    setFilteredEntityIds(entityIds)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmedEntityNames, user?.id, setFilteredEntityIds])

  // selectedIndex 초기화 (드롭다운이 열릴 때마다)
  React.useEffect(() => {
    if (isDropdownOpen) {
      setSelectedIndex(0)
    }
  }, [isDropdownOpen])

  // ============ Event Handlers ============

  /**
   * AI를 통해 entity type 분류 (백그라운드 실행)
   */
  const classifyEntityType = async (entityName: string) => {
    // 이미 존재하는 entity면 건너뜀
    if (entities.find((e) => e.name === entityName)) {
      return
    }

    // 로딩 시작
    setClassifyingEntities((prev) => new Set(prev).add(entityName))

    try {
      const response = await fetch('/api/entity/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityName }),
      })

      if (response.ok) {
        const result = await response.json()
        setPendingEntityTypes((prev) => ({
          ...prev,
          [entityName]: result.type,
        }))
      }
    } catch (error) {
      console.error(`AI 분류 실패: ${entityName}`, error)
    } finally {
      // 로딩 종료
      setClassifyingEntities((prev) => {
        const next = new Set(prev)
        next.delete(entityName)
        return next
      })
    }
  }

  /**
   * 멘션 확정 처리
   */
  const confirmMention = (mentionContext: MentionContext, entity: Entity | null) => {
    const entityName = entity?.name || mentionContext.search

    // 새 entity면 AI 분류 시작 (백그라운드)
    if (!entity && entityName && user?.id) {
      classifyEntityType(entityName)
    }

    // Content 업데이트
    const newContent = confirmMentionInContent(content, mentionContext, entityName)

    // 플래그 설정
    isConfirmingRef.current = true

    setContent(newContent)

    // DOM 업데이트
    if (inputRef.current) {
      inputRef.current.textContent = newContent

      // 커서를 확정된 entity 뒤로 이동
      const cursorPos = mentionContext.startPos + 1 + entityName.length + 1

      requestAnimationFrame(() => {
        if (inputRef.current) {
          setCursorPosition(inputRef.current, cursorPos)

          // 플래그 해제
          setTimeout(() => {
            isConfirmingRef.current = false
          }, 50)
        }
      })
    }
  }

  /**
   * 키보드 입력 처리
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Ctrl+Enter: 메모 저장
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault()
      handleSubmit()
      return
    }

    // Enter (단순 줄바꿈): 명시적으로 \n 삽입
    if (e.key === 'Enter' && !e.ctrlKey) {
      e.preventDefault()

      const selection = window.getSelection()
      if (!selection || !inputRef.current) return

      // 현재 커서 위치에 \n 삽입
      const range = selection.getRangeAt(0)
      range.deleteContents()

      const textNode = document.createTextNode('\n')
      range.insertNode(textNode)

      // 커서를 \n 뒤로 이동
      range.setStartAfter(textNode)
      range.setEndAfter(textNode)
      selection.removeAllRanges()
      selection.addRange(range)

      // content 업데이트
      const text = inputRef.current.textContent || ''
      setContent(text)
      return
    }

    // Escape: 드롭다운 닫기 (멘션 취소)
    if (e.key === 'Escape' && mentionContext) {
      e.preventDefault()
      const newContent = content.slice(0, mentionContext.startPos)
      setContent(newContent)
      return
    }

    // Tab/Space: 현재 멘션 확정 (PRD: @뒤에서만)
    if ((e.key === 'Tab' || e.key === ' ') && mentionContext) {
      // 이중 호출 방지
      if (isConfirmingRef.current) {
        e.preventDefault()
        return
      }

      e.preventDefault()

      // 매칭되는 entity 찾기
      let entityToConfirm: Entity | null = null

      if (filteredEntities.length > 0) {
        // 드롭다운에 매칭이 있으면 선택된 것 사용
        entityToConfirm = filteredEntities[selectedIndex] || filteredEntities[0]
      }
      // 매칭이 없으면 null (새 entity)

      confirmMention(mentionContext, entityToConfirm)
      return
    }

    // 드롭다운 화살표 키 처리
    if (isDropdownOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault()
      if (e.key === 'ArrowDown') {
        setSelectedIndex((prev) =>
          prev < filteredEntities.length - 1 ? prev + 1 : prev
        )
      } else if (e.key === 'ArrowUp') {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
      }
    }
  }

  /**
   * 메모 제출
   */
  const handleSubmit = () => {
    if (!content.trim()) return

    const entityNames = extractConfirmedEntities(content)

    createMemo.mutate(
      {
        content,
        entityNames,
        pendingEntityTypes,  // 미리 분류된 types 전달
        onAIUpdateStart: (entityIds: string[]) => {
          entityIds.forEach((id) => addUpdatingEntity(id))
          setTimeout(() => {
            entityIds.forEach((id) => removeUpdatingEntity(id))
          }, 5000)
        },
      },
      {
        onSuccess: () => {
          setContent('')
          setPendingEntityTypes({})
          setClassifyingEntities(new Set())
          if (inputRef.current) {
            inputRef.current.textContent = ''
          }
        },
        onError: (error) => {
          console.error('메모 저장 실패:', error)
        },
      }
    )
  }

  // ============ Render ============
  return (
    <div className="border-t border-border-main p-4 bg-bg-primary">
      <div className="bg-bg-card rounded-lg p-4 relative">
        {/* Entity 자동완성 드롭다운 */}
        <EntityDropdown
          search={mentionContext?.search || ''}
          entities={filteredEntities}
          selectedIndex={selectedIndex}
          onSelect={(entity) => {
            if (mentionContext) {
              confirmMention(mentionContext, entity)
            }
          }}
          isOpen={isDropdownOpen}
        />

        {/* Text input area - Overlay pattern (권장 방식) */}
        <div className="relative mb-3">
          {/* Highlight overlay - 하이라이트만 담당 */}
          <div
            className="absolute inset-0 min-h-[80px] text-white pointer-events-none whitespace-pre-wrap break-words overflow-wrap-anywhere"
            style={{
              color: 'transparent',
              wordBreak: 'break-word'
            }}
          >
            {content.split(/(@[가-힣a-zA-Z0-9]+)/g).map((part, index) => {
              if (part.match(/^@[가-힣a-zA-Z0-9]+$/)) {
                const entityName = part.substring(1)
                const entity = entities.find((e) => e.name === entityName)
                const isClassifying = classifyingEntities.has(entityName)

                // 로딩 중
                if (isClassifying) {
                  return (
                    <span
                      key={index}
                      className="bg-blue-500/50 text-blue-300 animate-pulse"
                      style={{ animationDuration: '0.8s' }}
                    >
                      {part}
                    </span>
                  )
                }

                // 하이라이트
                const entityType = entity?.type || pendingEntityTypes[entityName]
                const colorClass = getEntityTypeColorForInput(entityType)
                return (
                  <span key={index} className={`${colorClass}/20 ${colorClass}`}>
                    {part}
                  </span>
                )
              }
              // 일반 텍스트 - 개행문자를 <br>로 변환
              return (
                <React.Fragment key={index}>
                  {part.split('\n').map((line, i, arr) => (
                    <React.Fragment key={`${index}-${i}`}>
                      {line}
                      {i < arr.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              )
            })}
          </div>

          {/* Actual input - 입력만 담당 */}
          <div
            ref={inputRef}
            contentEditable
            className="relative min-h-[80px] text-white outline-none bg-transparent whitespace-pre-wrap break-words overflow-wrap-anywhere"
            style={{ wordBreak: 'break-word' }}
            onInput={(e) => {
              if (isConfirmingRef.current) return
              const text = e.currentTarget.textContent || ''
              setContent(text)
            }}
            onKeyDown={handleKeyDown}
            data-placeholder="메모를 작성하세요... (@로 엔티티 추가)"
            suppressContentEditableWarning
          />
        </div>

        {/* Submit button */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-text-muted">
            Tab/Space로 확정 • Ctrl+Enter로 저장
          </div>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || createMemo.isPending}
            className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {createMemo.isPending ? (
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
