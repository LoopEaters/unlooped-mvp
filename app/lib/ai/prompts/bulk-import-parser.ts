/**
 * Bulk Import 파싱 프롬프트 템플릿
 */

export const BULK_IMPORT_PARSER_PROMPT = (text: string): string => {
  const today = new Date().toISOString().split('T')[0];

  return `당신은 일기/메모 데이터를 파싱하는 전문가입니다.
아래 텍스트를 분석하여 날짜별 메모로 구조화하세요.

### 규칙:
1. 텍스트에서 날짜를 찾아 ISO 8601 형식(YYYY-MM-DD)으로 변환
   - "오늘" → ${today}
   - "어제" → ${getPreviousDate(today, 1)}
   - "그저께" → ${getPreviousDate(today, 2)}
   - "2024년 1월 15일", "2024.01.15", "2024/01/15", "01/15/2024" 등 다양한 형식 지원

2. 각 날짜 섹션의 내용을 하나의 메모로 그룹화
   - 날짜가 명시된 줄 아래의 모든 내용이 해당 날짜의 메모가 됨
   - 다음 날짜가 나올 때까지 또는 텍스트 끝까지

3. 텍스트에서 '@'로 시작하는 Entity 이름 추출
   - "@홍길동님" → "홍길동" (님, 씨 등 존칭 제거)
   - "@프로젝트A" → "프로젝트A"
   - Entity 이름은 한글, 영문, 숫자, 하이픈(-), 언더스코어(_)만 허용
   - 공백이나 특수문자가 나오면 Entity 종료

4. 날짜가 없는 섹션은 오늘 날짜(${today})로 처리

5. Entity는 중복 제거 및 정규화
   - 같은 이름은 하나로 통합
   - 대소문자는 구분

### 출력 형식 (JSON):
{
  "memos": [
    {
      "date": "YYYY-MM-DD",
      "content": "메모 내용 (@ 포함 원본 그대로)",
      "entities": ["Entity1", "Entity2"]
    }
  ],
  "stats": {
    "totalMemos": 전체_메모_개수,
    "totalEntities": 전체_Entity_언급_횟수,
    "uniqueEntities": 고유_Entity_개수,
    "dateRange": ["가장_오래된_날짜", "가장_최근_날짜"]
  }
}

### 입력 텍스트:
${text}

반드시 위 JSON 형식으로만 응답하세요. 다른 설명은 추가하지 마세요.`;
};

/**
 * N일 이전 날짜 계산
 */
function getPreviousDate(dateString: string, daysAgo: number): string {
  const date = new Date(dateString);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}
