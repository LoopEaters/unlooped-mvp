/**
 * AI Provider 타입 정의
 * Entity 타입 자동 분류를 위한 AI 모듈의 핵심 타입들
 */

import type { BulkImportParseResult } from '@/types/import';

/**
 * Entity 타입 enum
 */
export enum EntityType {
  PERSON = 'person',      // 사람 (예: 홍길동, John)
  PROJECT = 'project',    // 프로젝트 (예: 웹사이트개발, MVP)
  UNKNOWN = 'unknown',    // 분류 실패 시
}

/**
 * AI Provider 타입 enum
 */
export enum AIProviderType {
  GEMINI = 'gemini',
  OPENAI = 'openai',
}

/**
 * Entity 분류 결과
 */
export interface EntityClassificationResult {
  type: EntityType;
  confidence: number;  // 0.0 ~ 1.0
}

/**
 * AI Provider 인터페이스
 */
export interface AIProvider {
  classify(entityName: string): Promise<EntityClassificationResult>;
  parseBulkImport(text: string): Promise<BulkImportParseResult>;
  name: string;
}

/**
 * AI Provider 설정
 */
export interface AIProviderConfig {
  apiKey: string;
  timeout?: number;     // ms, 기본값: 5000
  model?: string;       // 모델 이름 (선택적)
}
