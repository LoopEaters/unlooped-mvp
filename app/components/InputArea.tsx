'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import EntityDropdown from './EntityDropdown'
import { useEntities, useCreateMemo, getEntityByName } from '@/app/lib/queries'
import { useAuth } from '@/app/providers/AuthProvider'
import { useEntityFilter } from '@/app/providers/EntityFilterProvider'
import { useAIUpdate } from '@/app/providers/AIUpdateProvider'
import type { Database } from '@/types/supabase'

type Entity = Database['public']['Tables']['entity']['Row']

/**
 * Entity type에 따른 색깔 클래스 반환 (InputArea용)
 */
function getEntityTypeColorForInput(type: string | null | undefined): string {
  switch (type) {
    case 'person':
      return 'text-mention-person bg-mention-person' // 초록
    case 'project':
      return 'text-mention-project bg-mention-project' // 보라
    case 'unknown':
    case null:
    case undefined:
      return 'text-text-muted bg-text-muted' // 회색 (분류 전/실패)
    default:
      return 'text-text-muted bg-text-muted'
  }
}

export default function InputArea() {
  const [content, setContent] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [currentEntitySearch, setCurrentEntitySearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLDivElement>(null)

  const { user } = useAuth()
  const { data: entities = [] as Entity[] } = useEntities(user?.id)
  const createMemo = useCreateMemo(user?.id || '')
  const { setFilteredEntityIds } = useEntityFilter()
  const { addUpdatingEntity, removeUpdatingEntity } = useAIUpdate()

  // 현재 멘션된 entity를 추출하여 필터 Context에 설정
  useEffect(() => {
    const updateFilteredEntities = async () => {
      console.log('🔍 [updateFilteredEntities] 시작', { content, userId: user?.id })

      if (!user?.id) {
        console.log('→ user.id 없음, 필터 초기화')
        setFilteredEntityIds([])
        return
      }

      // content가 비어있으면 필터를 유지 (초기화하지 않음)
      if (!content) {
        console.log('→ content 비어있음, 기존 필터 유지')
        return
      }

      // 드롭다운이 열려있으면 실행하지 않음 (타이핑 중)
      if (isDropdownOpen) {
        console.log('→ 드롭다운 열림 (타이핑 중), 스킵')
        return
      }

      // 정규표현식으로 확정된 @entity 패턴만 추출 (스페이스가 뒤따라야 함)
      const entityPattern = /@([가-힣a-zA-Z0-9]+)\s/g
      const matches = [...content.matchAll(entityPattern)]
      const entityNames = matches.map((match) => match[1])

      console.log('→ 추출된 entity 이름들 (스페이스 있는 것만):', entityNames)

      // entity가 없으면 아무것도 하지 않음 (기존 필터 유지)
      if (entityNames.length === 0) {
        console.log('→ entity 없음, 기존 필터 유지')
        return
      }

      // 캐시된 entities에서 먼저 찾기 (DB 조회 최소화)
      const newEntityIds: string[] = []
      for (const name of entityNames) {
        const cachedEntity = Array.isArray(entities) ? entities.find((e) => e.name === name) : undefined
        if (cachedEntity) {
          console.log(`  ✅ 캐시에서 찾음: ${cachedEntity.name} (${cachedEntity.id})`)
          newEntityIds.push(cachedEntity.id)
        } else {
          console.log(`  🔎 DB 조회: ${name}`)
          try {
            const entity = await getEntityByName(name, user.id)
            if (entity) {
              console.log(`  ✅ DB에서 찾음: ${entity.name} (${entity.id})`)
              newEntityIds.push(entity.id)
            } else {
              console.log(`  ❌ 못찾음: ${name}`)
            }
          } catch (error) {
            console.error(`  ❌ 에러: ${name}`, error)
          }
        }
      }

      console.log('→ 새 entityIds:', newEntityIds)
      setFilteredEntityIds(newEntityIds)
    }

    updateFilteredEntities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, user?.id]) // setFilteredEntityIds, isDropdownOpen, entities는 안정적이거나 불필요

  // @ 감지 및 드롭다운 표시
  useEffect(() => {
    console.log('🔄 [useEffect] content 변경:', { content })

    if (!content) {
      console.log('→ content 비어있음, 드롭다운 닫기')
      setIsDropdownOpen(false)
      setCurrentEntitySearch('')
      return
    }

    // 커서 위치의 @entity 패턴 찾기
    const lastAtIndex = content.lastIndexOf('@')
    if (lastAtIndex === -1) {
      console.log('→ @ 없음, 드롭다운 닫기')
      setIsDropdownOpen(false)
      setCurrentEntitySearch('')
      return
    }

    // @ 뒤의 텍스트 추출 (스페이스 전까지)
    const afterAt = content.slice(lastAtIndex + 1)
    const spaceIndex = afterAt.indexOf(' ')
    const entitySearch = spaceIndex === -1 ? afterAt : afterAt.slice(0, spaceIndex)

    console.log('→ @ 감지:', {
      lastAtIndex,
      afterAt,
      spaceIndex,
      entitySearch,
    })

    // 중요: 스페이스가 있으면 무조건 드롭다운 닫기 (우선순위 높음)
    if (spaceIndex !== -1) {
      console.log('→ 스페이스 발견, 드롭다운 닫기')
      setIsDropdownOpen(false)
      setCurrentEntitySearch('')
    } else if (entitySearch && /^[가-힣a-zA-Z0-9]*$/.test(entitySearch)) {
      // 스페이스가 없고, 유효한 entity 검색어가 있으면 드롭다운 열기
      console.log('✅ 드롭다운 열기:', entitySearch)
      setCurrentEntitySearch(entitySearch)
      setIsDropdownOpen(true)
      setSelectedIndex(0)
    }
  }, [content, user?.id]) // setState 함수들은 안정적이므로 dependency에서 제거

  // 키보드 이벤트 처리
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    console.log('🔑 [handleKeyDown]', {
      key: e.key,
      isDropdownOpen,
      currentEntitySearch,
      contentLength: content.length,
    })

    // Ctrl+Enter로 메모 저장
    if (e.key === 'Enter' && e.ctrlKey) {
      console.log('✅ Ctrl+Enter 감지 → 메모 저장')
      e.preventDefault()
      handleSubmit()
      return
    }

    if (isDropdownOpen && Array.isArray(entities)) {
      console.log('📋 드롭다운 열림 상태')
      const filteredEntities = entities
        .filter((entity) =>
          entity.name.toLowerCase().startsWith(currentEntitySearch.toLowerCase())
        )
        .slice(0, 5)

      console.log('🔍 필터된 entities:', {
        count: filteredEntities.length,
        entities: filteredEntities.map((e) => e.name),
        selectedIndex,
      })

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < filteredEntities.length - 1 ? prev + 1 : prev
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
      } else if (e.key === 'Enter' || e.key === 'Tab' || e.key === ' ') {
        console.log('✅ Enter/Tab/Space 감지')
        e.preventDefault()
        if (filteredEntities.length > 0) {
          console.log(
            '→ 기존 entity 선택:',
            filteredEntities[selectedIndex]?.name
          )
          handleEntitySelect(filteredEntities[selectedIndex])
        } else {
          console.log('→ 새 entity 생성:', currentEntitySearch)
          // 매칭 없으면 새 entity로 확정
          handleEntitySelect(null)
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setIsDropdownOpen(false)
      }
    } else {
      console.log('📋 드롭다운 닫힘 상태')
      // 드롭다운이 닫혔을 때는 일반 입력
      // Enter는 줄바꿈, Shift+Enter도 줄바꿈
      // Ctrl+Enter만 저장 (위에서 처리됨)
    }
  }

  // Entity 선택 처리
  const handleEntitySelect = (entity: Pick<Entity, 'id' | 'name'> | null) => {
    console.log('🎯 [handleEntitySelect] 시작', {
      entity: entity?.name,
      currentEntitySearch,
    })

    if (!inputRef.current) {
      console.log('❌ inputRef 없음')
      return
    }

    // 현재 DOM의 실제 content 사용 (innerText로 줄바꿈 포함)
    const currentContent = inputRef.current.innerText || ''
    const lastAtIndex = currentContent.lastIndexOf('@')

    if (lastAtIndex === -1) {
      console.log('❌ @ 없음, 중단')
      return
    }

    // @ 이전 텍스트
    const beforeAt = currentContent.slice(0, lastAtIndex)

    // @ 이후 텍스트에서 현재 entity 검색어 부분을 찾음
    const afterAt = currentContent.slice(lastAtIndex + 1)
    const spaceIndex = afterAt.indexOf(' ')

    // @ 이후의 실제 텍스트 (entity 이후)
    const afterEntity = spaceIndex === -1 ? '' : afterAt.slice(spaceIndex).trimStart()

    // entity 이름으로 교체 (선택된 entity 또는 입력한 텍스트)
    const entityName = entity ? entity.name : currentEntitySearch

    // 새 content: before + @ + entityName + space + after
    const newContent = beforeAt + '@' + entityName + ' ' + afterEntity

    console.log('✏️ Content 계산:', {
      currentContent,
      beforeAt,
      entityName,
      afterEntity,
      newContent,
    })

    // 1. DOM 먼저 업데이트 (innerText로)
    inputRef.current.innerText = newContent

    // 2. 커서 위치 설정 (텍스트 전체 오프셋 기반)
    const cursorPos = beforeAt.length + 1 + entityName.length + 1 // before + @ + name + space

    console.log('📍 커서 설정 시도:', { cursorPos, newContentLength: newContent.length })

    // 모든 텍스트 노드를 순회하면서 정확한 위치 찾기
    const setCursorPosition = (element: HTMLElement, position: number) => {
      const selection = window.getSelection()
      const range = document.createRange()

      let currentPos = 0
      let found = false

      // 모든 자식 노드를 순회
      const walk = (node: Node) => {
        if (found) return

        if (node.nodeType === Node.TEXT_NODE) {
          const textLength = node.textContent?.length || 0

          if (currentPos + textLength >= position) {
            // 이 노드에 커서가 위치해야 함
            const offset = position - currentPos
            try {
              range.setStart(node, offset)
              range.collapse(true)
              selection?.removeAllRanges()
              selection?.addRange(range)
              found = true
              console.log('✅ 커서 설정 성공:', { node: node.textContent, offset })
            } catch (e) {
              console.error('❌ 커서 설정 실패:', e)
            }
            return
          }

          currentPos += textLength
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // <br> 태그는 줄바꿈으로 카운트
          if (node.nodeName === 'BR') {
            currentPos += 1
            if (currentPos > position && !found) {
              // BR 직전에 위치
              try {
                range.setStartBefore(node)
                range.collapse(true)
                selection?.removeAllRanges()
                selection?.addRange(range)
                found = true
                console.log('✅ 커서 설정 성공 (BR 앞)')
              } catch (e) {
                console.error('❌ 커서 설정 실패:', e)
              }
              return
            }
          }

          // 자식 노드들을 순회
          node.childNodes.forEach(walk)
        }
      }

      walk(element)

      // 위치를 못 찾았으면 맨 끝에 배치
      if (!found) {
        console.log('⚠️ 위치 못 찾음, 맨 끝으로 이동')
        range.selectNodeContents(element)
        range.collapse(false)
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
    }

    setCursorPosition(inputRef.current, cursorPos)

    // 3. state 업데이트 (비동기) - DOM과 동기화
    setContent(newContent)

    // 4. 드롭다운 상태 초기화
    setIsDropdownOpen(false)
    setCurrentEntitySearch('')

    console.log('✅ Entity 선택 완료')
  }

  // 메모 제출
  const handleSubmit = () => {
    console.log('💾 [handleSubmit] 시작', { content })

    if (!content.trim()) {
      console.log('❌ content 비어있음, 중단')
      return
    }

    // 정규표현식으로 @entity 패턴 추출 (모든 @entity, 스페이스 여부 무관)
    const entityPattern = /@([가-힣a-zA-Z0-9]+)/g
    const matches = [...content.matchAll(entityPattern)]
    const entityNames = matches.map((match) => match[1])

    console.log('→ 추출된 entityNames:', entityNames)
    console.log('→ createMemo.mutate 호출')

    createMemo.mutate(
      {
        content,
        entityNames,
        onAIUpdateStart: (entityIds: string[]) => {
          console.log('🤖 AI 업데이트 시작:', entityIds)
          // 모든 entity를 업데이트 중 상태로 설정
          entityIds.forEach((id) => addUpdatingEntity(id))

          // 업데이트 완료 후 상태 제거 (3초 후 자동 제거)
          setTimeout(() => {
            entityIds.forEach((id) => removeUpdatingEntity(id))
          }, 5000)
        },
      },
      {
        onSuccess: () => {
          console.log('✅ 메모 저장 성공')
          // Input 초기화
          setContent('')
          if (inputRef.current) {
            inputRef.current.innerText = ''
          }
        },
        onError: (error) => {
          console.error('❌ 메모 저장 실패:', error)
        },
      }
    )
  }

  return (
    <div className="border-t border-border-main p-4 bg-bg-primary">
      <div className="bg-bg-card rounded-lg p-4 relative">
        {/* Entity 자동완성 드롭다운 */}
        <EntityDropdown
          search={currentEntitySearch}
          entities={entities as Entity[]}
          selectedIndex={selectedIndex}
          onSelect={handleEntitySelect}
          isOpen={isDropdownOpen}
        />

        {/* Text input area with @mention support */}
        <div className="relative mb-3">
          {/* Highlighted overlay (behind the input) */}
          <div
            className="absolute inset-0 min-h-[80px] text-white pointer-events-none whitespace-pre-wrap break-words"
            style={{ color: 'transparent' }}
          >
            {content.split(/(@[가-힣a-zA-Z0-9]+)/g).map((part, index) => {
              if (part.match(/^@[가-힣a-zA-Z0-9]+$/)) {
                // @제외하고 Entity 이름 추출
                const entityName = part.substring(1)
                // Entity 조회
                const entity = (entities as Entity[]).find(e => e.name === entityName)
                // Entity type에 따른 색깔 클래스 결정
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

          {/* Actual input (on top) */}
          <div
            ref={inputRef}
            contentEditable
            className="relative min-h-[80px] text-white outline-none bg-transparent"
            onInput={(e) => {
              // innerText를 사용하여 줄바꿈을 \n으로 정확하게 가져옴
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
            Ctrl+Enter로 저장
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
