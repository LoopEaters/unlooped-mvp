'use client'

import { useEffect, useRef, useState, memo, useMemo } from 'react'
import { useEntities, useMemosByEntity, useUpdateEntityType } from '@/app/lib/queries'
import { useEntityFilter } from '@/app/providers/EntityFilterProvider'
import { useAuth } from '@/app/providers/AuthProvider'
import { useAIUpdate } from '@/app/providers/AIUpdateProvider'
import MemoCard from './MemoCard'
import type { Database } from '@/types/supabase'

type Entity = Database['public']['Tables']['entity']['Row']

// 빈 배열 상수화 - 참조 안정성 보장
const EMPTY_ENTITIES: Entity[] = []

/**
 * Entity type에 따른 색깔 클래스 반환
 */
function getEntityTypeColor(type: string | null | undefined): { bg: string; text: string } {
  switch (type) {
    case 'person':
      return { bg: 'bg-mention-person/20', text: 'text-mention-person' }
    case 'project':
      return { bg: 'bg-mention-project/20', text: 'text-mention-project' }
    case 'unknown':
    case null:
    case undefined:
      return { bg: 'bg-gray-400/20', text: 'text-gray-400' }
    default:
      return { bg: 'bg-gray-400/20', text: 'text-gray-400' }
  }
}

export default function MainContainer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const { filteredEntityIds } = useEntityFilter()
  const { data: entitiesData } = useEntities(user?.id)

  // 🔧 FIX: entities를 useMemo로 안정화하여 무한 렌더링 방지
  const entities = useMemo(() => entitiesData || EMPTY_ENTITIES, [entitiesData])

  // 개발 모드 렌더링 추적 (Hook은 항상 최상단에서 호출)
  const renderCountRef = useRef(0);
  const prevPropsRef = useRef<any>({});

  // 개발 모드에서만 로그 출력
  if (process.env.NODE_ENV === 'development') {
    renderCountRef.current++;

    const currentProps = { user, filteredEntityIds, entities };
    const changes: string[] = [];
    if (prevPropsRef.current.user !== user) changes.push('user');
    if (prevPropsRef.current.filteredEntityIds !== filteredEntityIds) changes.push('filteredEntityIds');
    if (prevPropsRef.current.entities !== entities) changes.push('entities');

    console.log(`📊 [MainContainer] 렌더링 #${renderCountRef.current}`, {
      changes: changes.length > 0 ? changes.join(', ') : '없음 (순수 리렌더링)',
      userId: user?.id,
      filteredEntityIdsLength: filteredEntityIds.length,
      entitiesCount: entities.length,
    });

    prevPropsRef.current = currentProps;
  }

  // 메모가 추가될 때마다 가장 아래로 스크롤
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [filteredEntityIds])

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-6 bg-bg-primary"
    >
      <div className="space-y-6 min-h-[400px]">
        {/* 헤더 */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">Entity 추천</h2>
          <p className="text-xs text-gray-300 mt-1">
            {filteredEntityIds.length > 0
              ? '입력한 엔티티와 관련된 메모'
              : '아래 입력창에서 @로 엔티티를 언급하면 관련 메모가 표시됩니다'}
          </p>
        </div>

        {/* Entity별 섹션 */}
        {filteredEntityIds.length > 0 ? (
          <div className="space-y-8">
            {filteredEntityIds.map((entityId) => {
              const entity = entities.find((e) => e.id === entityId)

              return (
                <EntitySection
                  key={entityId}
                  entityId={entityId}
                  entityName={entity?.name || '알 수 없음'}
                  entities={entities}
                  userId={user?.id}
                />
              )
            })}
          </div>
        ) : (
          /* 기본 상태 - entity를 아직 언급하지 않았을 때 */
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center text-gray-400">
              <p className="text-lg">@로 엔티티를 언급해보세요</p>
              <p className="text-sm mt-2">관련된 과거 메모들이 여기에 표시됩니다</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Entity별 섹션 컴포넌트
 */
const EntitySection = memo(function EntitySection({
  entityId,
  entityName,
  entities,
  userId
}: {
  entityId: string
  entityName: string
  entities: Entity[]
  userId?: string
}) {
  const { data: memos = [], isLoading, isError, error } = useMemosByEntity(entityId)
  const { isEntityUpdating } = useAIUpdate()
  const updateEntityType = useUpdateEntityType()

  const [isEditingType, setIsEditingType] = useState(false)

  const entity = entities.find((e) => e.id === entityId)
  const isUpdating = isEntityUpdating(entityId)
  const entityColor = getEntityTypeColor(entity?.type)

  const handleTypeChange = (newType: 'person' | 'project' | 'unknown') => {
    if (!userId) return

    updateEntityType.mutate(
      { entityId, type: newType, userId },
      {
        onSuccess: () => {
          setIsEditingType(false)
        },
      }
    )
  }

  // 개발 모드에서만 로그
  if (process.env.NODE_ENV === 'development') {
    console.log(`📌 [EntitySection: ${entityName}]`, {
      entityId,
      memosCount: memos.length,
      isLoading,
      isUpdating,
      description: entity?.description,
      type: entity?.type,
    })
  }

  return (
    <div className="space-y-3">
      {/* Entity 헤더 */}
      <div className="flex items-center justify-between pb-2 border-border-main">
        <div className="flex flex-col gap-2 flex-1">
          {/* Entity 뱃지 + 상태 */}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-lg ${entityColor.bg} ${entityColor.text} font-medium text-sm`}>
              @{entityName}
            </span>

            {/* Type 편집 버튼 */}
            {!isEditingType && (
              <button
                onClick={() => setIsEditingType(true)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
                title="Entity 타입 변경"
              >
                <svg
                  className="w-3.5 h-3.5 text-gray-400 hover:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
            )}

            {/* Type 선택 드롭다운 */}
            {isEditingType && (
              <div className="flex items-center gap-1.5 bg-bg-card px-2 py-1 rounded-lg border border-border-main">
                <button
                  onClick={() => handleTypeChange('person')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    entity?.type === 'person'
                      ? 'bg-mention-person/20 text-mention-person'
                      : 'text-gray-400 hover:bg-gray-700'
                  }`}
                  disabled={updateEntityType.isPending}
                >
                  Person
                </button>
                <button
                  onClick={() => handleTypeChange('project')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    entity?.type === 'project'
                      ? 'bg-mention-project/20 text-mention-project'
                      : 'text-gray-400 hover:bg-gray-700'
                  }`}
                  disabled={updateEntityType.isPending}
                >
                  Project
                </button>
                <button
                  onClick={() => handleTypeChange('unknown')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    entity?.type === 'unknown' || !entity?.type
                      ? 'bg-gray-400/20 text-gray-400'
                      : 'text-gray-400 hover:bg-gray-700'
                  }`}
                  disabled={updateEntityType.isPending}
                >
                  Unknown
                </button>
                <button
                  onClick={() => setIsEditingType(false)}
                  className="ml-1 p-0.5 text-gray-400 hover:text-gray-300"
                  title="취소"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* AI 업데이트 중 표시 */}
            {isUpdating && (
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs animate-pulse">
                <svg
                  className="animate-spin h-3 w-3"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                AI 분석 중...
              </span>
            )}

            {/* 메모 개수 */}
            {!isLoading && !isUpdating && (
              <span className="text-xs text-text-muted">
                {memos.length}개 메모
              </span>
            )}
          </div>

          {/* Description 표시 */}
          {entity?.description && (
            <p className="text-sm text-gray-400 pl-1">
              {entity.description}
            </p>
          )}
        </div>
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="space-y-3">
          <div className="bg-bg-card h-20 rounded-lg animate-pulse"></div>
          <div className="bg-bg-card h-20 rounded-lg animate-pulse"></div>
        </div>
      )}

      {/* 에러 상태 */}
      {isError && (
        <div className="text-center text-red-400 text-sm py-6 pl-4 bg-red-500/10 rounded-md">
          <p className="font-semibold mb-1">데이터를 불러올 수 없습니다</p>
          <p className="text-xs text-gray-400">{error?.message || '알 수 없는 오류'}</p>
        </div>
      )}

      {/* 메모 목록 */}
      {!isLoading && !isError && memos.length > 0 && (
        <div className="space-y-3 pl-4">
          {memos.map((memo) => (
            <MemoCard key={memo.id} memo={memo} entities={entities} />
          ))}
        </div>
      )}

      {/* 빈 상태 */}
      {!isLoading && !isError && memos.length === 0 && (
        <div className="text-center text-gray-400 text-sm py-6 pl-4">
          <p className="text-gray-500">이 엔티티와 관련된 메모가 아직 없습니다</p>
        </div>
      )}
    </div>
  )
})
