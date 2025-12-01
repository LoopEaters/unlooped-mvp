import React from 'react'

/**
 * 메모 내용에서 @entity_name 패턴을 찾아서 하이라이트 처리
 * @param content - 메모 내용
 * @returns 하이라이트된 React 요소들의 배열
 */
export function highlightEntities(content: string): React.ReactNode[] {
  // @entity_name 패턴 정규표현식 (한글, 영문, 숫자만 허용)
  const entityPattern = /@([가-힣a-zA-Z0-9]+)/g

  const result: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = entityPattern.exec(content)) !== null) {
    const matchStart = match.index
    const matchEnd = entityPattern.lastIndex
    const entityName = match[1] // @ 제외한 이름

    // 매칭 이전의 일반 텍스트 추가
    if (matchStart > lastIndex) {
      result.push(content.substring(lastIndex, matchStart))
    }

    // Entity 하이라이트 추가
    result.push(
      <span
        key={`entity-${matchStart}`}
        className="bg-mention-project/20 text-mention-project px-1.5 py-0.5 rounded font-medium"
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
