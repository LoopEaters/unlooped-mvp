/**
 * 엔티티 이름 검증 유틸리티
 * - 영문, 숫자, 한글, '-', '_'만 허용
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
  // 영문, 숫자, 한글, '-', '_'만 허용하고, 1-20자 길이 제한
  const validPattern = /^[a-zA-Z0-9가-힣\-_]{1,20}$/
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
    const errorMessage = `다음 엔티티 이름에 허용되지 않는 특수문자가 포함되어 있습니다:\n${invalidEntityNames.join(', ')}\n\n영문, 숫자, 한글, '-', '_'만 사용할 수 있습니다.`
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
