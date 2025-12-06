/**
 * AI Provider 추상 클래스
 * Template Method 패턴 적용
 */

import type { AIProvider, EntityClassificationResult, AIProviderConfig } from '../types';
import type { BulkImportParseResult } from '@/types/import';
import { EntityType } from '../types';

export abstract class BaseAIProvider implements AIProvider {
  protected config: AIProviderConfig;
  abstract name: string;

  constructor(config: AIProviderConfig) {
    this.config = {
      timeout: 5000,  // 기본 5초
      ...config,
    };
  }

  /**
   * Entity 이름 분류 (Template Method)
   */
  async classify(entityName: string): Promise<EntityClassificationResult> {
    // 1. 입력 검증
    this.validateInput(entityName);

    // 2. 타임아웃 래퍼
    const result = await this.withTimeout(
      this.callAPI(entityName),
      this.config.timeout!
    );

    // 3. 결과 검증
    return this.validateResult(result);
  }

  /**
   * 대용량 import 텍스트 파싱 (하위 클래스에서 구현)
   */
  abstract parseBulkImport(text: string): Promise<BulkImportParseResult>;

  /**
   * 실제 API 호출 (하위 클래스에서 구현)
   */
  protected abstract callAPI(entityName: string): Promise<EntityClassificationResult>;

  /**
   * 입력 검증
   */
  protected validateInput(entityName: string): void {
    if (!entityName || entityName.trim().length === 0) {
      throw new Error('Entity name cannot be empty');
    }
    if (entityName.length > 20) {
      throw new Error('Entity name too long (max 20 characters)');
    }
  }

  /**
   * 결과 검증
   */
  protected validateResult(result: EntityClassificationResult): EntityClassificationResult {
    const validTypes = ['person', 'project', 'unknown'];

    if (!result.type || !validTypes.includes(result.type)) {
      console.warn('Invalid classification result, defaulting to unknown');
      return { type: EntityType.UNKNOWN, confidence: 0.0 };
    }

    return result;
  }

  /**
   * 타임아웃 래퍼
   */
  protected async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('AI API timeout')), timeoutMs)
      ),
    ]);
  }
}
