'use client'

import { useEffect, useRef, useState, memo, useMemo } from 'react'
import { useEntities, useMemosByEntity, useUpdateEntityType } from '@/app/lib/queries'
import { useEntityFilter } from '@/app/providers/EntityFilterProvider'
import { useAIUpdate } from '@/app/providers/AIUpdateProvider'
import { useAppReady } from '@/app/hooks/useAppReady'
import { useLayout } from '@/app/providers/SettingsProvider'
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
  const { isFullWidth } = useLayout()
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

  // 📌 filteredEntityIds 변경 시 accumulatedEntityIds 업데이트 및 재정렬
  useEffect(() => {
    setAccumulatedEntityIds(prev => {
      // filteredEntityIds에 없지만 prev에 있던 것들 (앞에 유지)
      const onlyInPrev = prev.filter(id => !filteredEntityIds.includes(id))

      // 새로 추가된 것이 있는지 체크 (스크롤 트리거용)
      const newIds = filteredEntityIds.filter(id => !prev.includes(id))
      if (newIds.length > 0) {
        lastEntityIdRef.current = newIds[newIds.length - 1]
      }

      // 새로운 배열 구성
      const newArray = [...onlyInPrev, ...filteredEntityIds]

      // 배열 내용이 실제로 바뀌었는지 체크 (순서까지 비교)
      if (
        newArray.length === prev.length &&
        newArray.every((id, index) => id === prev[index])
      ) {
        return prev // 변경 없으면 기존 배열 반환 (re-render 방지)
      }

      return newArray
    })
  }, [filteredEntityIds])

  // ⬇️ 새로운 entity가 추가될 때마다 가장 아래로 부드럽게 스크롤
  // 메모 로딩 및 렌더링 완료 후 스크롤
  useEffect(() => {
    if (accumulatedEntityIds.length === 0) return

    // RAF + setTimeout 조합: DOM 렌더링 + 메모 로딩 대기
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollTo({
              top: containerRef.current.scrollHeight,
              behavior: 'smooth'
            })
          }
        }, 300)
      })
    })
  }, [accumulatedEntityIds])

  // 🔄 로딩 중 UI (작은 로딩 바만 표시, input은 계속 사용 가능)
  const isLoadingOverlay = !isReady

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-y-auto ${theme.ui.primaryBg} relative`}
    >
      {/* 로딩 바 (상단에 작게) */}
      {isLoadingOverlay && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500/20 z-50">
          <div className="h-full bg-blue-500 animate-pulse" style={{ width: '60%' }}></div>
        </div>
      )}

      {/* 컨텐츠 Wrapper - full width 설정에 따라 중앙 정렬 */}
      <div className={`${isFullWidth ? 'w-full px-6' : 'max-w-3xl mx-auto px-6'} min-h-full flex flex-col`}>
        {/* 헤더 (entity 없을 때만 표시, 위쪽 고정) */}
        {accumulatedEntityIds.length === 0 && (
          <div className="pt-6 pb-4 flex-shrink-0">
            <h2 className={`text-lg font-semibold ${theme.ui.textPrimary}`}>Entity 추천</h2>
            <p className={`text-xs ${theme.ui.textSecondary} mt-1`}>
              아래 입력창에서 @로 엔티티를 언급하면 관련 메모가 표시됩니다
            </p>
          </div>
        )}

        {accumulatedEntityIds.length > 0 ? (
          /* Entity가 있을 때: 아래쪽에서 시작 */
          <div className="flex flex-col justify-end flex-1 min-h-0">
            <div className="pt-6">
              <div className="space-y-6">
                {accumulatedEntityIds.map((entityId, index) => {
                  const entity = entities.find((e) => e.id === entityId)
                  const isLast = index === accumulatedEntityIds.length - 1

                  return (
                    <EntitySection
                      key={entityId}
                      entityId={entityId}
                      entityName={entity?.name || '알 수 없음'}
                      entities={entities}
                      userId={user?.id}
                      isLast={isLast}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          /* 기본 상태 - 중앙 배치 */
          <div className="flex items-center justify-center flex-1">
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
  userId,
  isLast = false
}: {
  entityId: string
  entityName: string
  entities: Entity[]
  userId?: string
  isLast?: boolean
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
              userId={userId}
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
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                className={`px-3 py-1.5 rounded-lg ${entityColor.bg}/20 ${entityColor.text} font-medium text-sm hover:bg-${entityColor.bg.replace('bg-', '')}/40 hover:shadow-md hover:scale-105 transition-all whitespace-nowrap cursor-pointer`}
                title="클릭하여 타입 변경"
              >
                @{entityName}
              </button>

              {/* Type 변경 드롭다운 (Overlay) */}
              {isTypeDropdownOpen && (
                <>
                  {/* 배경 클릭 시 닫기 */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsTypeDropdownOpen(false)}
                  ></div>

                  {/* 드롭다운 메뉴 */}
                  <div className={`absolute top-full left-0 mt-2 z-50 flex items-center gap-2 ${theme.ui.cardBg} px-3 py-2 rounded-lg border ${theme.ui.border} shadow-xl min-w-max`}>
                    <span className={`text-xs ${theme.ui.textPlaceholder} mr-1`}>타입:</span>
                    <button
                      onClick={() => handleTypeChange('person')}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                        entity?.type === 'person'
                          ? `${theme.entityTypes.person.bg}/20 ${theme.entityTypes.person.text} hover:bg-${theme.entityTypes.person.bg.replace('bg-', '')}/40`
                          : `${theme.ui.textPlaceholder} ${theme.ui.buttonHover}`
                      }`}
                      disabled={updateEntityType.isPending}
                    >
                      Person
                    </button>
                    <button
                      onClick={() => handleTypeChange('project')}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                        entity?.type === 'project'
                          ? `${theme.entityTypes.project.bg}/20 ${theme.entityTypes.project.text} hover:bg-${theme.entityTypes.project.bg.replace('bg-', '')}/40`
                          : `${theme.ui.textPlaceholder} ${theme.ui.buttonHover}`
                      }`}
                      disabled={updateEntityType.isPending}
                    >
                      Project
                    </button>
                    <button
                      onClick={() => handleTypeChange('unknown')}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                        entity?.type === 'unknown' || !entity?.type
                          ? `${theme.entityTypes.unknown.bg}/20 ${theme.entityTypes.unknown.text} hover:bg-${theme.entityTypes.unknown.bg.replace('bg-', '')}/40`
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
                  </div>
                </>
              )}
            </div>

            {/* Description (오른쪽) - 남은 공간 차지 */}
            {entity?.description && (
              <p className={`text-sm ${theme.ui.textPlaceholder} flex-1 min-w-0`}>
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
      </div>
    </div>
  )
})
