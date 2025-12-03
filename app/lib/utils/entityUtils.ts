import type { Editor } from '@tiptap/react'

/**
 * 엔티티 유틸리티
 * - 엔티티 이름 검증
 * - 에디터 컨텐츠 정규화
 */

export interface ValidationResult {
  isValid: boolean
  invalidEntityNames: string[]
  errorMessage?: string
}

/**
 * 엔티티 이름이 유효한지 검증
 * @param entityName - 검증할 엔티티 이름
 * @returns 유효하면 true, 아니면 false
 */
export function isValidEntityName(entityName: string): boolean {
  // 영문, 숫자, 한글, '-', '_', '[', ']', '(', ')'만 허용하고, 1-20자 길이 제한
  const validPattern = /^[a-zA-Z0-9가-힣\-_\[\]()]{1,20}$/
  return validPattern.test(entityName)
}

/**
 * 엔티티 이름 목록을 검증
 * @param entityNames - 검증할 엔티티 이름 배열
 * @returns 검증 결과 객체
 */
export function validateEntityNames(entityNames: string[]): ValidationResult {
  const invalidEntityNames = entityNames.filter((name) => !isValidEntityName(name))

  if (invalidEntityNames.length > 0) {
    const errorMessage = `다음 엔티티 이름에 허용되지 않는 특수문자가 포함되어 있습니다:\n${invalidEntityNames.join(', ')}\n\n영문, 숫자, 한글, '-', '_', '[', ']', '(', ')'만 사용할 수 있습니다.`
    return {
      isValid: false,
      invalidEntityNames,
      errorMessage,
    }
  }

  return {
    isValid: true,
    invalidEntityNames: [],
  }
}

/**
 * 에디터 컨텐츠를 추출하면서 Mention 노드 뒤에 공백 보장
 * - Mention 노드 직후에 공백 없이 다른 문자가 오면 공백 추가
 * - 이를 통해 DB 저장 시 항상 "@엔티티 텍스트" 형태 유지
 * - 파싱 시 공백으로 구분하여 Mention 유실 방지
 *
 * @param editor - Tiptap 에디터 인스턴스
 * @param entityNames - 확정된 엔티티 이름 배열
 * @returns 정규화된 컨텐츠 문자열
 */
export function normalizeContentWithMentions(
  editor: Editor,
  entityNames: string[]
): string {
  const rawContent = editor.getText()
  let normalized = rawContent

  // 각 엔티티 이름 뒤에 공백 없으면 추가
  entityNames.forEach((name) => {
    // 정규식 특수문자 이스케이프
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // @엔티티명 뒤에 바로 공백이 아닌 문자가 오는 경우 공백 추가
    const regex = new RegExp(`@${escaped}(?=\\S)`, 'g')
    normalized = normalized.replace(regex, `@${name} `)
  })

  return normalized
}
