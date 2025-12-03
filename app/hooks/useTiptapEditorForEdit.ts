'use client'

import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useEntities, useUpdateMemo } from '@/app/lib/queries'
import { useAuth } from '@/app/providers/AuthProvider'
import { useAIUpdate } from '@/app/providers/AIUpdateProvider'
import { useEntityFilter } from '@/app/providers/EntityFilterProvider'
import { mentionSuggestionOptions } from './tiptap/suggestion'
import { CustomMention } from './tiptap/CustomMention'
import { parseMemoContentWithMentions, buildMentionAwareContentNodes } from '@/app/lib/utils/parseMemoContent'
import { validateEntityNames, normalizeContentWithMentions } from '@/app/lib/utils/entityUtils'
import { toast } from 'sonner'
import type { Database } from '@/types/supabase'

type Entity = Database['public']['Tables']['entity']['Row']
type Memo = Database['public']['Tables']['memo']['Row']

interface UseTiptapEditorForEditOptions {
  memo: Memo
  onSuccess?: () => void
}

/**
 * Tiptap 에디터 훅 (편집 모드)
 * - 기존 메모 내용을 pre-populate
 * - Mention 기능 (@entity)
 * - Entity type 자동 분류
 * - Ctrl+Enter 저장
 * - Entity 관계 동기화
 */
export function useTiptapEditorForEdit(options: UseTiptapEditorForEditOptions) {
  const { memo, onSuccess } = options
  const { user } = useAuth()
  const { data: entities = [] as Entity[] } = useEntities(user?.id)
  const updateMemo = useUpdateMemo(user?.id || '')
  const { addUpdatingEntity, removeUpdatingEntity } = useAIUpdate()
  const { setFilteredEntityIds } = useEntityFilter()

  // Entity type 분류 상태
  const [pendingEntityTypes, setPendingEntityTypes] = useState<Record<string, string>>({})
  const [classifyingEntities, setClassifyingEntities] = useState<Set<string>>(new Set())

  // 원본 Entity IDs 추적 (변경 감지용)
  const originalEntityIdsRef = useRef<string[]>([])

  // entities를 ref로 관리하여 suggestion items가 최신 entities를 참조하도록
  const entitiesRef = useRef<Entity[]>([])
  const userRef = useRef(user)
  const previousMentionsRef = useRef<Set<string>>(new Set())

  // entities가 업데이트될 때 ref도 업데이트
  useEffect(() => {
    entitiesRef.current = entities
  }, [entities])

  useEffect(() => {
    userRef.current = user
  }, [user])

  /**
   * AI를 통해 entity type 분류 (백그라운드)
   */
  const classifyEntityType = useCallback(async (entityName: string) => {
    // 이미 존재하는 entity면 건너뜀
    if (entitiesRef.current.find((e) => e.name === entityName)) {
      return
    }

    // 이미 분류 중이면 건너뜀
    setClassifyingEntities((prev) => {
      if (prev.has(entityName)) {
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

  // suggestion 설정을 useMemo로 밖으로 빼서 ref 참조 보장
  const suggestionConfig = useMemo(() => {
    return {
      ...mentionSuggestionOptions,
      // items 함수는 매번 실행될 때마다 entitiesRef.current를 참조
      items: ({ query }: { query: string }) => {
        const currentEntities = entitiesRef.current
        const currentUser = userRef.current

        if (!query) return []

        // @ 뒤 검색어로 필터링
        const filtered = currentEntities
          .filter((entity) =>
            entity.name.toLowerCase().startsWith(query.toLowerCase())
          )
          .slice(0, 5)

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
      // mention 선택 시 pendingEntityTypes 확인하여 type 포함
      command: ({ editor, range, props }: any) => {
        const entityName = props.id || props.name
        // pendingEntityTypes에서 type 확인
        const pendingType = pendingEntityTypes[entityName]
        const finalType = props.type || pendingType || null

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
          'min-h-[80px] text-white outline-none bg-transparent whitespace-pre-wrap break-words overflow-wrap-anywhere p-0',
        style: 'word-break: break-word',
      },
    },
  })

  // memo.id와 content 추적용 ref
  const previousMemoRef = useRef<{ id: string; content: string } | null>(null)

  // 에디터 초기화 시 메모 내용 pre-populate
  useEffect(() => {
    if (!editor || !memo || entities.length === 0) return

    // memo.id와 content가 모두 같으면 skip (사용자가 편집 중일 수 있음)
    const isSameMemo =
      previousMemoRef.current?.id === memo.id &&
      previousMemoRef.current?.content === memo.content

    if (isSameMemo) return

    try {
      // 메모 내용을 Tiptap JSON으로 변환
      const contentWithMentions = parseMemoContentWithMentions(memo.content, entities)
      editor.commands.setContent(contentWithMentions)

      // 원본 Entity IDs 추적
      const entityNames = extractConfirmedEntities(editor)
      const entityIds = entityNames
        .map((name) => entities.find((e) => e.name === name)?.id)
        .filter((id): id is string => id !== undefined)
      originalEntityIdsRef.current = entityIds

      // previousMentions도 초기화
      previousMentionsRef.current = new Set(entityNames)

      // 현재 memo.id와 content 저장
      previousMemoRef.current = { id: memo.id, content: memo.content }

      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 [useTiptapEditorForEdit] 에디터 콘텐츠 초기화:', {
          memoId: memo.id,
          contentPreview: memo.content.substring(0, 50),
        })
      }
    } catch (error) {
      console.error('❌ [useTiptapEditorForEdit] 콘텐츠 초기화 실패:', error)
    }
  }, [editor, memo.id, memo.content, entities, extractConfirmedEntities])

  // 에디터 내용이 변경될 때 entity 필터 업데이트 + 새 mention 감지
  useEffect(() => {
    if (!editor || !user?.id) {
      setFilteredEntityIds([])
      return
    }

    const updateFilter = () => {
      const confirmedEntityNames = extractConfirmedEntities(editor)

      // 새로 추가된 mention 감지하여 classifyEntityType 호출
      const currentMentions = new Set(confirmedEntityNames)
      const newMentions = confirmedEntityNames.filter(
        (name) => !previousMentionsRef.current.has(name)
      )

      if (newMentions.length > 0) {
        newMentions.forEach((entityName) => {
          // 기존 entity가 아니면 type 분류 시작
          const existingEntity = entitiesRef.current.find((e) => e.name === entityName)
          if (!existingEntity) {
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
  }, [editor, user?.id, extractConfirmedEntities, setFilteredEntityIds, classifyEntityType])

  /**
   * 메모 업데이트
   */
  const handleUpdate = useCallback(() => {
    if (!editor || !user?.id) return

    const confirmedEntityNames = extractConfirmedEntities(editor)

    // Mention 노드 뒤 공백 보장하며 컨텐츠 추출
    const content = normalizeContentWithMentions(editor, confirmedEntityNames)
    if (!content.trim()) return

    // 엔티티 이름 검증
    const validation = validateEntityNames(confirmedEntityNames)
    if (!validation.isValid) {
      toast.error(validation.errorMessage)
      return
    }

    updateMemo.mutate(
      {
        memoId: memo.id,
        content,
        entityNames: confirmedEntityNames,
        originalEntityIds: originalEntityIdsRef.current,
        pendingEntityTypes,
      },
      {
        onSuccess: (result) => {
          // AI 업데이트 시작 (추가된 entities에 대해)
          if (result.addedEntities.length > 0) {
            result.addedEntities.forEach((entity) => {
              addUpdatingEntity(entity.id)
              setTimeout(() => {
                removeUpdatingEntity(entity.id)
              }, 5000)
            })
          }

          // 성공 콜백 호출 (drawer 닫기)
          onSuccess?.()
        },
        onError: (error) => {
          console.error('메모 수정 실패:', error)
        },
      }
    )
  }, [
    editor,
    user?.id,
    memo.id,
    pendingEntityTypes,
    updateMemo,
    addUpdatingEntity,
    removeUpdatingEntity,
    onSuccess,
    extractConfirmedEntities,
  ])

  // pendingEntityTypes + classifyingEntities 변경 시 동적으로 CSS 스타일 주입
  useEffect(() => {
    if (!editor) return

    // 기존 style 태그 제거
    const existingStyle = document.getElementById('pending-entity-styles-edit')
    if (existingStyle) {
      existingStyle.remove()
    }

    const style = document.createElement('style')
    style.id = 'pending-entity-styles-edit'
    let css = ''

    // 분류 중인 entity: 회색 펄스 애니메이션
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

    // 분류 완료된 entity: 확정된 색깔
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
            border: none !important;
            animation: none !important;
            font-weight: normal !important;
            padding: 0 4px !important;
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
    `

    style.textContent = css
    document.head.appendChild(style)

    return () => {
      const styleToRemove = document.getElementById('pending-entity-styles-edit')
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
        handleUpdate()
      }
    }

    const editorElement = editor.view.dom
    editorElement.addEventListener('keydown', handleKeyDown, { capture: true })

    return () => {
      editorElement.removeEventListener('keydown', handleKeyDown, { capture: true })
    }
  }, [editor, handleUpdate])

  // 붙여넣기 시 @mention 포함 텍스트를 스캔하여 mention 노드로 변환 (편집 모드)
  useEffect(() => {
    if (!editor) return

    const handlePaste = (event: ClipboardEvent) => {
      const text = event.clipboardData?.getData('text/plain') ?? ''

      if (!text.includes('@')) {
        return
      }

      event.preventDefault()
      event.stopPropagation()

      const contentNodes = buildMentionAwareContentNodes(text, entitiesRef.current)

      editor
        .chain()
        .focus()
        .insertContent({
          type: 'paragraph',
          content: contentNodes.length > 0 ? contentNodes : undefined,
        })
        .run()
    }

    const editorElement = editor.view.dom
    editorElement.addEventListener('paste', handlePaste, { capture: true })

    return () => {
      editorElement.removeEventListener('paste', handlePaste, { capture: true })
    }
  }, [editor])

  return {
    editor,
    entities,
    pendingEntityTypes,
    classifyingEntities,
    isSubmitting: updateMemo.isPending,
    handleUpdate,
  }
}
