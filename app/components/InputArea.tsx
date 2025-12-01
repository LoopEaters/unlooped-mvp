'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import EntityDropdown from './EntityDropdown'
import { useEntities, useCreateMemo, getEntityByName } from '@/app/lib/queries'
import { useAuth } from '@/app/providers/AuthProvider'
import { useEntityFilter } from '@/app/providers/EntityFilterProvider'
import type { Database } from '@/types/supabase'

type Entity = Database['public']['Tables']['entity']['Row']

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

  // 현재 멘션된 entity를 추출하여 필터 Context에 설정
  useEffect(() => {
    const updateFilteredEntities = async () => {
      if (!content || !user?.id) {
        setFilteredEntityIds([])
        return
      }

      // 정규표현식으로 @entity 패턴 추출
      const entityPattern = /@([가-힣a-zA-Z0-9]+)/g
      const matches = [...content.matchAll(entityPattern)]
      const entityNames = matches.map((match) => match[1])

      if (entityNames.length === 0) {
        setFilteredEntityIds([])
        return
      }

      // 각 entity 이름으로 ID 조회
      const entityIds: string[] = []
      for (const name of entityNames) {
        const entity = await getEntityByName(name, user.id)
        if (entity) {
          entityIds.push(entity.id)
        }
      }

      setFilteredEntityIds(entityIds)
    }

    updateFilteredEntities()
  }, [content, user?.id, setFilteredEntityIds])

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

    // @ 바로 뒤에 스페이스가 없고, 유효한 문자만 있으면 드롭다운 표시
    if (entitySearch && /^[가-힣a-zA-Z0-9]*$/.test(entitySearch)) {
      console.log('✅ 드롭다운 열기:', entitySearch)
      setCurrentEntitySearch(entitySearch)
      setIsDropdownOpen(true)
      setSelectedIndex(0)
    } else if (spaceIndex !== -1) {
      console.log('→ 스페이스 발견, 드롭다운 닫기')
      setIsDropdownOpen(false)
      setCurrentEntitySearch('')
    }
  }, [content, setFilteredEntityIds, user?.id])

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
      // 드롭다운이 닫혔을 때 Tab/Enter로 메모 저장
      if ((e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) && content.trim()) {
        console.log('✅ Tab/Enter 감지 → 메모 저장')
        e.preventDefault()
        handleSubmit()
      }
    }
  }

  // Entity 선택 처리
  const handleEntitySelect = (entity: Pick<Entity, 'id' | 'name'> | null) => {
    console.log('🎯 [handleEntitySelect]', {
      entity: entity?.name,
      currentEntitySearch,
      content,
    })

    const lastAtIndex = content.lastIndexOf('@')
    if (lastAtIndex === -1) {
      console.log('❌ @ 없음, 중단')
      return
    }

    const beforeAt = content.slice(0, lastAtIndex + 1)
    const afterAt = content.slice(lastAtIndex + 1)
    const spaceIndex = afterAt.indexOf(' ')
    // 스페이스 이후의 실제 텍스트만 가져오기 (앞의 스페이스 제거)
    const afterEntity = spaceIndex === -1 ? '' : afterAt.slice(spaceIndex + 1).trimStart()

    // entity 이름으로 교체 (기존 entity 또는 입력한 텍스트)
    const entityName = entity ? entity.name : currentEntitySearch
    const newContent = beforeAt + entityName + ' ' + afterEntity

    console.log('✏️ Content 업데이트:', {
      before: content,
      after: newContent,
      entityName,
    })

    setContent(newContent)
    setIsDropdownOpen(false)
    setCurrentEntitySearch('')

    // Input에 포커스 유지 및 커서 위치 설정
    if (inputRef.current) {
      inputRef.current.textContent = newContent
      // 커서를 entity 뒤로 이동
      const range = document.createRange()
      const selection = window.getSelection()
      const textNode = inputRef.current.firstChild
      if (textNode) {
        const cursorPos = beforeAt.length + entityName.length + 1
        console.log('📍 커서 위치:', cursorPos)
        range.setStart(textNode, Math.min(cursorPos, textNode.textContent?.length || 0))
        range.collapse(true)
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
    }

    console.log('✅ Entity 선택 완료')
  }

  // 메모 제출
  const handleSubmit = () => {
    if (!content.trim()) return

    // 정규표현식으로 @entity 패턴 추출
    const entityPattern = /@([가-힣a-zA-Z0-9]+)/g
    const matches = [...content.matchAll(entityPattern)]
    const entityNames = matches.map((match) => match[1])

    createMemo.mutate(
      { content, entityNames },
      {
        onSuccess: () => {
          // Input 초기화
          setContent('')
          if (inputRef.current) {
            inputRef.current.textContent = ''
          }
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
                return (
                  <span
                    key={index}
                    className="bg-mention-project/30 text-mention-project rounded px-0.5"
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
            onInput={(e) => setContent(e.currentTarget.textContent || '')}
            onKeyDown={handleKeyDown}
            data-placeholder="메모를 작성하세요... (@로 엔티티 추가)"
            suppressContentEditableWarning
          />
        </div>

        {/* Submit button */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-text-muted">
            Ctrl+Enter 또는 Tab으로 저장
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
