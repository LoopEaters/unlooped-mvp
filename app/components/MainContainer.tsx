'use client'

import { useEffect, useRef } from 'react'
import { useEntities, useMemosByEntity } from '@/app/lib/queries'
import { useEntityFilter } from '@/app/providers/EntityFilterProvider'
import { useAuth } from '@/app/providers/AuthProvider'
import { useAIUpdate } from '@/app/providers/AIUpdateProvider'
import MemoCard from './MemoCard'
import type { Database } from '@/types/supabase'

type Entity = Database['public']['Tables']['entity']['Row']

export default function MainContainer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const { filteredEntityIds } = useEntityFilter()
  const { data: entities = [] as Entity[] } = useEntities(user?.id)

  console.log('📊 [MainContainer] 렌더링', {
    filteredEntityIds,
    entitiesCount: Array.isArray(entities) ? entities.length : 0,
  })

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
      <div className="space-y-6">
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
        {filteredEntityIds.length > 0 && (
          <div className="space-y-8">
            {filteredEntityIds.map((entityId) => {
              const entity = Array.isArray(entities) ? entities.find((e) => e.id === entityId) : undefined

              return (
                <EntitySection
                  key={entityId}
                  entityId={entityId}
                  entityName={entity?.name || '알 수 없음'}
                />
              )
            })}
          </div>
        )}

        {/* 기본 상태 - entity를 아직 언급하지 않았을 때 */}
        {filteredEntityIds.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-lg">@로 엔티티를 언급해보세요</p>
            <p className="text-sm mt-2">관련된 과거 메모들이 여기에 표시됩니다</p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Entity별 섹션 컴포넌트
 */
function EntitySection({ entityId, entityName }: { entityId: string; entityName: string }) {
  const { user } = useAuth()
  const { data: memos = [], isLoading, isError, error } = useMemosByEntity(entityId)
  const { data: entities = [] } = useEntities(user?.id)
  const { isEntityUpdating } = useAIUpdate()

  const entity = entities.find((e) => e.id === entityId)
  const isUpdating = isEntityUpdating(entityId)

  console.log(`📌 [EntitySection: ${entityName}]`, {
    entityId,
    memosCount: memos.length,
    isLoading,
    isUpdating,
    description: entity?.description,
  })

  return (
    <div className="space-y-3">
      {/* Entity 헤더 */}
      <div className="flex items-center justify-between pb-2 border-b border-border-main">
        <div className="flex flex-col gap-2 flex-1">
          {/* Entity 뱃지 + 상태 */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-mention-project/20 text-mention-project font-medium text-sm">
              @{entityName}
            </span>

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
}
