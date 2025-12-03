import React from 'react'
import type { Database } from '@/types/supabase'
import { getMentionHighlightClass } from '@/app/lib/theme'

type Entity = Database['public']['Tables']['entity']['Row']

/**
 * 메모 내용에서 @entity_name 패턴을 찾아서 타입별 색깔로 하이라이트 처리
 * @param content - 메모 내용
 * @param entities - Entity 배열 (type 정보 포함)
 * @param currentEntityId - 현재 entity section의 entity ID (강조 표시용)
 * @returns 하이라이트된 React 요소들의 배열
 */
export function highlightEntities(
  content: string,
  entities: Entity[] = [],
  currentEntityId?: string
): React.ReactNode[] {
  // @entity_name 패턴 정규표현식 (공백/줄바꿈을 제외한 모든 문자)
  const entityPattern = /@(\S+)/g

  const result: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  // Entity 이름 → Entity 객체 맵 생성
  const entityMap = new Map<string, Entity>()
  entities.forEach(entity => {
    entityMap.set(entity.name, entity)
  })

  while ((match = entityPattern.exec(content)) !== null) {
    const matchStart = match.index
    const matchEnd = entityPattern.lastIndex
    const entityName = match[1] // @ 제외한 이름

    // 매칭 이전의 일반 텍스트 추가
    if (matchStart > lastIndex) {
      result.push(content.substring(lastIndex, matchStart))
    }

    // Entity 조회 및 강조 여부 판단
    const entity = entityMap.get(entityName)
    const isEmphasized = entity?.id === currentEntityId
    const highlightClass = getMentionHighlightClass(entity?.type, isEmphasized)

    // Entity 하이라이트 추가
    result.push(
      <span
        key={`entity-${matchStart}`}
        className={highlightClass}
      >
        @{entityName}
      </span>
    )

    lastIndex = matchEnd
  }

  // 마지막 매칭 이후의 일반 텍스트 추가
  if (lastIndex < content.length) {
    result.push(content.substring(lastIndex))
  }

  return result
}
