'use client'

import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useEntities, useCreateMemo, useUpdateEntityType } from '@/app/lib/queries'
import { useAuth } from '@/app/providers/AuthProvider'
import { useAIUpdate } from '@/app/providers/AIUpdateProvider'
import { useEntityFilter } from '@/app/providers/EntityFilterProvider'
import { mentionSuggestionOptions } from './tiptap/suggestion'
import { CustomMention } from './tiptap/CustomMention'
import type { Database } from '@/types/supabase'

type Entity = Database['public']['Tables']['entity']['Row']

interface UseTiptapEditorOptions {
  onSubmitCallback?: () => void
}

/**
 * Tiptap 에디터 훅
 * - Mention 기능 (@entity)
 * - Entity type 자동 분류
 * - Ctrl+Enter 저장
 */
export function useTiptapEditor(options: UseTiptapEditorOptions = {}) {
  const { onSubmitCallback } = options
  const { user } = useAuth()
  const { data: entities = [] as Entity[] } = useEntities(user?.id)
  const createMemo = useCreateMemo(user?.id || '')
  const updateEntityType = useUpdateEntityType()
  const { addUpdatingEntity, removeUpdatingEntity } = useAIUpdate()
  const { setFilteredEntityIds } = useEntityFilter()

  // Entity type 분류 상태
  const [pendingEntityTypes, setPendingEntityTypes] = useState<Record<string, string>>({})
  const [classifyingEntities, setClassifyingEntities] = useState<Set<string>>(new Set())

  // 🔧 FIX: entities를 ref로 관리하여 suggestion items가 최신 entities를 참조하도록
  const entitiesRef = useRef<Entity[]>([])
  const userRef = useRef(user)
  const previousMentionsRef = useRef<Set<string>>(new Set())

  // 🔧 CRITICAL: entities가 업데이트될 때 ref도 업데이트 + 로그
  useEffect(() => {
    console.log('🔄 [entitiesRef 업데이트]', {
      이전: entitiesRef.current.length,
      새로운값: entities.length,
      entities: entities.map((e) => e.name),
    })
    entitiesRef.current = entities
  }, [entities])

  useEffect(() => {
    userRef.current = user
  }, [user])

  /**
   * AI를 통해 entity type 분류 (백그라운드)
   */
  const classifyEntityType = useCallback(async (entityName: string) => {
    console.log('🤖 [classifyEntityType] 시작:', entityName)

    // 이미 존재하는 entity면 건너뜀
    if (entitiesRef.current.find((e) => e.name === entityName)) {
      console.log('⏭️ [classifyEntityType] 이미 존재하는 entity, 건너뜀')
      return
    }

    // 이미 분류 중이면 건너뜀
    setClassifyingEntities((prev) => {
      if (prev.has(entityName)) {
        console.log('⏭️ [classifyEntityType] 이미 분류 중, 건너뜀')
        return prev
      }
      const next = new Set(prev)
      next.add(entityName)
      return next
    })

    try {
      const response = await fetch('/api/entity/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityName }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ [classifyEntityType] 분류 완료:', entityName, '→', result.type)
        setPendingEntityTypes((prev) => ({
          ...prev,
          [entityName]: result.type,
        }))
      }
    } catch (error) {
      console.error('❌ [classifyEntityType] AI 분류 실패:', entityName, error)
    } finally {
      // 로딩 종료
      setClassifyingEntities((prev) => {
        const next = new Set(prev)
        next.delete(entityName)
        return next
      })
    }
  }, [])

  /**
   * 에디터에서 확정된 entity 추출
   */
  const extractConfirmedEntities = useCallback((editor: any): string[] => {
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
    return [...new Set(entityNames)] // 중복 제거
  }, [])

  // 🔧 FIX: suggestion 설정을 useMemo로 밖으로 빼서 ref 참조 보장
  const suggestionConfig = useMemo(() => {
    return {
      ...mentionSuggestionOptions,
      // items 함수는 매번 실행될 때마다 entitiesRef.current를 참조
      items: ({ query }: { query: string }) => {
        const currentEntities = entitiesRef.current
        const currentUser = userRef.current

        console.log('🔍 [Suggestion] query:', query, 'entities count:', currentEntities.length, 'ref:', entitiesRef.current.slice(0, 3).map((e) => e.name))

        if (!query) return []

        // @ 뒤 검색어로 필터링
        const filtered = currentEntities
          .filter((entity) =>
            entity.name.toLowerCase().startsWith(query.toLowerCase())
          )
          .slice(0, 5)

        console.log('🔍 [Suggestion] filtered:', filtered.length)

        // 필터링 결과가 없으면 "새 entity 생성" 옵션 추가
        if (filtered.length === 0) {
          return [
            {
              id: `new-${query}`,
              name: query,
              type: null,
              description: null,
              summary: null,
              start_date: null,
              user_id: currentUser?.id || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as Entity,
          ]
        }

        return filtered
      },
      // 🔧 NEW: mention 선택 시 pendingEntityTypes 확인하여 type 포함
      command: ({ editor, range, props }: any) => {
        const entityName = props.id || props.name
        // pendingEntityTypes에서 type 확인
        const pendingType = pendingEntityTypes[entityName]
        const finalType = props.type || pendingType || null

        console.log('✅ [Mention command]', { entityName, propsType: props.type, pendingType, finalType })

        editor
          .chain()
          .focus()
          .insertContentAt(range, [
            {
              type: 'mention',
              attrs: {
                id: entityName,
                label: entityName,
                type: finalType,
              },
            },
            {
              type: 'text',
              text: ' ',
            },
          ])
          .run()
      },
    }
    // 🔧 FIX: pendingEntityTypes도 참조해야 함
  }, [pendingEntityTypes])

  // Tiptap 에디터 생성
  const editor = useEditor({
    immediatelyRender: false, // SSR 지원을 위한 설정
    extensions: [
      StarterKit.configure({
        // Enter는 줄바꿈만 (저장은 Ctrl+Enter)
        // 기본 설정 유지
      }),
      Placeholder.configure({
        placeholder: '메모를 작성하세요... (@로 엔티티 추가)',
      }),
      CustomMention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: suggestionConfig,
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class:
          'text-white outline-none bg-transparent whitespace-pre-wrap break-words overflow-wrap-anywhere p-0',
        style: 'word-break: break-word',
      },
    },
  })

  // 🔧 FIX: 에디터 내용이 변경될 때 entity 필터 업데이트 + 새 mention 감지
  useEffect(() => {
    if (!editor || !user?.id) {
      setFilteredEntityIds([])
      return
    }

    const updateFilter = () => {
      const confirmedEntityNames = extractConfirmedEntities(editor)

      // 🔧 NEW: 새로 추가된 mention 감지하여 classifyEntityType 호출
      const currentMentions = new Set(confirmedEntityNames)
      const newMentions = confirmedEntityNames.filter(
        (name) => !previousMentionsRef.current.has(name)
      )

      if (newMentions.length > 0) {
        console.log('🆕 [새 mention 감지]:', newMentions)
        newMentions.forEach((entityName) => {
          // 기존 entity가 아니면 type 분류 시작
          const existingEntity = entitiesRef.current.find((e) => e.name === entityName)
          if (!existingEntity) {
            console.log('🚀 [새 entity 분류 시작]:', entityName)
            classifyEntityType(entityName)
          }
        })
      }

      previousMentionsRef.current = currentMentions

      // Entity 필터 업데이트
      if (confirmedEntityNames.length === 0) {
        setFilteredEntityIds([])
        return
      }

      const entityIds = confirmedEntityNames
        .map((name) => entitiesRef.current.find((e) => e.name === name)?.id)
        .filter((id): id is string => id !== undefined)

      setFilteredEntityIds(entityIds)
    }

    // 에디터 업데이트 이벤트 구독
    editor.on('update', updateFilter)

    return () => {
      editor.off('update', updateFilter)
    }
    // 🔧 FIX: dependency를 최소화하여 무한 렌더링 방지
  }, [editor, user?.id, extractConfirmedEntities, setFilteredEntityIds, classifyEntityType])

  /**
   * 메모 저장
   */
  const handleSubmit = useCallback(() => {
    if (!editor || !user?.id) return

    const content = editor.getText()
    if (!content.trim()) return

    const confirmedEntityNames = extractConfirmedEntities(editor)

    createMemo.mutate(
      {
        content,
        entityNames: confirmedEntityNames,
        pendingEntityTypes,
        onAIUpdateStart: (entityIds: string[]) => {
          entityIds.forEach((id) => addUpdatingEntity(id))
          setTimeout(() => {
            entityIds.forEach((id) => removeUpdatingEntity(id))
          }, 5000)
        },
      },
      {
        onSuccess: () => {
          editor.commands.clearContent()
          setPendingEntityTypes({})
          setClassifyingEntities(new Set())
          previousMentionsRef.current.clear() // 🔧 NEW: mention tracking 초기화
          onSubmitCallback?.()
        },
        onError: (error) => {
          console.error('메모 저장 실패:', error)
        },
      }
    )
  }, [
    editor,
    user?.id,
    pendingEntityTypes,
    createMemo,
    addUpdatingEntity,
    removeUpdatingEntity,
    onSubmitCallback,
    extractConfirmedEntities,
  ])

  // 🔧 NEW: pendingEntityTypes + classifyingEntities 변경 시 동적으로 CSS 스타일 주입
  useEffect(() => {
    if (!editor) return

    // 기존 style 태그 제거
    const existingStyle = document.getElementById('pending-entity-styles')
    if (existingStyle) {
      existingStyle.remove()
    }

    const style = document.createElement('style')
    style.id = 'pending-entity-styles'
    let css = ''

    // 🎨 분류 중인 entity: 회색 펄스 애니메이션
    classifyingEntities.forEach((entityName) => {
      const escapedName = entityName.replace(/"/g, '\\"')
      css += `
        .tiptap-editor .ProseMirror span[data-type="mention"][data-id="${escapedName}"] {
          background-color: rgba(156, 163, 175, 0.2) !important;
          color: rgb(156, 163, 175) !important;
          animation: pulse-opacity 1.5s infinite ease-in-out !important;
        }
      `
    })

    // 🎨 분류 완료된 entity: 확정된 색깔
    Object.entries(pendingEntityTypes).forEach(([entityName, type]) => {
      // 분류 중이 아닌 것만 (분류 중이면 위의 스타일이 우선)
      if (classifyingEntities.has(entityName)) return

      const escapedName = entityName.replace(/"/g, '\\"')

      if (type === 'person') {
        css += `
          .tiptap-editor .ProseMirror span[data-type="mention"][data-id="${escapedName}"] {
            background-color: rgba(34, 197, 94, 0.2) !important;
            color: rgb(34, 197, 94) !important;
          }
        `
      } else if (type === 'project') {
        css += `
          .tiptap-editor .ProseMirror span[data-type="mention"][data-id="${escapedName}"] {
            background-color: rgba(168, 85, 247, 0.2) !important;
            color: rgb(168, 85, 247) !important;
          }
        `
      } else if (type === 'event') {
        css += `
          .tiptap-editor .ProseMirror span[data-type="mention"][data-id="${escapedName}"] {
            background-color: rgba(249, 115, 22, 0.2) !important;
            color: rgb(249, 115, 22) !important;
          }
        `
      } else if (type === 'unknown') {
        css += `
          .tiptap-editor .ProseMirror span[data-type="mention"][data-id="${escapedName}"] {
            background-color: rgba(107, 114, 128, 0.2) !important;
            color: rgb(107, 114, 128) !important;
            border: 2px solid rgb(107, 114, 128) !important;
            padding: 1px 5px !important;
            animation: pulse-border 2s infinite ease-in-out !important;
            font-weight: 500 !important;
            cursor: pointer !important;
          }
          .tiptap-editor .ProseMirror span[data-type="mention"][data-id="${escapedName}"]:hover {
            background-color: rgba(107, 114, 128, 0.3) !important;
            animation: pulse-border-fast 1s infinite ease-in-out !important;
          }
          .tiptap-editor .ProseMirror span[data-type="mention"][data-id="${escapedName}"]:active {
            transform: scale(0.95) !important;
          }
        `
      }
    })

    // 펄스 애니메이션 keyframes 추가
    css += `
      @keyframes pulse-opacity {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
      }
      @keyframes pulse-border {
        0%, 100% {
          border-color: rgb(107, 114, 128);
          box-shadow: 0 0 0 0 rgba(107, 114, 128, 0.4);
        }
        50% {
          border-color: rgb(156, 163, 175);
          box-shadow: 0 0 0 3px rgba(156, 163, 175, 0);
        }
      }
      @keyframes pulse-border-fast {
        0%, 100% {
          border-color: rgb(156, 163, 175);
          box-shadow: 0 0 0 0 rgba(156, 163, 175, 0.5);
        }
        50% {
          border-color: rgb(209, 213, 219);
          box-shadow: 0 0 0 4px rgba(209, 213, 219, 0);
        }
      }
    `

    style.textContent = css
    document.head.appendChild(style)

    return () => {
      const styleToRemove = document.getElementById('pending-entity-styles')
      if (styleToRemove) {
        styleToRemove.remove()
      }
    }
  }, [editor, pendingEntityTypes, classifyingEntities])

  // Ctrl+Enter 키 핸들러 설정
  useEffect(() => {
    if (!editor) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && event.ctrlKey) {
        event.preventDefault()
        event.stopPropagation()
        handleSubmit()
      }
    }

    const editorElement = editor.view.dom
    editorElement.addEventListener('keydown', handleKeyDown, { capture: true })

    return () => {
      editorElement.removeEventListener('keydown', handleKeyDown, { capture: true })
    }
  }, [editor, handleSubmit])

  // 🔧 NEW: Mention 클릭 핸들러 - Type 순환 변경
  useEffect(() => {
    if (!editor || !user?.id) return

    const handleMentionClick = (event: MouseEvent) => {
      let target = event.target as HTMLElement

      // mention span 찾기 (클릭한 요소나 부모 요소)
      let mentionElement: HTMLElement | null = target
      let depth = 0
      while (mentionElement && depth < 5) {
        if (mentionElement.getAttribute('data-type') === 'mention') {
          break
        }
        mentionElement = mentionElement.parentElement
        depth++
      }

      if (!mentionElement || mentionElement.getAttribute('data-type') !== 'mention') {
        return // mention이 아니면 종료
      }

      const entityName = mentionElement.getAttribute('data-id')
      const currentType = mentionElement.getAttribute('data-entity-type') || 'unknown'

      if (!entityName) return

      // Type 순환: unknown → person → project → event → unknown
      const typeOrder: Array<'unknown' | 'person' | 'project' | 'event'> = [
        'unknown',
        'person',
        'project',
        'event',
      ]
      const currentIndex = typeOrder.indexOf(currentType as any)
      const nextType = typeOrder[(currentIndex + 1) % typeOrder.length]

      // entities에서 해당 entity 찾기
      const entity = entitiesRef.current.find((e) => e.name === entityName)

      // DB에 이미 있는 entity는 클릭 불가 (저장 전 entity만 type 변경 가능)
      if (entity) {
        return
      }

      // 저장 전 entity만 처리: pendingEntityTypes 업데이트 (동적 CSS 변경)
      setPendingEntityTypes((prev) => ({
        ...prev,
        [entityName]: nextType,
      }))

      // 에디터 내 mention의 type 속성 업데이트
      const json = editor.getJSON()
      let updated = false

      const traverse = (node: any) => {
        if (node.type === 'mention' && node.attrs?.id === entityName) {
          node.attrs.type = nextType
          updated = true
        }
        if (node.content) {
          node.content.forEach(traverse)
        }
      }

      traverse(json)

      if (updated) {
        editor.commands.setContent(json, { emitUpdate: false })
      }

      // DOM 속성 즉시 업데이트 (중요!)
      const mentionElements = editorElement.querySelectorAll(`[data-type="mention"][data-id="${entityName}"]`)
      mentionElements.forEach((el) => {
        el.setAttribute('data-entity-type', nextType)
      })
    }

    const editorElement = editor.view.dom
    editorElement.addEventListener('click', handleMentionClick, { capture: true })

    return () => {
      editorElement.removeEventListener('click', handleMentionClick, { capture: true })
    }
  }, [editor, user?.id, updateEntityType])

  return {
    editor,
    entities,
    pendingEntityTypes,
    classifyingEntities,
    isSubmitting: createMemo.isPending,
    handleSubmit,
  }
}
