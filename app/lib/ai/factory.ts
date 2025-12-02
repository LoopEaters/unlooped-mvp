/**
 * AI Provider Factory
 * 환경 변수에 따라 적절한 Provider 인스턴스 생성
 */

import type { AIProvider, AIProviderConfig } from './types';
import { AIProviderType } from './types';
import { GeminiProvider } from './providers/gemini';
import { OpenAIProvider } from './providers/openai';

/**
 * AI Provider 싱글톤 인스턴스
 */
let providerInstance: AIProvider | null = null;

/**
 * AI Provider 생성 팩토리 함수
 */
export function createAIProvider(): AIProvider {
  // 싱글톤 패턴 (Supabase client와 동일)
  if (providerInstance) {
    return providerInstance;
  }

  // 환경 변수에서 설정 읽기
  const providerType = (process.env.AI_PROVIDER || 'gemini') as AIProviderType;
  const apiKey = getAPIKey(providerType);

  const config: AIProviderConfig = {
    apiKey,
    timeout: parseInt(process.env.AI_TIMEOUT || '5000', 10),
    model: getModel(providerType),
  };

  // Provider 인스턴스 생성
  switch (providerType) {
    case AIProviderType.GEMINI:
      providerInstance = new GeminiProvider(config);
      break;
    case AIProviderType.OPENAI:
      providerInstance = new OpenAIProvider(config);
      break;
    default:
      throw new Error(`Unsupported AI provider: ${providerType}`);
  }

  console.log(`[AI Provider] Initialized: ${providerInstance.name}`);
  return providerInstance;
}

/**
 * Provider별 API 키 가져오기
 */
function getAPIKey(providerType: AIProviderType): string {
  const key =
    providerType === AIProviderType.GEMINI
      ? process.env.GEMINI_API_KEY
      : process.env.OPENAI_API_KEY;

  if (!key) {
    throw new Error(`${providerType.toUpperCase()}_API_KEY not found in environment variables`);
  }

  return key;
}

/**
 * Provider별 기본 모델 설정
 */
function getModel(providerType: AIProviderType): string | undefined {
  if (providerType === AIProviderType.GEMINI) {
    return process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
  }
  if (providerType === AIProviderType.OPENAI) {
    return process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }
  return undefined;
}

/**
 * 싱글톤 인스턴스 (기존 코드 호환성)
 */
export const aiProvider = createAIProvider();
