import React from 'react'
import type { Database } from '@/types/supabase'

type Entity = Database['public']['Tables']['entity']['Row']

/**
 * 메모 내용에서 @entity_name 패턴을 찾아서 타입별 색깔로 하이라이트 처리
 * @param content - 메모 내용
 * @param entities - Entity 배열 (type 정보 포함)
 * @returns 하이라이트된 React 요소들의 배열
 */
export function highlightEntities(
  content: string,
  entities: Entity[] = []
): React.ReactNode[] {
  // @entity_name 패턴 정규표현식 (한글, 영문, 숫자만 허용)
  const entityPattern = /@([가-힣a-zA-Z0-9]+)/g

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

    // Entity 조회 및 type별 색깔 결정
    const entity = entityMap.get(entityName)
    const colorClass = getEntityTypeColor(entity?.type)

    // Entity 하이라이트 추가
    result.push(
      <span
        key={`entity-${matchStart}`}
        className={`${colorClass}/20 ${colorClass} px-1.5 py-0.5 rounded font-medium`}
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

/**
 * Entity type에 따른 색깔 클래스 반환
 */
function getEntityTypeColor(type: string | null | undefined): string {
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
