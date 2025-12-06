/**
 * Google Gemini AI Provider
 */

import { BaseAIProvider } from './base';
import type { EntityClassificationResult } from '../types';
import { EntityType } from '../types';
import { ENTITY_CLASSIFICATION_PROMPT } from '../prompts/entity-classifier';
import { BULK_IMPORT_PARSER_PROMPT } from '../prompts/bulk-import-parser';
import type { BulkImportParseResult } from '@/types/import';

export class GeminiProvider extends BaseAIProvider {
  name = 'Gemini';

  protected async callAPI(entityName: string): Promise<EntityClassificationResult> {
    const { apiKey, model = 'gemini-2.0-flash-exp' } = this.config;

    // Gemini API 호출
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: ENTITY_CLASSIFICATION_PROMPT(entityName)
            }]
          }],
          generationConfig: {
            temperature: 0.1,  // 일관성 중시
            maxOutputTokens: 50,  // 짧은 응답
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    // JSON 파싱
    try {
      const parsed = JSON.parse(text);
      return {
        type: this.normalizeType(parsed.type),
        confidence: parsed.confidence || 0.5,
      };
    } catch (e) {
      console.error('Failed to parse Gemini response:', text);
      return { type: EntityType.UNKNOWN, confidence: 0.0 };
    }
  }

  private normalizeType(type: string): EntityType {
    const normalized = type?.toLowerCase();
    if (normalized === 'person') return EntityType.PERSON;
    if (normalized === 'project') return EntityType.PROJECT;
    return EntityType.UNKNOWN;
  }

  /**
   * 대용량 import 텍스트 파싱
   *
   * @param text - 파싱할 텍스트
   * @returns 파싱 결과 (memos, stats)
   */
  async parseBulkImport(text: string): Promise<BulkImportParseResult> {
    const { apiKey, model = 'gemini-2.0-flash-exp' } = this.config;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: BULK_IMPORT_PARSER_PROMPT(text)
            }]
          }],
          generationConfig: {
            temperature: 0.1,  // 일관성 중시
            maxOutputTokens: 8192,  // 대용량 응답
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    // JSON 파싱
    try {
      // Gemini가 가끔 ```json ... ``` 형식으로 반환하는 경우 처리
      const cleanedText = resultText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      return JSON.parse(cleanedText);
    } catch (e) {
      console.error('Failed to parse Gemini response:', resultText);
      throw new Error('Invalid JSON response from Gemini');
    }
  }
}
