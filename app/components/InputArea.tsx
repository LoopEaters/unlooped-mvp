'use client'

import React, { useState, useRef, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import EntityDropdown from './EntityDropdown'
import { useEntities, useCreateMemo, getEntityByName, createEntityDirect } from '@/app/lib/queries'
import { useAuth } from '@/app/providers/AuthProvider'
import { useEntityFilter } from '@/app/providers/EntityFilterProvider'
import { useAIUpdate } from '@/app/providers/AIUpdateProvider'
import type { Database } from '@/types/supabase'

type Entity = Database['public']['Tables']['entity']['Row']

/**
 * 현재 커서 위치의 멘션 컨텍스트
 */
interface MentionContext {
  search: string      // @ 뒤의 검색어
  startPos: number    // @ 시작 위치
  endPos: number      // 검색어 끝 위치
}

/**
 * Entity type에 따른 색깔 클래스 반환
 */
function getEntityTypeColorForInput(type: string | null | undefined): string {
  switch (type) {
    case 'person':
      return 'text-mention-person bg-mention-person'
    case 'project':
      return 'text-mention-project bg-mention-project'
    case 'unknown':
    case null:
    case undefined:
      return 'text-gray-400 bg-gray-400'
    default:
      return 'text-gray-400 bg-gray-400'
  }
}

/**
 * 현재 커서 위치의 @mention 컨텍스트를 파싱
 *
 * @returns MentionContext | null
 *   - null: 멘션 중이 아님 (@ 없거나 이미 확정됨)
 *   - MentionContext: 현재 멘션 입력 중
 */
function parseCurrentMention(content: string): MentionContext | null {
  if (!content) return null

  // 마지막 @ 찾기
  const lastAtIndex = content.lastIndexOf('@')
  if (lastAtIndex === -1) return null

  // @ 뒤의 텍스트
  const afterAt = content.slice(lastAtIndex + 1)

  // 스페이스가 있으면 이미 확정된 것
  const spaceIndex = afterAt.indexOf(' ')
  if (spaceIndex !== -1) return null

  // 유효한 entity 이름 패턴인지 확인
  if (!/^[가-힣a-zA-Z0-9]*$/.test(afterAt)) return null

  return {
    search: afterAt,
    startPos: lastAtIndex,
    endPos: lastAtIndex + 1 + afterAt.length,
  }
}

/**
 * content에서 확정된 @entity들을 추출
 */
function extractConfirmedEntities(content: string): string[] {
  const pattern = /@([가-힣a-zA-Z0-9]+)(?:\s|$)/g
  const matches = [...content.matchAll(pattern)]
  return matches.map((match) => match[1])
}

/**
 * content에 @entity를 확정 (스페이스 추가)
 */
function confirmMentionInContent(
  content: string,
  mentionContext: MentionContext,
  entityName: string
): string {
  const before = content.slice(0, mentionContext.startPos)
  const after = content.slice(mentionContext.endPos)
  return `${before}@${entityName} ${after}`
}

export default function InputArea() {
  // ============ State ============
  const [content, setContent] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLDivElement>(null)

  // ============ Hooks ============
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { data: entities = [] as Entity[] } = useEntities(user?.id)
  const createMemo = useCreateMemo(user?.id || '')
  const { setFilteredEntityIds } = useEntityFilter()
  const { addUpdatingEntity, removeUpdatingEntity } = useAIUpdate()

  // ============ Derived State ============
  // 현재 멘션 컨텍스트 (드롭다운 표시 여부 결정)
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

  // 확정된 entity들 (필터링에 사용)
  const confirmedEntityNames = extractConfirmedEntities(content)

  // ============ Effects ============
  // 확정된 entity들을 필터에 반영
  React.useEffect(() => {
    if (!user?.id) {
      setFilteredEntityIds([])
      return
    }

    if (confirmedEntityNames.length === 0) {
      setFilteredEntityIds([])
      return
    }

    // Entity IDs 찾기
    const findEntityIds = async () => {
      const entityIds: string[] = []

      for (const name of confirmedEntityNames) {
        // 캐시에서 찾기
        const cachedEntity = entities.find((e) => e.name === name)
        if (cachedEntity) {
          entityIds.push(cachedEntity.id)
        } else {
          // DB 조회
          try {
            const entity = await getEntityByName(name, user.id)
            if (entity) {
              entityIds.push(entity.id)
            }
          } catch (error) {
            console.error(`Entity 조회 실패: ${name}`, error)
          }
        }
      }

      setFilteredEntityIds(entityIds)
    }

    findEntityIds()
  }, [confirmedEntityNames.join(','), user?.id, entities, setFilteredEntityIds])

  // selectedIndex 초기화 (드롭다운이 열릴 때마다)
  React.useEffect(() => {
    if (isDropdownOpen) {
      setSelectedIndex(0)
    }
  }, [isDropdownOpen])

  // ============ Event Handlers ============

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

    // Escape: 드롭다운 닫기 (멘션 취소)
    if (e.key === 'Escape' && mentionContext) {
      e.preventDefault()
      // @ 이후 삭제
      const newContent = content.slice(0, mentionContext.startPos)
      setContent(newContent)
      if (inputRef.current) {
        inputRef.current.innerText = newContent
      }
      return
    }

    // Tab/Space: 현재 멘션 확정
    if ((e.key === 'Tab' || e.key === ' ') && mentionContext) {
      e.preventDefault()

      // 매칭되는 entity 찾기
      let entityToConfirm: Entity | null = null

      if (filteredEntities.length > 0) {
        // 드롭다운에 매칭이 있으면 선택된 것 사용
        entityToConfirm = filteredEntities[selectedIndex] || filteredEntities[0]
      }

      confirmMention(mentionContext, entityToConfirm)
      return
    }

    // 드롭다운이 열려있을 때만 화살표 키 처리
    if (isDropdownOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < filteredEntities.length - 1 ? prev + 1 : prev
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const entityToConfirm = filteredEntities[selectedIndex] || null
        confirmMention(mentionContext!, entityToConfirm)
      }
    }
  }

  /**
   * 멘션 확정 처리
   */
  const confirmMention = async (
    mentionContext: MentionContext,
    entity: Entity | null
  ) => {
    console.log('🎯 [confirmMention]', {
      search: mentionContext.search,
      entity: entity?.name,
    })

    const entityName = entity?.name || mentionContext.search

    // 새 entity면 즉시 생성
    if (!entity && entityName && user?.id) {
      try {
        const existing = await getEntityByName(entityName, user.id)
        if (!existing) {
          await createEntityDirect(entityName, user.id)
          queryClient.invalidateQueries({ queryKey: ['entities'] })
          console.log(`✅ 새 Entity 생성: ${entityName}`)
        }
      } catch (error) {
        console.error(`❌ Entity 생성 실패: ${entityName}`, error)
      }
    }

    // content 업데이트
    const newContent = confirmMentionInContent(content, mentionContext, entityName)
    setContent(newContent)

    // DOM 업데이트
    if (inputRef.current) {
      inputRef.current.innerText = newContent

      // 커서를 확정된 entity 뒤로 이동
      const cursorPos = mentionContext.startPos + 1 + entityName.length + 1
      setCursorPosition(inputRef.current, cursorPos)
    }

    console.log('✅ 멘션 확정 완료')
  }

  /**
   * 커서 위치 설정
   */
  const setCursorPosition = (element: HTMLElement, position: number) => {
    const selection = window.getSelection()
    const range = document.createRange()

    let currentPos = 0
    let found = false

    const walk = (node: Node) => {
      if (found) return

      if (node.nodeType === Node.TEXT_NODE) {
        const textLength = node.textContent?.length || 0
        if (currentPos + textLength >= position) {
          const offset = position - currentPos
          try {
            range.setStart(node, offset)
            range.collapse(true)
            selection?.removeAllRanges()
            selection?.addRange(range)
            found = true
          } catch (e) {
            console.error('커서 설정 실패:', e)
          }
          return
        }
        currentPos += textLength
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.nodeName === 'BR') {
          currentPos += 1
        }
        node.childNodes.forEach(walk)
      }
    }

    walk(element)

    if (!found) {
      range.selectNodeContents(element)
      range.collapse(false)
      selection?.removeAllRanges()
      selection?.addRange(range)
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
          if (inputRef.current) {
            inputRef.current.innerText = ''
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

        {/* Text input area */}
        <div className="relative mb-3">
          {/* Highlighted overlay */}
          <div
            className="absolute inset-0 min-h-[80px] text-white pointer-events-none whitespace-pre-wrap break-words"
            style={{ color: 'transparent' }}
          >
            {content.split(/(@[가-힣a-zA-Z0-9]+)/g).map((part, index) => {
              if (part.match(/^@[가-힣a-zA-Z0-9]+$/)) {
                const entityName = part.substring(1)
                const entity = entities.find((e) => e.name === entityName)
                const colorClass = getEntityTypeColorForInput(entity?.type)

                return (
                  <span
                    key={index}
                    className={`${colorClass}/30 ${colorClass} rounded px-0.5`}
                  >
                    {part}
                  </span>
                )
              }
              return <span key={index}>{part}</span>
            })}
          </div>

          {/* Actual input */}
          <div
            ref={inputRef}
            contentEditable
            className="relative min-h-[80px] text-white outline-none bg-transparent"
            onInput={(e) => {
              const text = e.currentTarget.innerText || ''
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
