/**
 * Entity 분류 프롬프트 템플릿
 */

export const ENTITY_CLASSIFICATION_PROMPT = (entityName: string): string => {
  return `Classify the following entity name as either "person" (사람 이름) or "project" (프로젝트/업무 이름).

Rules:
1. Korean/English personal names → "person"
   Examples: 홍길동, 김철수, John Smith, Jane
2. Action/task-oriented nouns → "project"
   Examples: 웹사이트개발, MVP프로젝트, Marketing Campaign
3. If uncertain → "unknown"

Respond ONLY with JSON in this exact format:
{"type": "person"|"project"|"unknown", "confidence": 0.0-1.0}

Entity name: "${entityName}"`;
};
