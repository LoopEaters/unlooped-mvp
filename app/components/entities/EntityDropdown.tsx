'use client'

import { cn } from '@/app/lib/util'
import { defaultTheme } from '@/app/lib/theme'
import type { Database } from '@/types/supabase'

type Entity = Database['public']['Tables']['entity']['Row']

interface EntityDropdownProps {
  /** 현재 입력 중인 entity 이름 */
  search: string
  /** 전체 entity 리스트 */
  entities: Entity[]
  /** 현재 선택된 인덱스 */
  selectedIndex: number
  /** Entity 선택 시 콜백 */
  onSelect: (entity: Entity | null) => void
  /** 드롭다운 표시 여부 */
  isOpen: boolean
}

/**
 * Entity 자동완성 드롭다운 컴포넌트
 * Input 창 위에 표시되는 dropup 형태
 */
export default function EntityDropdown({
  search,
  entities,
  selectedIndex,
  onSelect,
  isOpen,
}: EntityDropdownProps) {
  if (!isOpen || !search) return null

  // search로 시작하는 entity 필터링
  const filteredEntities = entities
    .filter((e) => e.name.toLowerCase().startsWith(search.toLowerCase()))
    .slice(0, 5) // 최대 5개

  const hasMatches = filteredEntities.length > 0

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-bg-secondary border border-border-main rounded-lg shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
      {hasMatches ? (
        <ul className="py-1">
          {filteredEntities.map((entity, index) => (
            <li
              key={entity.id}
              className={cn(
                'px-4 py-2 cursor-pointer transition-colors',
                index === selectedIndex
                  ? `${defaultTheme.ui.interactive.primaryBgLight} ${defaultTheme.ui.textPrimary}`
                  : `${defaultTheme.ui.textSecondary} hover:bg-bg-card`
              )}
              onClick={() => onSelect(entity)}
              onMouseEnter={() => {
                // 마우스 호버 시 선택 인덱스 업데이트를 위해
                // 부모에서 처리할 수 있도록 이벤트를 발생시킬 수 있음
              }}
            >
              <span className="font-medium">@{entity.name}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-4 py-3">
          <div className={`${defaultTheme.ui.textMuted} text-sm mb-2`}>
            일치하는 엔티티가 없습니다
          </div>
          <button
            onClick={() => onSelect(null)}
            className={`${defaultTheme.ui.interactive.primaryText} text-sm hover:opacity-80 transition-opacity font-medium`}
          >
            새 엔티티 &apos;{search}&apos; 생성
          </button>
        </div>
      )}
    </div>
  )
}
