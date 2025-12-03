import type { JSONContent } from '@tiptap/react'
import type { Database } from '@/types/supabase'

type Entity = Database['public']['Tables']['entity']['Row']

/**
 * 플레인 텍스트 메모 내용을 Tiptap JSON 구조로 변환
 * @mention 패턴을 Mention 노드로 변환하여 에디터에서 제대로 표시되도록 함
 *
 * @example
 * parseMemoContentWithMentions("Meeting with @John about @ProjectX", entities)
 * // → Tiptap JSON with mention nodes
 */
export function parseMemoContentWithMentions(
  content: string,
  entities: Entity[]
): JSONContent {
  const entityNameMap = new Map(entities.map(e => [e.name, e]))

  // 정규식으로 @mentions 찾기 (한글, 영문, 숫자 지원)
  // 예: @John, @프로젝트, @Project123
  const regex = /@([가-힣a-zA-Z0-9]+)/g
  let match
  let lastIndex = 0
  const contentNodes: JSONContent[] = []

  while ((match = regex.exec(content)) !== null) {
    // mention 앞의 텍스트 추가
    if (match.index > lastIndex) {
      contentNodes.push({
        type: 'text',
        text: content.slice(lastIndex, match.index),
      })
    }

    // mention 노드 추가
    const entityName = match[1]
    const entity = entityNameMap.get(entityName)

    // Entity가 존재하면 mention 노드, 없으면 일반 텍스트로 처리
    if (entity) {
      contentNodes.push({
        type: 'mention',
        attrs: {
          id: entityName,
          label: entityName,
          type: entity.type || null,
        },
      })
    } else {
      // Entity가 삭제된 경우 일반 텍스트로 표시
      contentNodes.push({
        type: 'text',
        text: `@${entityName}`,
      })
    }

    lastIndex = regex.lastIndex
  }

  // 남은 텍스트 추가
  if (lastIndex < content.length) {
    contentNodes.push({
      type: 'text',
      text: content.slice(lastIndex),
    })
  }

  // Tiptap 문서 구조 반환
  // 빈 콘텐츠인 경우 빈 paragraph 반환
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: contentNodes.length > 0 ? contentNodes : undefined,
      },
    ],
  }
}
