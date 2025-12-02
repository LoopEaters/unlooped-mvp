/**
 * 현재 커서 위치의 멘션 컨텍스트
 */
export interface MentionContext {
  search: string      // @ 뒤의 검색어
  startPos: number    // @ 시작 위치
  endPos: number      // 검색어 끝 위치
}

/**
 * 현재 커서 위치의 @mention 컨텍스트를 파싱
 * @returns MentionContext | null - null이면 멘션 중이 아님
 */
export function parseCurrentMention(content: string): MentionContext | null {
  if (!content) return null

  // 마지막 @ 찾기
  const lastAtIndex = content.lastIndexOf('@')
  if (lastAtIndex === -1) return null

  // @ 뒤의 텍스트
  const afterAt = content.slice(lastAtIndex + 1)

  // 스페이스가 있으면 이미 확정된 것
  if (afterAt.includes(' ')) return null

  // 유효한 entity 이름 패턴인지 확인
  if (!/^[가-힣a-zA-Z0-9]*$/.test(afterAt)) return null

  return {
    search: afterAt,
    startPos: lastAtIndex,
    endPos: lastAtIndex + 1 + afterAt.length,
  }
}

/**
 * content에서 확정된 @entity들을 추출
 */
export function extractConfirmedEntities(content: string): string[] {
  const pattern = /@([가-힣a-zA-Z0-9]+)(?:\s|$)/g
  const matches = [...content.matchAll(pattern)]
  return matches.map((match) => match[1])
}

/**
 * content에 @entity를 확정 (스페이스 추가)
 */
export function confirmMentionInContent(
  content: string,
  mentionContext: MentionContext,
  entityName: string
): string {
  const before = content.slice(0, mentionContext.startPos)
  const after = content.slice(mentionContext.endPos)
  return `${before}@${entityName} ${after}`
}

/**
 * Entity type에 따른 색깔 클래스 반환
 */
export function getEntityTypeColorForInput(type: string | null | undefined): string {
  switch (type) {
    case 'person':
      return 'text-mention-person bg-mention-person'
    case 'project':
      return 'text-mention-project bg-mention-project'
    case 'unknown':
    case null:
    case undefined:
      return 'text-gray-400 bg-gray-400'
    default:
      return 'text-gray-400 bg-gray-400'
  }
}

/**
 * 커서 위치 설정
 */
export function setCursorPosition(element: HTMLElement, position: number) {
  const selection = window.getSelection()
  const range = document.createRange()

  let currentPos = 0
  let found = false

  const walk = (node: Node) => {
    if (found) return

    if (node.nodeType === Node.TEXT_NODE) {
      const textLength = node.textContent?.length || 0
      if (currentPos + textLength >= position) {
        const offset = position - currentPos
        try {
          range.setStart(node, offset)
          range.collapse(true)
          selection?.removeAllRanges()
          selection?.addRange(range)
          found = true
        } catch (e) {
          console.error('커서 설정 실패:', e)
        }
        return
      }
      currentPos += textLength
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.nodeName === 'BR') {
        currentPos += 1
      }
      node.childNodes.forEach(walk)
    }
  }

  walk(element)

  if (!found) {
    range.selectNodeContents(element)
    range.collapse(false)
    selection?.removeAllRanges()
    selection?.addRange(range)
  }
}
