'use client'

import { useEffect, useRef, useState, memo, useMemo } from 'react'
import { useEntities, useMemosByEntity, useUpdateEntityType } from '@/app/lib/queries'
import { useEntityFilter } from '@/app/providers/EntityFilterProvider'
import { useAIUpdate } from '@/app/providers/AIUpdateProvider'
import { useAppReady } from '@/app/hooks/useAppReady'
import MemoCard from './MemoCard'
import { getEntityTypeColor, getCurrentTheme } from '@/app/lib/theme'
import type { Database } from '@/types/supabase'

type Entity = Database['public']['Tables']['entity']['Row']

// 빈 배열 상수화 - 참조 안정성 보장
const EMPTY_ENTITIES: Entity[] = []

// 테마 가져오기
const theme = getCurrentTheme()

export default function MainContainer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { isReady, user } = useAppReady()
  const { filteredEntityIds } = useEntityFilter()
  const { data: entitiesData } = useEntities(user?.id)

  // 🔧 FIX: entities를 useMemo로 안정화하여 무한 렌더링 방지
  const entities = useMemo(() => entitiesData || EMPTY_ENTITIES, [entitiesData])

  // 📝 누적된 entity ID 목록 관리 (기록 보존)
  const [accumulatedEntityIds, setAccumulatedEntityIds] = useState<string[]>([])

  // 🆕 새로 추가된 entity ID 추적 (스크롤 트리거용)
  const lastEntityIdRef = useRef<string | null>(null)

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
      accumulatedEntityIdsLength: accumulatedEntityIds.length,
    });

    prevPropsRef.current = currentProps;
  }

  // 📌 filteredEntityIds 변경 시 새로운 entity만 누적 목록에 추가
  useEffect(() => {
    setAccumulatedEntityIds(prev => {
      // 새로 추가된 ID만 필터링 (중복 제거)
      const newIds = filteredEntityIds.filter(id => !prev.includes(id))
      if (newIds.length > 0) {
        // 마지막에 추가된 entity ID 저장
        lastEntityIdRef.current = newIds[newIds.length - 1]
        return [...prev, ...newIds]  // 새로운 ID를 아래에 추가
      }
      return prev
    })
  }, [filteredEntityIds])

  // ⬇️ 새로운 entity가 추가될 때마다 가장 아래로 부드럽게 스크롤
  // 메모 로딩 및 렌더링 완료 후 스크롤
  useEffect(() => {
    if (accumulatedEntityIds.length === 0) return

    // 메모 데이터 로딩 + displayedMemos 렌더링 + DOM 업데이트 대기
    const scrollTimer = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: 'smooth'
        })
      }
    }, 400) // 메모 로딩 + 렌더링 대기

    return () => clearTimeout(scrollTimer)
  }, [accumulatedEntityIds])

  // 🔄 로딩 중 UI (user + entities 완료될 때까지)
  if (!isReady) {
    return (
      <div className={`flex-1 overflow-y-auto p-6 ${theme.ui.primaryBg}`}>
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className={`${theme.ui.textPlaceholder} text-sm`}>데이터 로딩 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-y-auto px-6 pt-6 ${theme.ui.primaryBg}`}
    >
      <div className="space-y-6 min-h-[400px]">
        {/* 헤더 */}
        <div className="mb-4">
          <h2 className={`text-lg font-semibold ${theme.ui.textPrimary}`}>Entity 추천</h2>
          <p className={`text-xs ${theme.ui.textSecondary} mt-1`}>
            {accumulatedEntityIds.length > 0
              ? '입력한 엔티티와 관련된 메모'
              : '아래 입력창에서 @로 엔티티를 언급하면 관련 메모가 표시됩니다'}
          </p>
        </div>

        {/* Entity별 섹션 */}
        {accumulatedEntityIds.length > 0 ? (
          <div>
            {accumulatedEntityIds.map((entityId) => {
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
            <div className={`text-center ${theme.ui.textPlaceholder}`}>
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

  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false)
  const [visibleMemoCount, setVisibleMemoCount] = useState(5)

  const entity = entities.find((e) => e.id === entityId)
  const isUpdating = isEntityUpdating(entityId)
  const entityColor = getEntityTypeColor(entity?.type)

  // 메모를 역순으로 정렬 (최신이 아래)
  const sortedMemos = useMemo(() => {
    return [...memos].sort((a, b) => {
      const timeA = new Date(a.created_at || '').getTime()
      const timeB = new Date(b.created_at || '').getTime()
      return timeA - timeB  // 오래된 것 → 최신 순
    })
  }, [memos])

  // 표시할 메모 (최신 n개)
  const displayedMemos = useMemo(() => {
    return sortedMemos.slice(-visibleMemoCount)
  }, [sortedMemos, visibleMemoCount])

  // 숨겨진 메모 개수
  const hiddenMemosCount = Math.max(0, sortedMemos.length - visibleMemoCount)

  // 이전 메모 더보기
  const handleLoadMore = () => {
    setVisibleMemoCount(prev => Math.min(prev + 10, sortedMemos.length))
  }

  const handleTypeChange = (newType: 'person' | 'project' | 'unknown') => {
    if (!userId) return

    updateEntityType.mutate(
      { entityId, type: newType, userId },
      {
        onSuccess: () => {
          setIsTypeDropdownOpen(false)
        },
      }
    )
  }

  const handleDelete = () => {
    // TODO: 삭제 기능 구현 예정
    console.log('Delete entity:', entityId)
    setIsTypeDropdownOpen(false)
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
    <div className={`relative pt-6 border-b ${theme.ui.border} last:border-b-0`}>
      {/* 로딩 상태 */}
      {isLoading && (
        <div className="space-y-3 mb-20 pl-6">
          <div className={`${theme.ui.loading.bg} h-20 rounded-lg animate-pulse`}></div>
          <div className={`${theme.ui.loading.bg} h-20 rounded-lg animate-pulse`}></div>
        </div>
      )}

      {/* 에러 상태 */}
      {isError && (
        <div className={`text-center ${theme.ui.error.text} text-sm py-6 ${theme.ui.error.bg} rounded-md mb-20 ml-6`}>
          <p className="font-semibold mb-1">데이터를 불러올 수 없습니다</p>
          <p className={`text-xs ${theme.ui.textPlaceholder}`}>{error?.message || '알 수 없는 오류'}</p>
        </div>
      )}

      {/* 메모 목록 (역순: 오래된 것 → 최신) */}
      {!isLoading && !isError && sortedMemos.length > 0 && (
        <div className="space-y-3 mb-4 pl-6">
          {/* 이전 메모 더보기 */}
          {hiddenMemosCount > 0 && (
            <button
              onClick={handleLoadMore}
              className={`text-xs ${theme.ui.textMuted} hover:${theme.ui.textSecondary} transition-colors`}
            >
              이전 메모 +{hiddenMemosCount}개 더보기
            </button>
          )}

          {displayedMemos.map((memo) => (
            <MemoCard
              key={memo.id}
              memo={memo}
              entities={entities}
              currentEntityId={entityId}
            />
          ))}
        </div>
      )}

      {/* 빈 상태 */}
      {!isLoading && !isError && memos.length === 0 && (
        <div className={`text-center ${theme.ui.textPlaceholder} text-sm py-6 mb-20 ml-6`}>
          <p className={theme.ui.textPlaceholder}>이 엔티티와 관련된 메모가 아직 없습니다</p>
        </div>
      )}

      {/* Entity 메타데이터 (Sticky Bottom) */}
      <div className={`sticky bottom-0 ${theme.ui.stickyMetadataBg} backdrop-blur-sm pt-3 pb-3 z-10`}>
        <div className="flex items-center justify-between gap-4">
          {/* 왼쪽: Entity 정보 */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Entity 뱃지 (클릭 가능) */}
            <button
              onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
              className={`px-3 py-1.5 rounded-lg ${entityColor.bg}/20 ${entityColor.text} font-medium text-sm hover:${entityColor.bg}/30 transition-colors flex-shrink-0`}
              title="클릭하여 타입 변경"
            >
              @{entityName}
            </button>

            {/* Description (오른쪽) */}
            {entity?.description && (
              <p className={`text-sm ${theme.ui.textPlaceholder}`}>
                {entity.description}
              </p>
            )}
          </div>

          {/* 오른쪽: 상태 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* AI 업데이트 중 표시 */}
            {isUpdating && (
              <span className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${theme.ui.aiProcessing.bg} ${theme.ui.aiProcessing.text} text-xs animate-pulse`}>
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
          </div>
        </div>

        {/* Type 변경 드롭다운 */}
        {isTypeDropdownOpen && (
          <div className={`mt-3 flex items-center gap-2 ${theme.ui.cardBg} px-3 py-2 rounded-lg border ${theme.ui.border}`}>
            <span className={`text-xs ${theme.ui.textPlaceholder} mr-1`}>타입:</span>
            <button
              onClick={() => handleTypeChange('person')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                entity?.type === 'person'
                  ? `${theme.entityTypes.person.bg}/20 ${theme.entityTypes.person.text}`
                  : `${theme.ui.textPlaceholder} ${theme.ui.buttonHover}`
              }`}
              disabled={updateEntityType.isPending}
            >
              Person
            </button>
            <button
              onClick={() => handleTypeChange('project')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                entity?.type === 'project'
                  ? `${theme.entityTypes.project.bg}/20 ${theme.entityTypes.project.text}`
                  : `${theme.ui.textPlaceholder} ${theme.ui.buttonHover}`
              }`}
              disabled={updateEntityType.isPending}
            >
              Project
            </button>
            <button
              onClick={() => handleTypeChange('unknown')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                entity?.type === 'unknown' || !entity?.type
                  ? `${theme.entityTypes.unknown.bg}/20 ${theme.entityTypes.unknown.text}`
                  : `${theme.ui.textPlaceholder} ${theme.ui.buttonHover}`
              }`}
              disabled={updateEntityType.isPending}
            >
              Unknown
            </button>

            {/* 구분선 */}
            <div className={`w-px h-4 ${theme.ui.border} mx-1`}></div>

            {/* 삭제 버튼 */}
            <button
              onClick={handleDelete}
              className={`px-2.5 py-1 rounded text-xs font-medium ${theme.ui.delete.text} ${theme.ui.delete.bgHover} transition-colors`}
              disabled={updateEntityType.isPending}
              title="삭제 (기능 추가 예정)"
            >
              삭제
            </button>

            {/* 닫기 버튼 */}
            <button
              onClick={() => setIsTypeDropdownOpen(false)}
              className={`ml-auto p-0.5 ${theme.ui.textPlaceholder} hover:text-gray-300`}
              title="닫기"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
})
