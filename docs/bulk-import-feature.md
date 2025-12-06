# 대용량 Import 기능 설계 문서 (v2.0)

## 문서 정보
- **버전**: 2.0 (Gemini 기반 파싱)
- **최종 수정일**: 2025-12-06
- **작성자**: Development Team
- **구현 페이지**: `/import`

---

## 1. 개요

### 1.1 목적
사용자가 대량의 메모 데이터를 한 번에 업로드하고, **Gemini AI**를 사용하여 자동으로 날짜별 메모로 파싱 및 Entity 추출하여 저장하는 기능을 제공합니다.

### 1.2 핵심 변경사항 (v2.0)
- ❌ **제거**: 클라이언트 측 날짜 패턴 매칭 파싱
- ✅ **추가**: Gemini AI를 이용한 전체 텍스트 구조화 파싱
- ✅ **추가**: 페이지네이션 없이 전체 결과 한 번에 처리
- ✅ **추가**: `/import` 전용 페이지

### 1.3 사용 사례
- 일기장 데이터 마이그레이션
- 회의록/노트 일괄 업로드
- 과거 기록 데이터 정리 및 이전
- 자유 형식 텍스트에서 메모 추출

---

## 2. Gemini AI 기반 파싱 전략

### 2.1 기존 방식의 문제점

**❌ 정규식 기반 파싱:**
```typescript
// 문제 1: 날짜 형식이 엄격함
const datePattern = /^\d{4}[-./]\d{2}[-./]\d{2}$/

// 문제 2: 자유 형식 텍스트 처리 불가
"오늘 김철수님과 만났다" // 날짜가 없어 파싱 실패
```

### 2.2 Gemini AI 파싱 장점

**✅ 자연어 이해:**
- "오늘", "어제", "2024년 1월 1일" 등 다양한 날짜 표현 인식
- 문맥에서 날짜 추론 가능
- Entity 멘션 자동 감지

**✅ 구조화 자동화:**
- 임의의 형식 텍스트를 구조화된 JSON으로 변환
- 하나의 긴 텍스트를 사건별로 자동 분리
- Entity 이름 정규화 (예: "홍길동님" → "홍길동")

### 2.3 Gemini Prompt 설계

#### 2.3.1 프롬프트 템플릿

**파일 위치**: `app/lib/ai/prompts/bulk-import-parser.ts`

```typescript
export const BULK_IMPORT_PARSER_PROMPT = (text: string): string => {
  return `당신은 일기/메모 데이터를 파싱하는 전문가입니다.
아래 텍스트를 분석하여 날짜별 메모로 구조화하세요.

### 규칙:
1. 텍스트에서 날짜를 찾아 ISO 8601 형식(YYYY-MM-DD)으로 변환
   - "오늘", "어제" 등은 현재 날짜 기준으로 계산 (오늘: ${new Date().toISOString().split('T')[0]})
   - "2024년 1월 15일", "2024.01.15", "01/15/2024" 등 다양한 형식 지원
2. 각 날짜 섹션의 내용을 하나의 메모로 그룹화
3. 텍스트에서 '@'로 시작하는 Entity 이름 추출
   - "@홍길동님" → "홍길동"
   - "@프로젝트A" → "프로젝트A"
4. 날짜가 없는 섹션은 오늘 날짜로 처리
5. Entity는 중복 제거 및 정규화

### 출력 형식 (JSON):
{
  "memos": [
    {
      "date": "YYYY-MM-DD",
      "content": "메모 내용 (@ 포함)",
      "entities": ["Entity1", "Entity2"]
    }
  ],
  "stats": {
    "totalMemos": 숫자,
    "totalEntities": 숫자,
    "uniqueEntities": 숫자,
    "dateRange": ["최소날짜", "최대날짜"]
  }
}

### 입력 텍스트:
${text}

반드시 위 JSON 형식으로만 응답하세요. 다른 설명은 추가하지 마세요.`;
};
```

#### 2.3.2 Gemini API 호출 예시

**파일 위치**: `app/lib/ai/providers/gemini.ts` (확장)

```typescript
export class GeminiProvider extends BaseAIProvider {
  // ... 기존 코드 ...

  /**
   * 대용량 import 텍스트 파싱
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
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    // JSON 파싱
    try {
      return JSON.parse(resultText);
    } catch (e) {
      console.error('Failed to parse Gemini response:', resultText);
      throw new Error('Invalid JSON response from Gemini');
    }
  }
}
```

---

## 3. 프로젝트 컨벤션 및 아키텍처

### 3.1 폴더 구조 (프로젝트 표준)

```
app/
├── import/                          # 👈 NEW: Import 페이지
│   └── page.tsx                     # /import 메인 페이지
├── components/
│   └── import/                      # 👈 NEW: Import 관련 컴포넌트
│       ├── ImportPage.tsx           # Import 페이지 메인 컨테이너
│       ├── TextInput.tsx            # 텍스트 입력 영역
│       ├── ParsePreview.tsx         # Gemini 파싱 결과 미리보기
│       ├── ImportProgress.tsx       # DB 저장 진행 상황
│       └── ResultSummary.tsx        # 완료 후 요약
├── api/
│   └── import/
│       ├── parse/
│       │   └── route.ts             # POST: Gemini AI 파싱 API
│       └── execute/
│           └── route.ts             # POST: DB 저장 실행 API
└── lib/
    └── ai/
        └── prompts/
            └── bulk-import-parser.ts  # Gemini 프롬프트 템플릿
```

### 3.2 네이밍 컨벤션

**컴포넌트:**
- PascalCase: `ImportPage.tsx`, `TextInput.tsx`
- 'use client' directive 최상단

**API Routes:**
- kebab-case: `parse/route.ts`, `execute/route.ts`
- POST 메서드 사용
- NextRequest, NextResponse 타입 사용

**훅:**
- camelCase with 'use' prefix: `useImportProgress`, `useGeminiParse`

**타입:**
- PascalCase: `BulkImportParseResult`, `ImportExecuteRequest`
- Supabase 타입 재사용: `Database['public']['Tables']['memo']['Row']`

### 3.3 디자인 시스템 (theme.ts 기반)

#### 3.3.1 색상 사용

**배경:**
```tsx
import { defaultTheme } from '@/app/lib/theme'

// 주요 배경
className={defaultTheme.ui.primaryBg}     // bg-bg-primary (#1a1f2e)
className={defaultTheme.ui.secondaryBg}   // bg-bg-secondary (#252b3b)
className={defaultTheme.ui.cardBg}        // bg-bg-card (#2a2f3e)
```

**텍스트:**
```tsx
className={defaultTheme.ui.textPrimary}    // text-white
className={defaultTheme.ui.textSecondary}  // text-gray-300
className={defaultTheme.ui.textMuted}      // text-text-muted (#9ca3af)
```

**인터랙티브 요소:**
```tsx
// 주요 버튼
className={`${defaultTheme.ui.interactive.primaryBg} ${defaultTheme.ui.interactive.primaryBgHover}`}
// → bg-blue-500 hover:bg-blue-600

// 위험 버튼
className={defaultTheme.ui.interactive.dangerText}  // text-red-400
```

**Entity 타입별 색상:**
```tsx
import { getEntityTypeColor } from '@/app/lib/theme'

const entityColor = getEntityTypeColor('person')
// → { bg: 'bg-mention-person', text: 'text-mention-person', hex: '#22C55E' }
```

#### 3.3.2 컴포넌트 스타일 패턴

**카드 스타일:**
```tsx
<div className={`${defaultTheme.ui.cardBg} border ${defaultTheme.ui.border} rounded-lg p-4`}>
  {/* content */}
</div>
```

**버튼 스타일:**
```tsx
// 주요 버튼
<button className={`px-4 py-2 ${defaultTheme.ui.interactive.primaryBg} ${defaultTheme.ui.interactive.primaryBgHover} text-white rounded-lg font-medium transition-colors`}>
  Import 시작
</button>

// 보조 버튼
<button className={`px-4 py-2 ${defaultTheme.ui.secondaryBg} ${defaultTheme.ui.buttonHover} ${defaultTheme.ui.textSecondary} rounded-lg transition-colors`}>
  취소
</button>
```

**로딩 스피너:**
```tsx
<div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
```

### 3.4 Radix UI 사용

**Dialog (모달 대신):**
```tsx
import * as Dialog from '@radix-ui/react-dialog'

<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black/50" />
    <Dialog.Content className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${defaultTheme.ui.cardBg} rounded-lg p-6`}>
      <Dialog.Title className={defaultTheme.ui.textPrimary}>제목</Dialog.Title>
      <Dialog.Description className={defaultTheme.ui.textMuted}>설명</Dialog.Description>
      {/* content */}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

---

## 4. 구현 상세

### 4.1 페이지: `/import`

**파일**: `app/import/page.tsx`

```tsx
'use client'

import { useAuth } from '@/app/providers/AuthProvider'
import Header from '@/app/components/common/Header'
import ImportPage from '@/app/components/import/ImportPage'
import { defaultTheme } from '@/app/lib/theme'

export default function ImportRoute() {
  const { userProfile, isLoading } = useAuth()

  // 로딩 중
  if (isLoading) {
    return (
      <div className={`flex flex-col h-screen ${defaultTheme.ui.primaryBg}`}>
        <Header />
        <div className="flex items-center justify-center flex-1">
          <div className={defaultTheme.ui.textPrimary}>Loading...</div>
        </div>
      </div>
    )
  }

  // 비로그인
  if (!userProfile) {
    return (
      <div className={`flex flex-col h-screen ${defaultTheme.ui.primaryBg}`}>
        <Header />
        <div className="flex items-center justify-center flex-1">
          <div className={defaultTheme.ui.textMuted}>Please log in to import memos.</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-screen ${defaultTheme.ui.primaryBg} flex flex-col`}>
      <Header />

      {/* Page Title */}
      <div className={`border-b ${defaultTheme.ui.border} px-6 py-3 ${defaultTheme.ui.secondaryBg}`}>
        <h1 className={`text-xl ${defaultTheme.ui.textPrimary} font-light`}>메모 일괄 업로드</h1>
        <p className={`${defaultTheme.ui.textMuted} text-sm mt-1`}>
          대량의 메모를 한 번에 업로드하고 AI가 자동으로 분석합니다
        </p>
      </div>

      {/* Import Content */}
      <div className="flex-1 overflow-auto">
        <ImportPage userId={userProfile.id} />
      </div>
    </div>
  )
}
```

### 4.2 컴포넌트: ImportPage

**파일**: `app/components/import/ImportPage.tsx`

```tsx
'use client'

import { useState } from 'react'
import { defaultTheme } from '@/app/lib/theme'
import TextInput from './TextInput'
import ParsePreview from './ParsePreview'
import ImportProgress from './ImportProgress'
import ResultSummary from './ResultSummary'
import type { BulkImportParseResult, ImportExecuteResult } from '@/types/import'

type Step = 'input' | 'preview' | 'progress' | 'complete'

interface ImportPageProps {
  userId: string
}

export default function ImportPage({ userId }: ImportPageProps) {
  const [step, setStep] = useState<Step>('input')
  const [inputText, setInputText] = useState('')
  const [parseResult, setParseResult] = useState<BulkImportParseResult | null>(null)
  const [executeResult, setExecuteResult] = useState<ImportExecuteResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1: 텍스트 파싱 (Gemini)
  const handleParse = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/import/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      })

      if (!response.ok) {
        throw new Error('파싱 실패')
      }

      const result = await response.json()
      setParseResult(result)
      setStep('preview')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: DB 저장 실행
  const handleExecute = async () => {
    if (!parseResult) return

    setStep('progress')
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/import/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memos: parseResult.memos,
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error('Import 실패')
      }

      const result = await response.json()
      setExecuteResult(result)
      setStep('complete')
    } catch (err: any) {
      setError(err.message)
      setStep('preview') // 에러 시 preview로 복귀
    } finally {
      setIsLoading(false)
    }
  }

  // Step 렌더링
  return (
    <div className="max-w-4xl mx-auto p-6">
      {step === 'input' && (
        <TextInput
          value={inputText}
          onChange={setInputText}
          onParse={handleParse}
          isLoading={isLoading}
          error={error}
        />
      )}

      {step === 'preview' && parseResult && (
        <ParsePreview
          result={parseResult}
          onBack={() => setStep('input')}
          onExecute={handleExecute}
          isLoading={isLoading}
          error={error}
        />
      )}

      {step === 'progress' && (
        <ImportProgress />
      )}

      {step === 'complete' && executeResult && (
        <ResultSummary
          result={executeResult}
          onReset={() => {
            setStep('input')
            setInputText('')
            setParseResult(null)
            setExecuteResult(null)
            setError(null)
          }}
        />
      )}
    </div>
  )
}
```

### 4.3 API: Parse Endpoint

**파일**: `app/api/import/parse/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { aiProvider } from '@/app/lib/ai/factory'
import type { BulkImportParseResult } from '@/types/import'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'text is required' },
        { status: 400 }
      )
    }

    // 텍스트 길이 제한 (100,000자)
    if (text.length > 100_000) {
      return NextResponse.json(
        { error: 'Text too long (max 100,000 characters)' },
        { status: 400 }
      )
    }

    console.log(`[Import Parse] 시작: ${text.length}자`)

    // Gemini AI 파싱
    const result: BulkImportParseResult = await aiProvider.parseBulkImport(text)

    console.log(`[Import Parse] 완료: ${result.stats.totalMemos}개 메모`)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[Import Parse] 에러:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 4.4 API: Execute Endpoint

**파일**: `app/api/import/execute/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { getEntityByName, createEntityDirect } from '@/app/lib/queries'
import type { ImportExecuteRequest, ImportExecuteResult } from '@/types/import'

export async function POST(request: NextRequest) {
  try {
    const { memos, userId }: ImportExecuteRequest = await request.json()

    if (!memos || !Array.isArray(memos) || !userId) {
      return NextResponse.json(
        { error: 'memos and userId are required' },
        { status: 400 }
      )
    }

    // 메모 개수 제한 (500개)
    if (memos.length > 500) {
      return NextResponse.json(
        { error: 'Too many memos (max 500)' },
        { status: 400 }
      )
    }

    console.log(`[Import Execute] 시작: ${memos.length}개 메모, userId: ${userId}`)

    const supabase = await createClient()

    // === Step 1: 전체 Entity 이름 수집 ===
    const allEntityNames = new Set<string>()
    memos.forEach(memo => {
      memo.entities.forEach(name => allEntityNames.add(name))
    })

    console.log(`[Import Execute] Entity 총 ${allEntityNames.size}개`)

    // === Step 2: 기존 Entity 조회 (Batch) ===
    const entityMap = new Map<string, any>()

    for (const name of Array.from(allEntityNames)) {
      const existing = await getEntityByName(name, userId)
      if (existing) {
        entityMap.set(name, existing)
      }
    }

    console.log(`[Import Execute] 기존 Entity ${entityMap.size}개 재사용`)

    // === Step 3: 새 Entity 생성 (AI 분류 포함) ===
    const newEntityNames = Array.from(allEntityNames).filter(
      name => !entityMap.has(name)
    )

    let createdEntityCount = 0

    for (const name of newEntityNames) {
      // AI 타입 분류는 createEntityDirect 내부에서 수행됨
      const entity = await createEntityDirect(name, userId)
      entityMap.set(name, entity)
      createdEntityCount++
    }

    console.log(`[Import Execute] 새 Entity ${createdEntityCount}개 생성`)

    // === Step 4: Memo 생성 (Batch Insert) ===
    const memoInserts = memos.map(parsed => ({
      content: parsed.content,
      user_id: userId,
      created_at: new Date(parsed.date).toISOString(),
    }))

    const { data: createdMemos, error: memoError } = await supabase
      .from('memo')
      .insert(memoInserts)
      .select()

    if (memoError) {
      console.error('[Import Execute] Memo 생성 실패:', memoError)
      throw new Error('Failed to create memos')
    }

    console.log(`[Import Execute] Memo ${createdMemos.length}개 생성`)

    // === Step 5: memo_entity 관계 생성 (Batch) ===
    const memoEntityInserts = []

    createdMemos.forEach((memo, idx) => {
      const parsed = memos[idx]
      parsed.entities.forEach(entityName => {
        const entity = entityMap.get(entityName)
        if (entity) {
          memoEntityInserts.push({
            memo_id: memo.id,
            entity_id: entity.id,
          })
        }
      })
    })

    const { error: linkError } = await supabase
      .from('memo_entity')
      .insert(memoEntityInserts)

    if (linkError) {
      console.error('[Import Execute] memo_entity 생성 실패:', linkError)
      throw new Error('Failed to link entities')
    }

    console.log(`[Import Execute] 관계 ${memoEntityInserts.length}개 생성`)

    // === 결과 반환 ===
    const result: ImportExecuteResult = {
      success: true,
      stats: {
        memosCreated: createdMemos.length,
        entitiesCreated: createdEntityCount,
        entitiesReused: entityMap.size - createdEntityCount,
        errors: 0,
      },
    }

    console.log('[Import Execute] 완료:', result)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[Import Execute] 에러:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 4.5 타입 정의

**파일**: `types/import.ts` (새로 생성)

```typescript
export interface ParsedMemo {
  date: string          // ISO 8601 (YYYY-MM-DD)
  content: string       // 메모 내용 (@ 포함)
  entities: string[]    // Entity 이름 배열
}

export interface BulkImportParseResult {
  memos: ParsedMemo[]
  stats: {
    totalMemos: number
    totalEntities: number
    uniqueEntities: number
    dateRange: [string, string]  // [최소날짜, 최대날짜]
  }
}

export interface ImportExecuteRequest {
  memos: ParsedMemo[]
  userId: string
}

export interface ImportExecuteResult {
  success: boolean
  stats: {
    memosCreated: number
    entitiesCreated: number
    entitiesReused: number
    errors: number
  }
}
```

---

## 5. UI 컴포넌트 상세

### 5.1 TextInput 컴포넌트

**파일**: `app/components/import/TextInput.tsx`

```tsx
'use client'

import { defaultTheme } from '@/app/lib/theme'
import { FileText } from 'lucide-react'

interface TextInputProps {
  value: string
  onChange: (value: string) => void
  onParse: () => void
  isLoading: boolean
  error: string | null
}

export default function TextInput({ value, onChange, onParse, isLoading, error }: TextInputProps) {
  return (
    <div className="space-y-4">
      {/* 안내 문구 */}
      <div className={`${defaultTheme.ui.cardBg} border ${defaultTheme.ui.border} rounded-lg p-4`}>
        <div className="flex items-start gap-3">
          <FileText className={`w-5 h-5 ${defaultTheme.ui.textMuted} mt-0.5`} />
          <div>
            <h3 className={`${defaultTheme.ui.textPrimary} font-medium mb-1`}>사용 방법</h3>
            <ul className={`${defaultTheme.ui.textMuted} text-sm space-y-1 list-disc list-inside`}>
              <li>자유 형식으로 메모를 붙여넣으세요</li>
              <li>AI가 자동으로 날짜와 Entity를 인식합니다</li>
              <li>@ 기호로 Entity를 표시하면 더 정확합니다</li>
              <li>날짜 예시: "2024-01-15", "오늘", "어제", "2024년 1월 15일"</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 텍스트 입력 영역 */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="여기에 메모를 붙여넣으세요...

예시:
2024-01-15
오늘 @김철수님과 @카페에서 만났다.
@프로젝트A에 대해 논의했다.

2024-01-16
@회의에서 새로운 아이디어가 나왔다."
        className={`w-full h-96 px-4 py-3 ${defaultTheme.ui.cardBg} border ${defaultTheme.ui.border} ${defaultTheme.ui.textPrimary} rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
        style={{ fontFamily: 'monospace' }}
      />

      {/* 에러 메시지 */}
      {error && (
        <div className={`${defaultTheme.ui.error.bg} border border-red-500/20 rounded-lg p-3`}>
          <p className={defaultTheme.ui.error.text}>{error}</p>
        </div>
      )}

      {/* 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={onParse}
          disabled={!value.trim() || isLoading}
          className={`px-6 py-2 ${defaultTheme.ui.interactive.primaryBg} ${defaultTheme.ui.interactive.primaryBgHover} text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              AI 분석 중...
            </>
          ) : (
            'AI로 분석하기'
          )}
        </button>
      </div>
    </div>
  )
}
```

### 5.2 ParsePreview 컴포넌트

**파일**: `app/components/import/ParsePreview.tsx`

```tsx
'use client'

import { defaultTheme, getEntityTypeColor } from '@/app/lib/theme'
import { Calendar, Hash, CheckCircle } from 'lucide-react'
import type { BulkImportParseResult } from '@/types/import'

interface ParsePreviewProps {
  result: BulkImportParseResult
  onBack: () => void
  onExecute: () => void
  isLoading: boolean
  error: string | null
}

export default function ParsePreview({ result, onBack, onExecute, isLoading, error }: ParsePreviewProps) {
  return (
    <div className="space-y-4">
      {/* 통계 요약 */}
      <div className="grid grid-cols-3 gap-4">
        <div className={`${defaultTheme.ui.cardBg} border ${defaultTheme.ui.border} rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className={`w-4 h-4 ${defaultTheme.ui.textMuted}`} />
            <span className={`${defaultTheme.ui.textMuted} text-sm`}>메모 개수</span>
          </div>
          <p className={`${defaultTheme.ui.textPrimary} text-2xl font-semibold`}>
            {result.stats.totalMemos}개
          </p>
        </div>

        <div className={`${defaultTheme.ui.cardBg} border ${defaultTheme.ui.border} rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <Hash className={`w-4 h-4 ${defaultTheme.ui.textMuted}`} />
            <span className={`${defaultTheme.ui.textMuted} text-sm`}>Entity 개수</span>
          </div>
          <p className={`${defaultTheme.ui.textPrimary} text-2xl font-semibold`}>
            {result.stats.uniqueEntities}개
          </p>
        </div>

        <div className={`${defaultTheme.ui.cardBg} border ${defaultTheme.ui.border} rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className={`w-4 h-4 ${defaultTheme.ui.textMuted}`} />
            <span className={`${defaultTheme.ui.textMuted} text-sm`}>날짜 범위</span>
          </div>
          <p className={`${defaultTheme.ui.textPrimary} text-sm font-medium`}>
            {result.stats.dateRange[0]} ~ {result.stats.dateRange[1]}
          </p>
        </div>
      </div>

      {/* 메모 미리보기 */}
      <div className={`${defaultTheme.ui.cardBg} border ${defaultTheme.ui.border} rounded-lg p-4`}>
        <h3 className={`${defaultTheme.ui.textPrimary} font-medium mb-3`}>파싱 결과 미리보기</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {result.memos.map((memo, idx) => (
            <div
              key={idx}
              className={`${defaultTheme.ui.secondaryBg} border ${defaultTheme.ui.borderSubtle} rounded-lg p-3`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`${defaultTheme.ui.textMuted} text-xs`}>{memo.date}</span>
                <span className={`${defaultTheme.ui.textMuted} text-xs`}>
                  {memo.entities.length}개 Entity
                </span>
              </div>
              <p className={`${defaultTheme.ui.textSecondary} text-sm line-clamp-2`}>
                {memo.content}
              </p>
              {memo.entities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {memo.entities.map((entity, eidx) => (
                    <span
                      key={eidx}
                      className={`${defaultTheme.ui.interactive.primaryBgLight} ${defaultTheme.ui.interactive.primaryText} px-2 py-0.5 rounded text-xs`}
                    >
                      @{entity}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className={`${defaultTheme.ui.error.bg} border border-red-500/20 rounded-lg p-3`}>
          <p className={defaultTheme.ui.error.text}>{error}</p>
        </div>
      )}

      {/* 버튼 */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={isLoading}
          className={`px-6 py-2 ${defaultTheme.ui.secondaryBg} ${defaultTheme.ui.buttonHover} ${defaultTheme.ui.textSecondary} rounded-lg transition-colors disabled:opacity-50`}
        >
          뒤로
        </button>
        <button
          onClick={onExecute}
          disabled={isLoading}
          className={`px-6 py-2 ${defaultTheme.ui.interactive.primaryBg} ${defaultTheme.ui.interactive.primaryBgHover} text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              저장 중...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Import 시작
            </>
          )}
        </button>
      </div>
    </div>
  )
}
```

### 5.3 ImportProgress 컴포넌트

**파일**: `app/components/import/ImportProgress.tsx`

```tsx
'use client'

import { defaultTheme } from '@/app/lib/theme'

export default function ImportProgress() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className={`${defaultTheme.ui.cardBg} border ${defaultTheme.ui.border} rounded-lg p-8 max-w-md w-full`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className={`${defaultTheme.ui.textPrimary} text-lg font-medium mb-2`}>
            Import 진행 중...
          </h3>
          <p className={`${defaultTheme.ui.textMuted} text-sm`}>
            메모와 Entity를 데이터베이스에 저장하고 있습니다
          </p>
        </div>
      </div>
    </div>
  )
}
```

### 5.4 ResultSummary 컴포넌트

**파일**: `app/components/import/ResultSummary.tsx`

```tsx
'use client'

import { defaultTheme } from '@/app/lib/theme'
import { CheckCircle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import type { ImportExecuteResult } from '@/types/import'

interface ResultSummaryProps {
  result: ImportExecuteResult
  onReset: () => void
}

export default function ResultSummary({ result, onReset }: ResultSummaryProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className={`${defaultTheme.ui.cardBg} border ${defaultTheme.ui.border} rounded-lg p-8 max-w-md w-full`}>
        <div className="text-center mb-6">
          <CheckCircle className={`w-16 h-16 ${defaultTheme.ui.interactive.successText} mx-auto mb-4`} />
          <h3 className={`${defaultTheme.ui.textPrimary} text-xl font-semibold mb-2`}>
            Import 완료!
          </h3>
          <p className={`${defaultTheme.ui.textMuted} text-sm`}>
            메모와 Entity가 성공적으로 저장되었습니다
          </p>
        </div>

        {/* 통계 */}
        <div className={`${defaultTheme.ui.secondaryBg} rounded-lg p-4 space-y-2 mb-6`}>
          <div className="flex justify-between">
            <span className={defaultTheme.ui.textMuted}>생성된 메모</span>
            <span className={defaultTheme.ui.textPrimary}>{result.stats.memosCreated}개</span>
          </div>
          <div className="flex justify-between">
            <span className={defaultTheme.ui.textMuted}>새 Entity</span>
            <span className={defaultTheme.ui.textPrimary}>{result.stats.entitiesCreated}개</span>
          </div>
          <div className="flex justify-between">
            <span className={defaultTheme.ui.textMuted}>기존 Entity 재사용</span>
            <span className={defaultTheme.ui.textPrimary}>{result.stats.entitiesReused}개</span>
          </div>
        </div>

        {/* 버튼 */}
        <div className="space-y-2">
          <Link
            href="/"
            className={`w-full px-6 py-2 ${defaultTheme.ui.interactive.primaryBg} ${defaultTheme.ui.interactive.primaryBgHover} text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}
          >
            <Home className="w-4 h-4" />
            홈으로 이동
          </Link>
          <button
            onClick={onReset}
            className={`w-full px-6 py-2 ${defaultTheme.ui.secondaryBg} ${defaultTheme.ui.buttonHover} ${defaultTheme.ui.textSecondary} rounded-lg transition-colors flex items-center justify-center gap-2`}
          >
            <RefreshCw className="w-4 h-4" />
            다시 Import 하기
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## 6. 구현 체크리스트

### Phase 1: AI 인프라 (Week 1)

- [ ] **Prompt 작성**
  - [ ] `app/lib/ai/prompts/bulk-import-parser.ts` 생성
  - [ ] 날짜 인식 규칙 정의
  - [ ] Entity 추출 규칙 정의
  - [ ] JSON 출력 포맷 명시

- [ ] **Gemini Provider 확장**
  - [ ] `app/lib/ai/providers/gemini.ts`에 `parseBulkImport()` 메서드 추가
  - [ ] 에러 핸들링
  - [ ] 타임아웃 설정 (30초)

- [ ] **타입 정의**
  - [ ] `types/import.ts` 생성
  - [ ] `ParsedMemo`, `BulkImportParseResult` 등 정의

### Phase 2: API 엔드포인트 (Week 2)

- [ ] **Parse API**
  - [ ] `app/api/import/parse/route.ts` 생성
  - [ ] 텍스트 길이 검증 (100,000자)
  - [ ] Gemini 호출 및 JSON 파싱
  - [ ] 에러 응답 포맷

- [ ] **Execute API**
  - [ ] `app/api/import/execute/route.ts` 생성
  - [ ] Entity Batch 조회/생성
  - [ ] Memo Batch Insert
  - [ ] memo_entity 관계 생성
  - [ ] 트랜잭션 에러 처리

### Phase 3: UI 컴포넌트 (Week 3)

- [ ] **페이지**
  - [ ] `app/import/page.tsx` 생성
  - [ ] Header, 인증 체크

- [ ] **컴포넌트**
  - [ ] `ImportPage.tsx` - Step 관리
  - [ ] `TextInput.tsx` - 텍스트 입력
  - [ ] `ParsePreview.tsx` - 결과 미리보기
  - [ ] `ImportProgress.tsx` - 로딩 상태
  - [ ] `ResultSummary.tsx` - 완료 화면

- [ ] **디자인 시스템 적용**
  - [ ] defaultTheme 사용
  - [ ] Radix UI 적용 (필요 시)
  - [ ] 반응형 레이아웃

### Phase 4: 테스트 & 최적화 (Week 4)

- [ ] **통합 테스트**
  - [ ] 다양한 날짜 형식 테스트
  - [ ] Entity 추출 정확도 검증
  - [ ] 대용량 데이터 (100+ 메모) 테스트

- [ ] **성능 최적화**
  - [ ] Gemini API 응답 시간 모니터링
  - [ ] DB Batch Insert 최적화
  - [ ] Rate Limiting 구현

- [ ] **에러 처리**
  - [ ] Gemini API 실패 시 재시도
  - [ ] DB 트랜잭션 롤백
  - [ ] 사용자 친화적 에러 메시지

---

## 7. 환경 변수

**.env.local에 추가:**

```bash
# Gemini API (기존)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash-exp

# AI Provider 설정 (기존)
AI_PROVIDER=gemini
AI_TIMEOUT=30000  # 30초 (대용량 파싱용)
```

---

## 8. 제약사항 및 성능

### 8.1 제한사항

- **텍스트 길이**: 최대 100,000자
- **메모 개수**: 최대 500개
- **Gemini API Timeout**: 30초
- **Rate Limiting**: 1시간당 5회 import (사용자당)

### 8.2 성능 목표

- **파싱 시간**: 평균 5초 (100개 메모 기준)
- **저장 시간**: 평균 3초 (100개 메모 기준)
- **전체 프로세스**: 10초 이내

---

## 9. 향후 확장 계획

### Phase 2 기능

- [ ] **파일 업로드 지원**
  - Markdown (.md)
  - Plain Text (.txt)
  - JSON (구조화된 데이터)

- [ ] **고급 파싱 옵션**
  - 사건별 분리 (빈 줄 기준)
  - Entity 타입 힌트 제공

- [ ] **중복 감지**
  - 유사한 메모 내용 감지
  - 병합 또는 건너뛰기 옵션

### Phase 3 기능

- [ ] **Export 기능**
  - 선택한 메모를 텍스트로 Export
  - 날짜 범위 필터링

- [ ] **AI 기반 개선**
  - 메모 요약 자동 생성
  - Entity 관계 자동 추론

---

## 10. 예제 데이터

### 입력 예시

```text
2024-12-01
오늘은 @김철수님과 @스타벅스에서 @프로젝트A에 대해 논의했다.
다음 주까지 기획서를 완성하기로 했고, @이영희님께 디자인을 요청하기로 했다.

어제
@회의 참석. @마케팅팀과 @개발팀이 함께 브레인스토밍을 진행했다.
@신제품 아이디어가 여러 개 나왔고, 그중 3개를 선정했다.

오늘
@프로젝트A 기획서 초안 작성 완료.
@김철수님께 리뷰 요청 메일을 보냈다.
```

### Gemini 출력 예시

```json
{
  "memos": [
    {
      "date": "2024-12-01",
      "content": "오늘은 @김철수님과 @스타벅스에서 @프로젝트A에 대해 논의했다.\n다음 주까지 기획서를 완성하기로 했고, @이영희님께 디자인을 요청하기로 했다.",
      "entities": ["김철수", "스타벅스", "프로젝트A", "이영희"]
    },
    {
      "date": "2024-11-30",
      "content": "@회의 참석. @마케팅팀과 @개발팀이 함께 브레인스토밍을 진행했다.\n@신제품 아이디어가 여러 개 나왔고, 그중 3개를 선정했다.",
      "entities": ["회의", "마케팅팀", "개발팀", "신제품"]
    },
    {
      "date": "2024-12-01",
      "content": "@프로젝트A 기획서 초안 작성 완료.\n@김철수님께 리뷰 요청 메일을 보냈다.",
      "entities": ["프로젝트A", "김철수"]
    }
  ],
  "stats": {
    "totalMemos": 3,
    "totalEntities": 8,
    "uniqueEntities": 7,
    "dateRange": ["2024-11-30", "2024-12-01"]
  }
}
```

---

**문서 끝**
