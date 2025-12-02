/**
 * OpenAI GPT Provider
 */

import { BaseAIProvider } from './base';
import type { EntityClassificationResult } from '../types';
import { EntityType } from '../types';
import { ENTITY_CLASSIFICATION_PROMPT } from '../prompts/entity-classifier';

export class OpenAIProvider extends BaseAIProvider {
  name = 'OpenAI';

  protected async callAPI(entityName: string): Promise<EntityClassificationResult> {
    const { apiKey, model = 'gpt-4o-mini' } = this.config;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an entity name classifier. Respond only with JSON.'
          },
          {
            role: 'user',
            content: ENTITY_CLASSIFICATION_PROMPT(entityName)
          }
        ],
        temperature: 0.1,
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '{}';

    try {
      const parsed = JSON.parse(text);
      return {
        type: this.normalizeType(parsed.type),
        confidence: parsed.confidence || 0.5,
      };
    } catch (e) {
      console.error('Failed to parse OpenAI response:', text);
      return { type: EntityType.UNKNOWN, confidence: 0.0 };
    }
  }

  private normalizeType(type: string): EntityType {
    const normalized = type?.toLowerCase();
    if (normalized === 'person') return EntityType.PERSON;
    if (normalized === 'project') return EntityType.PROJECT;
    return EntityType.UNKNOWN;
  }
}
