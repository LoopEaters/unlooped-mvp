/**
 * Entity 분류 프롬프트 템플릿
 */

export const ENTITY_CLASSIFICATION_PROMPT = (entityName: string): string => {
  return `다음 엔티티 이름을 "person"(사람 이름), "project"(프로젝트/업무 이름), 또는 "unknown" 중 하나로 분류하세요.

규칙:
1. 한국어/영어 사람 이름으로 추측 → "person"
   예시: 홍길동, 김철수, John Smith, Jane, 이민영, 박현준
2. 어떤 행동·업무·과제를 나타내는 명사(프로젝트/업무명 등)로 추측 → "project"
   예시: 웹사이트개발, MVP프로젝트, Marketing Campaign, 마케팅 캠페인, 웹사이트 개발
3. 위 기준으로 사람 이름인지 프로젝트/업무 이름인지 추측이 매우 어렵다면 어렵다면 → "unknown"
   단, 조금이라도, 이름이나 프로젝트로 추측된다면 "person" 또는 "project"로 분류하세요.

반드시 아래 JSON 형식으로만 응답하세요:
{"type": "person"|"project"|"unknown", "confidence": 0.0-1.0}

엔티티 이름: "${entityName}"`;
};
