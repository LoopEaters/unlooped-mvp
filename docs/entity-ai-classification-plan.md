# Entity 타입 자동 분류 시스템 구현 계획

> 작성일: 2025-12-02
> 상태: 구현 중

## 목표

Entity 생성 시 Gemini AI를 사용하여 자동으로 사람(person)인지 프로젝트(project)인지 분류하고, 사용자가 필요시 수정할 수 있는 UI 제공

## 핵심 요구사항

### 사용자 선택 사항
- ✅ **AI Provider**: Gemini (기본)
- ✅ **처리 방식**: 비동기 (Entity 생성 후 백그라운드 분류 → UI 자동 업데이트)
- ✅ **캐싱**: 동일 이름 재생성 시 캐싱된 결과 사용
- ✅ **수동 수정**: AI 분류 결과를 드롭다운으로 수정 가능 (person/project/unknown)

## 아키텍처 개요

```
사용자 입력 (@entity)
    ↓
Entity 생성 (type: null)
    ↓ [즉시 반환 - Non-blocking]
사용자는 Entity 바로 사용 가능
    ↓ [백그라운드]
AI 분류 (Gemini API)
    ↓
캐싱 + DB 업데이트 (type 설정)
    ↓
React Query 캐시 무효화
    ↓
UI 자동 업데이트 (색깔 변경)
```

### Factory 패턴 기반 AI Provider 구조

```
app/lib/ai/
├── types.ts              # 타입 정의 (EntityType enum, AIProvider interface)
├── factory.ts            # AI Provider Factory (싱글톤)
├── index.ts              # 공개 API (classifyEntityType 함수)
├── cache.ts              # LRU 캐시 (이름 → 타입 매핑)
├── providers/
│   ├── base.ts           # BaseAIProvider 추상 클래스
│   ├── gemini.ts         # GeminiProvider 구현체
│   └── openai.ts         # OpenAIProvider 구현체 (향후 확장)
└── prompts/
    └── entity-classifier.ts  # 프롬프트 템플릿
```

## 중요 발견사항 ⚠️

### 기존 색깔 시스템
프로젝트에 이미 Entity 타입별 색깔이 `app/globals.css`에 정의되어 있습니다:

```css
--color-mention-project: #a855f7;  /* 보라색 */
--color-mention-person: #22c55e;   /* 초록색 */
--color-mention-event: #3b82f6;    /* 파란색 */
```

### 현재 구현 상태
- `app/lib/utils/highlightEntities.tsx`: 모든 Entity를 `text-mention-project` (보라색)로 표시
- Entity의 `type` 정보를 받지 못해서 색깔 구분 불가
- **수정 필요**: Entity 데이터를 함께 받아서 type별 색깔 적용

### 기존 기능 영향도 분석
다음 컴포넌트들이 `highlightEntities` 함수를 사용 중:
- `app/components/MemoCard.tsx`: 메모 내용에서 Entity 하이라이트
- `app/components/InputArea.tsx`: 입력 중 Entity 하이라이트

**⚠️ 주의사항**: `highlightEntities` 함수 시그니처 변경 시 위 컴포넌트들도 함께 수정 필요

## 핵심 설계 결정

### 1. 비동기 처리 (Non-blocking)
- Entity 생성과 AI 분류를 분리하여 사용자 경험 최적화
- 사용자는 즉시 Entity를 사용할 수 있음
- AI 분류는 백그라운드에서 진행 → 완료 시 UI 자동 업데이트

### 2. Factory 패턴
- 기존 Supabase 클라이언트 패턴과 일관성 유지
- 환경 변수로 Provider 런타임 전환
- 향후 Anthropic, local LLM 등 확장 용이

### 3. 캐싱 전략
- 동일 이름 재생성 시 API 호출 없이 즉시 응답
- LRU 방식으로 최대 100개 캐싱
- 메모리 사용량과 성능 균형

### 4. 에러 처리
- AI 실패해도 Entity 생성은 성공
- type은 null 또는 unknown으로 유지
- 사용자는 드롭다운으로 수동 수정 가능

### 5. UI 반응성
- React Query 캐시 무효화로 자동 업데이트
- Entity type별 색깔 구분 (**기존 globals.css 색깔 활용**):
  - person: 초록 (`mention-person: #22c55e`)
  - project: 보라 (`mention-project: #a855f7`)
  - unknown/null: 회색 (`text-muted`)
- 드롭다운으로 언제든 수정 가능

## 단계별 구현 계획

### Phase 1: AI Provider 인프라 구축 (독립 테스트 가능)
1. 타입 정의 (`app/lib/ai/types.ts`)
2. Base Provider (`app/lib/ai/providers/base.ts`)
3. Gemini Provider (`app/lib/ai/providers/gemini.ts`)
4. 프롬프트 & 캐시 (`app/lib/ai/prompts/`, `app/lib/ai/cache.ts`)
5. Factory & Public API (`app/lib/ai/factory.ts`, `app/lib/ai/index.ts`)

### Phase 2: Entity 생성 플로우 통합
6. `app/lib/queries.ts` 수정 (createEntityDirect 함수에 AI 분류 통합)
7. 동작 테스트

### Phase 3: UI 개선 (기존 기능 영향 최소화)
8. `app/lib/utils/highlightEntities.tsx` 수정 (Entity 배열 파라미터 추가)
9. `app/components/MemoCard.tsx` 수정 (entities 전달)
10. `app/components/InputArea.tsx` 수정 (entities 전달)
11. Entity type 드롭다운 컴포넌트 생성 (선택적)
12. UI 반응형 업데이트 확인

### Phase 4: OpenAI Provider 추가 (확장성 검증)
13. OpenAI Provider 구현 및 테스트

## 주요 파일 경로

### 수정할 파일
- `app/lib/queries.ts` (라인 254-283)
- `app/lib/utils/highlightEntities.tsx`
- `app/components/MemoCard.tsx`
- `app/components/InputArea.tsx`

### 새로 생성할 파일
- `app/lib/ai/types.ts`
- `app/lib/ai/providers/base.ts`
- `app/lib/ai/providers/gemini.ts`
- `app/lib/ai/providers/openai.ts`
- `app/lib/ai/prompts/entity-classifier.ts`
- `app/lib/ai/cache.ts`
- `app/lib/ai/factory.ts`
- `app/lib/ai/index.ts`
- `app/components/EntityTypeDropdown.tsx`

## 환경 변수 설정

### `.env.local`에 추가

```bash
# === AI Provider 설정 ===
AI_PROVIDER=gemini
AI_TIMEOUT=5000

# === Gemini API 키 ===
# https://ai.google.dev/gemini-api/docs/api-key 에서 발급
GEMINI_API_KEY=AIza...

# 모델 (선택적, 기본값: gemini-2.0-flash-exp)
GEMINI_MODEL=gemini-2.0-flash-exp

# === OpenAI (향후 확장용) ===
# OPENAI_API_KEY=sk-...
# OPENAI_MODEL=gpt-4o-mini
```

## 성공 기준

- ✅ Entity 생성 시 사용자 대기 시간 없음 (즉시 사용 가능)
- ✅ AI 분류 성공 시 1-3초 내 UI 자동 업데이트
- ✅ 동일 이름 재생성 시 즉시 타입 설정 (캐싱)
- ✅ AI 실패 시에도 Entity 정상 생성
- ✅ 사용자가 드롭다운으로 언제든 type 수정 가능
- ✅ Gemini ↔ OpenAI 전환 시 코드 수정 없이 환경 변수만 변경
- ✅ **기존 메모 작성/조회 기능 정상 동작** (회귀 테스트 통과)

## 🚨 기존 기능 보호 체크리스트

### 1. highlightEntities 함수 변경 영향
**변경 전**: `highlightEntities(content: string)`
**변경 후**: `highlightEntities(content: string, entities: Entity[] = [])`

**하위 호환성**:
- `entities` 파라미터 기본값 `[]`로 설정하여 기존 호출도 동작
- 단, entities 없으면 모든 Entity가 회색으로 표시됨

### 2. Entity 생성 플로우
**보장해야 할 것**:
- ✅ Entity가 정상 생성되어야 함
- ✅ 메모-Entity 연결(memo_entity)이 정상 동작해야 함
- ✅ AI 실패해도 위 기능들은 정상 동작

### 3. 색깔 시스템
**주의**:
- ✅ 기존 색깔 정의 유지 (globals.css 수정 안 함)
- ✅ 새로운 색깔 추가 안 함 (기존 것 재사용)

### 4. 테스트 시나리오
구현 완료 후 반드시 테스트:

1. **메모 작성 + Entity 생성**
   - @홍길동 입력 → 메모 저장
   - Entity가 즉시 생성되는지 확인
   - 1-3초 후 Entity 색깔이 회색 → 초록으로 변하는지 확인

2. **기존 Entity 재사용**
   - 이미 존재하는 @홍길동 입력 → 메모 저장
   - 새 Entity 생성 없이 기존 것 재사용하는지 확인
   - 캐싱으로 인해 즉시 색깔 적용되는지 확인

3. **메모 조회**
   - 메모 목록에서 Entity가 타입별로 색깔 표시되는지 확인
   - person: 초록, project: 보라, unknown: 회색

4. **입력 중 하이라이트**
   - InputArea에서 @entity 입력 시 실시간 하이라이트 확인
   - 색깔이 제대로 적용되는지 확인

5. **AI 실패 시나리오**
   - API 키 없음 또는 네트워크 에러
   - Entity는 정상 생성, type만 null 유지 확인
   - 회색으로 표시되는지 확인

6. **Entity type 수동 수정**
   - 드롭다운에서 type 변경
   - UI가 즉시 업데이트되는지 확인

## 예상 동작 플로우

1. 사용자가 `@홍길동`을 입력하고 메모 저장
2. `createEntityDirect('홍길동', userId)` 호출
3. Entity INSERT (id: uuid-123, name: '홍길동', type: null)
4. **즉시 반환** → 사용자는 Entity 사용 가능 (회색 표시)
5. 백그라운드: `classifyAndUpdateEntityType(uuid-123, '홍길동')` 호출
6. 캐시 확인 → 없음
7. Gemini API 호출 (1-2초)
8. 응답: `{type: 'person', confidence: 0.95}`
9. 캐싱: `entityTypeCache.set('홍길동', 'person')`
10. DB UPDATE: `entity.type = 'person'` WHERE id = uuid-123
11. React Query 캐시 무효화
12. **UI 자동 업데이트** → 회색에서 초록으로 변경
13. 사용자가 필요시 드롭다운 클릭하여 type 수정 가능

---

상세 구현 내용은 원본 계획 파일을 참고하세요: `C:\Users\wondo\.claude\plans\bubbly-churning-hopper.md`
