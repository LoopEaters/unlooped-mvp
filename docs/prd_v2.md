# Unlooped MVP - Product Requirements Document v2

## 문서 정보
- **버전**: 2.0
- **최종 수정일**: 2025-12-01
- **작성자**: Product Team

---

## 1. 개요

본 프로젝트는 제텔카스텐 방법론을 일기 작성에 적용하여 이용자가 작성한 일기로부터 아이디어를 얻고 추가적인 효용을 얻을 수 있도록 돕기 위해 기획되었다.

### 핵심 개념
- **Memo**: 사용자가 작성하는 글의 최소 단위
- **Entity**: 메모에 태그처럼 연결되는 키워드 (@ 기호로 입력)
- **클라우드 기반**: 모든 데이터는 즉시 Supabase DB에 저장되며 로컬 저장소를 사용하지 않음

---

## 2. 기술 스택

- **언어**: TypeScript
- **프레임워크**: Next.js 14 (App Router)
- **UI 라이브러리**: React 18
- **스타일링**: Tailwind CSS 4
- **컴포넌트**: Radix UI, Lucide React (아이콘)
- **상태 관리 & 데이터 페칭**: TanStack React Query v5
- **백엔드/데이터베이스**: Supabase
- **배포**: Vercel
- **코드 품질**: Prettier, ESLint

---

## 3. 화면 구성

### 3.1 페이지 구조
초기 MVP는 2개의 페이지로 구성:
1. **로그인/회원가입 페이지** (`/login`)
2. **메인 페이지** (`/`)

### 3.2 메인 페이지 레이아웃

```
┌─────────────────────────────────────────────────────────┐
│  Header (로그아웃 버튼 등)                                │
├──────────────────────────────────┬──────────────────────┤
│                                  │                      │
│  메모 작성 섹션 (70%)             │  히스토리 섹션 (30%) │
│  ┌────────────────────────────┐  │                      │
│  │ 엔티티 목록 섹션            │  │  - 최근 메모 표시    │
│  │ (작성 중인 entity 관련)     │  │  - 시간순 정렬       │
│  └────────────────────────────┘  │  - 스크롤 가능       │
│  ┌────────────────────────────┐  │  - 디폴트: 맨 아래   │
│  │ Input 창                    │  │                      │
│  │ (contentEditable)           │  │                      │
│  └────────────────────────────┘  │                      │
│                                  │                      │
└──────────────────────────────────┴──────────────────────┘
```

#### 레이아웃 상세
- **메모 작성 섹션**: 좌측 70% 차지
- **히스토리 섹션**: 우측 30% 차지
- **엔티티 목록 섹션**: Input 창 위에 위치, 작성 중인 entity와 관련된 기록 표시
- **Input 창**: 메모 작성 섹션 하단

---

## 4. 핵심 기능

### 4.1 사용자 인증 (User Auth)

#### 4.1.1 인증 방식
- **OAuth 프로바이더**: Google OAuth (Supabase Auth 사용)
- 향후 다른 프로바이더 추가 가능 (GitHub, Email/Password 등)

#### 4.1.2 회원가입 프로세스
1. 사용자가 Google OAuth로 로그인
2. Supabase Auth에 사용자 계정 생성 (`auth.users`)
3. 동시에 `public.users` 테이블에 사용자 레코드 자동 생성
   - `id`: `auth.users.id`와 동일 (FK 관계, ON DELETE CASCADE)
   - 기타 필요한 사용자 메타데이터

#### 4.1.3 인증 상태 체크
- **URL 변경 시마다** 로그인 상태 검증
- 미인증 사용자는 `/login` 페이지로 강제 리다이렉트
- AuthProvider를 통한 전역 인증 상태 관리

---

### 4.2 메모 작성 (Memo Creation)

#### 4.2.1 기본 동작 흐름

```
1. 사용자가 Input 창에 메모 내용 입력
2. @ 입력 시 Entity 자동완성 트리거
3. Entity 선택/생성
4. Enter 또는 Submit 버튼으로 메모 저장
5. DB에 memo 저장 및 memo_entity 관계 생성
6. Input 창 자동 초기화
7. 히스토리 섹션에 새 메모 즉시 반영
```

#### 4.2.2 Input 창 상세

**기술 구현**:
- `contentEditable` div 사용 (rich text 편집 가능)
- 플레이스홀더: "메모를 작성하세요... (@로 엔티티 추가)"

**동작**:
- **메모 작성 완료 후**: Input 창 자동 초기화 (비우기)
- **메모 최대 길이**: 제한 없음 (TODO: 필요시 추가)
- **엔터 키 동작**: 메모 저장 (Shift+Enter는 줄바꿈)

#### 4.2.3 Entity 입력 시스템

**트리거**: `@` 문자 입력

**동작 시퀀스**:
```
1. @ 입력 감지
2. 위를 향한 드롭다운 표시 (dropup)
3. 사용자가 entity 이름 입력 시작
4. 캐시된 전체 entity 리스트에서 실시간 필터링
   - 입력한 문자열로 시작하는 entity만 표시
   - 예: "@pro" → "project1", "project2", "project3"
5. 드롭다운에서 entity 선택 (키보드 방향키 또는 마우스 클릭)
6. 스페이스바 입력 시 entity 확정
```

**Entity 확정 (스페이스바 입력 시)**:
- **기존 entity인 경우**:
  - 해당 entity로 자동완성
  - 드롭다운 닫힘
- **새 entity인 경우**:
  - 즉시 DB에 새 entity 생성 (확인 모달 없음)
  - UI에 "새 엔티티가 생성되었습니다" 토스트 메시지 표시
  - 캐시 즉시 업데이트
  - 드롭다운 닫힘

**다중 Entity**:
- 하나의 메모에 여러 entity 추가 가능
- 예: "@project1 오늘 @meeting에서 논의한 내용"
- 각 entity마다 @ 입력 후 위 프로세스 반복

#### 4.2.4 메모 저장 프로세스

**데이터베이스 작업**:
1. `memo` 테이블에 새 레코드 삽입
   - `user_id`: 현재 로그인한 사용자 ID
   - `content`: 메모 전체 내용 (@ 포함)
   - `created_at`: 현재 시간 (자동)

2. 정규표현식으로 메모 내용에서 `@entity_name` 패턴 추출
   ```regex
   /@([가-힣a-zA-Z0-9]+)/g
   ```

3. 추출된 각 entity에 대해:
   - `entity` 테이블에서 해당 이름의 entity 조회
   - `memo_entity` 테이블에 관계 삽입
     - `memo_id`: 방금 생성한 memo ID
     - `entity_id`: 조회한 entity ID

**에러 처리**:
- 네트워크 오류: 전역 토스트로 "메모 저장 실패. 다시 시도해주세요." 표시
- Entity 매칭 실패: 이론상 발생 불가 (스페이스바 확정 시 entity 생성 보장)

#### 4.2.5 CRUD 구현 범위

**Phase 1 (현재 MVP)**:
- ✅ Create (생성)
- ✅ Read (조회)

**Phase 2 (TODO)**:
- ⏳ Update (수정) - 메모 클릭 시 수정 모드
- ⏳ Delete (삭제) - 메모 삭제 기능

---

### 4.3 Entity 관리

#### 4.3.1 Entity 캐싱 전략

**초기 로드**:
- 메인 페이지 진입 시 현재 유저의 **전체 Entity 리스트** 조회
- TanStack Query로 캐싱
  - `staleTime`: 3분 (180,000ms)
  - `cacheTime`: 5분 (300,000ms)
- 조회 데이터: `{ id: string, name: string }[]`

**캐시 무효화**:
- 새 entity 생성 시 즉시 캐시 업데이트 (optimistic update)
- 다른 디바이스에서의 변경은 staleTime 후 자동 재조회

#### 4.3.2 Entity 자동완성

**Zero Latency 검색**:
- 서버 요청 없이 **미리 로드된 리스트 필터링**
- 클라이언트 사이드 `startsWith()` 검색
  ```typescript
  const filtered = entities.filter(e =>
    e.name.startsWith(userInput)
  )
  ```

**드롭다운 UI**:
- **위치**: Input 창 위 (dropup)
- **최대 표시 개수**: 5개 (TODO: 조정 가능)
- **스타일**: 배경 반투명, 선택된 항목 하이라이트
- **키보드 네비게이션**:
  - 위/아래 방향키로 선택 이동
  - Enter 또는 Tab으로 선택 확정
  - Esc로 드롭다운 닫기

**매칭 entity가 없을 때**:
- 입력 중인 텍스트를 드롭다운에 흐릿하게 표시
- 예: "@newentity" (흐릿한 회색)
- 스페이스바 누르면 자동으로 새 entity 생성

#### 4.3.3 Entity 생성 규칙

**이름 규칙**:
- **허용 문자**: 한글, 영문, 숫자만
- **금지 문자**: 공백, 특수문자 (-, _, @, # 등 모두 금지)
- **최소 길이**: 1자
- **최대 길이**: 20자
- **중복**: 동일한 이름의 entity는 1개만 존재 (대소문자 구분)

**유효성 검사**:
```typescript
const isValidEntityName = (name: string): boolean => {
  const regex = /^[가-힣a-zA-Z0-9]{1,20}$/
  return regex.test(name)
}
```

**생성 피드백**:
- 스페이스바 확정 시 토스트 메시지:
  - 성공: "✨ 새 엔티티 '{entity_name}'이(가) 생성되었습니다"
  - 실패: "❌ 엔티티 생성 실패. 다시 시도해주세요"

#### 4.3.4 Entity와 히스토리 연동

**기본 동작**:
- 엔티티 목록 섹션은 **현재 작성 중인 entity와 관련된 메모**를 표시
- @ 입력 후 entity 이름 입력 중에 해당 entity가 포함된 메모 표시

**실시간 필터링** (TODO: 우선순위 높음):
- @ 입력 후 문자 입력할 때마다 히스토리 섹션 실시간 업데이트
- 예: "@pro" 입력 시 → "project1", "project2", "project3" 관련 메모 모두 표시
- 구현 불가 시 스페이스바 확정 후 필터링

**필터링 쿼리**:
```sql
SELECT m.* FROM memo m
JOIN memo_entity me ON m.id = me.memo_id
JOIN entity e ON me.entity_id = e.id
WHERE e.id IN (filtered_entity_ids)
ORDER BY m.created_at DESC
```

#### 4.3.5 Entity 관리 기능 (TODO - Phase 2)

- ⏳ Entity 이름 수정
- ⏳ Entity 삭제 (연결된 memo와의 관계 처리)
- ⏳ Entity 병합
- ⏳ Entity 색상/아이콘 지정

---

### 4.4 히스토리 섹션 (History Sidebar)

#### 4.4.1 기본 표시 방식

**데이터 로드**:
- 페이지 로드 시 현재 유저의 **전체 메모** 조회
- 정렬: `created_at DESC` (최신순)
- 페이지네이션: Phase 1에서는 미구현, 전체 로드 (TODO: 무한 스크롤 또는 페이지네이션)

**디폴트 스크롤 위치**:
- **맨 아래로 자동 스크롤** (가장 최근 메모가 보이도록)
- 사용자는 위로 스크롤하여 과거 메모 조회

**메모 카드 UI**:
```
┌─────────────────────────┐
│ 2025-12-01 14:32       │  ← 작성 시간
│ @project1 회의에서...  │  ← 메모 내용 (entity 하이라이트)
└─────────────────────────┘
```

#### 4.4.2 메모 표시 상세

**Entity 하이라이트**:
- Entity는 배경색으로 강조 표시
- 색상: 각 entity마다 고유 색상 또는 통일된 accent 색상
- 예: `@project1` → 보라색 배경

**Entity 클릭** (TODO: Phase 2):
- Entity 클릭 시 해당 entity로 히스토리 필터링
- 또는 Entity 상세 모달 표시

**메모 클릭** (TODO: Phase 2):
- 메모 클릭 시 상세 보기 모달 표시
- 모달 내용:
  - 메모 전체 내용
  - 작성 시간
  - 연결된 entity 리스트
  - 수정/삭제 버튼

#### 4.4.3 필터링 동작

**필터 트리거**:
- Input 창에서 @ 입력 후 entity 이름 입력 중
- (TODO) 실시간 필터링 구현 시 타이핑할 때마다 업데이트

**필터 해제**:
- Input 창의 @ 및 entity 내용 삭제 시
- 다시 전체 메모 표시

#### 4.4.4 스크롤 및 성능

**스크롤**:
- 커스텀 스크롤바 (globals.css 참조)
- 부드러운 스크롤 애니메이션

**성능 최적화** (TODO: Phase 2):
- 가상 스크롤 (react-virtual)
- 페이지네이션 또는 무한 스크롤
- 위로 스크롤 시 이전 메모 로드

---

## 5. 데이터베이스 설계

### 5.1 테이블 구조

총 4개의 테이블:
1. `users` - 사용자 정보
2. `memo` - 메모 데이터
3. `entity` - 엔티티 데이터
4. `memo_entity` - 메모-엔티티 다대다 관계

### 5.2 스키마 상세

**참고**: `types/supabase.ts` 파일에서 TypeScript 타입 확인

#### users 테이블
```sql
- id: uuid (PK, FK to auth.users.id, ON DELETE CASCADE)
- email: text
- created_at: timestamp
```

#### memo 테이블
```sql
- id: uuid (PK)
- user_id: uuid (FK to users.id, ON DELETE CASCADE)
- content: text
- created_at: timestamp
```

#### entity 테이블
```sql
- id: uuid (PK)
- user_id: uuid (FK to users.id, ON DELETE CASCADE)
- name: varchar(20) (UNIQUE per user)
- created_at: timestamp
```

#### memo_entity 테이블
```sql
- id: uuid (PK)
- memo_id: uuid (FK to memo.id, ON DELETE CASCADE)
- entity_id: uuid (FK to entity.id, ON DELETE CASCADE)
- created_at: timestamp
- UNIQUE(memo_id, entity_id)
```

### 5.3 인덱스

성능 최적화를 위한 인덱스:
- `memo.user_id` - 사용자별 메모 조회
- `entity.user_id` - 사용자별 엔티티 조회
- `entity.name` - 엔티티 이름 검색
- `memo_entity.memo_id` - 메모의 엔티티 조회
- `memo_entity.entity_id` - 엔티티의 메모 조회

---

## 6. UI/UX 상세 명세

### 6.1 디자인 시스템

**색상 팔레트** (globals.css 참조):
```css
--color-bg-primary: #1a1f2e       /* 메인 배경 */
--color-bg-secondary: #252b3b     /* 카드 배경 */
--color-bg-input: #323847         /* Input 배경 */
--color-border-main: #374151      /* 테두리 */
--color-text-muted: #9ca3af       /* 보조 텍스트 */
--color-mention-project: #a855f7  /* Entity 하이라이트 (보라) */
--color-mention-person: #22c55e   /* Entity 하이라이트 (초록) */
--color-mention-event: #3b82f6    /* Entity 하이라이트 (파랑) */
```

**타이포그래피**:
- 본문: 16px, line-height 1.5
- 메모 시간: 12px, text-muted
- Entity: 14px, font-weight 500

**간격**:
- 섹션 간 여백: 24px
- 카드 내부 패딩: 16px
- 메모 카드 간격: 12px

### 6.2 인터랙션

**Input 창**:
- Focus 시 테두리 하이라이트
- @ 입력 시 드롭다운 애니메이션 (slide-up)
- Entity 확정 시 하이라이트 효과

**드롭다운**:
- 키보드 선택 시 하이라이트
- 호버 시 배경색 변경
- 애니메이션: fade-in + slide-up (200ms)

**메모 카드**:
- 호버 시 배경색 살짝 밝게
- 클릭 시 scale 효과 (TODO: Phase 2)

**스크롤**:
- 부드러운 스크롤 (smooth scrolling)
- 커스텀 스크롤바 (6px 너비)

### 6.3 반응형 디자인 (TODO: Phase 2)

현재 MVP는 **데스크톱 전용** (1280px 이상 권장)

향후 모바일/태블릿 지원:
- 모바일: 히스토리 섹션을 하단 시트로 전환
- 태블릿: 좌우 비율 조정 (60% - 40%)

---

## 7. 에러 처리 및 피드백

### 7.1 전역 에러 처리

**구현 방식**:
- 클라이언트 사이드 전역 Toast Provider
- React Query의 `onError` 콜백 활용
- Supabase 에러 코드별 메시지 매핑

**Toast 메시지 라이브러리**:
- Radix UI Toast 또는 Sonner 라이브러리 사용
- 위치: 화면 우측 상단
- 지속 시간: 3초 (에러는 5초)

### 7.2 에러 시나리오 및 메시지

| 에러 상황 | Toast 메시지 | 추가 동작 |
|----------|-------------|----------|
| 메모 저장 실패 | "메모 저장에 실패했습니다. 다시 시도해주세요." | Input 내용 유지 |
| Entity 생성 실패 | "엔티티 생성에 실패했습니다." | - |
| 네트워크 오류 | "네트워크 연결을 확인해주세요." | - |
| 인증 오류 | "로그인이 필요합니다." | `/login` 리다이렉트 |
| 권한 오류 | "접근 권한이 없습니다." | - |

### 7.3 성공 피드백

| 액션 | Toast 메시지 |
|-----|-------------|
| 메모 작성 | "메모가 저장되었습니다." (선택적) |
| Entity 생성 | "✨ 새 엔티티 '{name}'이(가) 생성되었습니다" |

### 7.4 로딩 상태

**로딩 인디케이터**:
- 전체 페이지 로드: 중앙 스피너
- 메모 제출: Submit 버튼에 스피너 + disabled
- 히스토리 로드: 스켈레톤 UI (메모 카드 형태)

**스켈레톤 UI**:
```
┌─────────────────────────┐
│ ▓▓▓▓▓▓▓▓ ░░░░░░        │  ← 시간 스켈레톤
│ ░░░░░░░░░░░░░░░░░░░░░  │  ← 내용 스켈레톤
│ ░░░░░░░░░░░░░░         │
└─────────────────────────┘
```

---

## 8. 개발 우선순위 및 TODO

### 8.1 Phase 1 - MVP (현재 구현 목표)

**필수 기능**:
- ✅ Google OAuth 로그인/회원가입
- ✅ 메모 작성 (Create)
- ✅ Entity 자동완성 및 생성
- ✅ 히스토리 조회 (최근 메모 표시)
- ✅ 전역 에러 처리 (Toast)

**제외 사항** (TODO로 관리):
- ⏳ 메모 수정/삭제
- ⏳ 메모 클릭 시 상세 모달
- ⏳ Entity 클릭 시 필터링
- ⏳ 히스토리 페이지네이션 (현재: 전체 로드)
- ⏳ 실시간 히스토리 필터링 (@ 입력 중)
- ⏳ Entity 관리 (수정/삭제/병합)
- ⏳ 반응형 디자인

### 8.2 Phase 2 - 사용성 개선

**우선순위 1** (높음):
1. 실시간 히스토리 필터링 (@ 입력 중)
2. 히스토리 페이지네이션 또는 무한 스크롤
3. 메모 클릭 시 상세 보기 모달
4. Entity 클릭 시 필터링 기능

**우선순위 2** (중간):
5. 메모 수정 기능
6. 메모 삭제 기능
7. Entity 이름 수정
8. Entity 삭제

**우선순위 3** (낮음):
9. 반응형 디자인 (모바일/태블릿)
10. Entity 색상/아이콘 커스터마이징
11. 메모 검색 기능
12. 메모 내보내기 (export)

### 8.3 Phase 3 - 고급 기능

- 메모 간 연결 (backlink)
- 그래프 뷰 (entity 관계도)
- AI 기반 메모 추천
- 협업 기능 (공유 entity)

---

## 9. API 엔드포인트 (Supabase RPC)

### 9.1 Memo API

```typescript
// 메모 생성
async function createMemo(content: string): Promise<Memo>

// 메모 조회 (사용자별, 최신순)
async function getMemos(userId: string): Promise<Memo[]>

// 메모 조회 (entity 필터)
async function getMemosByEntity(entityId: string): Promise<Memo[]>

// 메모 수정 (TODO)
async function updateMemo(id: string, content: string): Promise<Memo>

// 메모 삭제 (TODO)
async function deleteMemo(id: string): Promise<void>
```

### 9.2 Entity API

```typescript
// Entity 전체 조회 (사용자별)
async function getEntities(userId: string): Promise<Entity[]>

// Entity 생성
async function createEntity(name: string): Promise<Entity>

// Entity 조회 (이름으로)
async function getEntityByName(name: string): Promise<Entity | null>

// Entity 수정 (TODO)
async function updateEntity(id: string, name: string): Promise<Entity>

// Entity 삭제 (TODO)
async function deleteEntity(id: string): Promise<void>
```

### 9.3 MemoEntity API

```typescript
// Memo-Entity 관계 생성
async function linkMemoEntity(memoId: string, entityId: string): Promise<void>

// Memo의 Entity 목록 조회
async function getEntitiesByMemo(memoId: string): Promise<Entity[]>

// Entity의 Memo 목록 조회
async function getMemosByEntity(entityId: string): Promise<Memo[]>
```

---

## 10. 성능 목표

### 10.1 로딩 시간
- 초기 페이지 로드: < 2초
- 메모 저장 응답: < 500ms
- Entity 자동완성: < 50ms (클라이언트 필터링)

### 10.2 캐싱 전략
- Entity 리스트: 3분 stale time
- Memo 리스트: 1분 stale time
- Optimistic updates 활용 (즉시 UI 반영)

### 10.3 Bundle 크기
- 초기 번들: < 200KB (gzipped)
- TanStack Query, Radix UI 등 tree-shaking 최적화

---

## 11. 보안 고려사항

### 11.1 Row Level Security (RLS)

Supabase RLS 정책 적용:

```sql
-- users: 본인 데이터만 조회
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- memo: 본인 메모만 CRUD
CREATE POLICY "Users can manage own memos"
  ON memo FOR ALL
  USING (auth.uid() = user_id);

-- entity: 본인 entity만 CRUD
CREATE POLICY "Users can manage own entities"
  ON entity FOR ALL
  USING (auth.uid() = user_id);

-- memo_entity: 본인 메모의 관계만 관리
CREATE POLICY "Users can manage own memo_entity"
  ON memo_entity FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM memo
      WHERE memo.id = memo_entity.memo_id
        AND memo.user_id = auth.uid()
    )
  );
```

### 11.2 입력 검증

**클라이언트 사이드**:
- Entity 이름: 정규표현식 검증 (`/^[가-힣a-zA-Z0-9]{1,20}$/`)
- 메모 내용: XSS 방지 (React의 기본 escape 활용)

**서버 사이드** (Supabase):
- VARCHAR 길이 제한
- UNIQUE 제약 조건
- FK 무결성 검사

### 11.3 환경 변수 관리

```env
# 클라이언트 노출 가능
NEXT_PUBLIC_SUPABASE_URL=https://xlovwwdppjfsbuzibctk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# 서버 전용 (노출 금지)
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 12. 테스트 전략 (TODO: Phase 2)

### 12.1 단위 테스트
- 유틸리티 함수 (정규표현식, 검증 로직)
- React Query 훅
- 컴포넌트 단위 테스트

### 12.2 통합 테스트
- 메모 작성 플로우
- Entity 생성 및 연결
- 인증 플로우

### 12.3 E2E 테스트
- Playwright 또는 Cypress
- 주요 사용자 시나리오 커버

---

## 13. 배포 및 모니터링

### 13.1 배포
- **플랫폼**: Vercel
- **브랜치 전략**:
  - `main`: 프로덕션
  - `dev`: 스테이징
- **CI/CD**: Vercel 자동 배포

### 13.2 모니터링 (TODO)
- Vercel Analytics
- Sentry (에러 추적)
- Supabase Dashboard (DB 모니터링)

---

## 14. 참고 문서

- **타입 정의**: `types/supabase.ts`
- **프로젝트 가이드**: `CLAUDE.md`
- **Supabase 스키마**: Supabase Dashboard
- **컴포넌트 구조**: `app/components/`

---

## 부록 A: 용어 정의

| 용어 | 정의 |
|-----|------|
| Memo | 사용자가 작성하는 글의 최소 단위 |
| Entity | 메모에 연결되는 태그 형태의 키워드 (@ 기호로 입력) |
| Dropup | 위쪽으로 펼쳐지는 드롭다운 (Input 창 위에 표시) |
| Optimistic Update | 서버 응답 전에 UI를 먼저 업데이트하는 기법 |
| RLS | Row Level Security, Supabase의 행 단위 보안 정책 |

---

## 부록 B: 변경 이력

| 버전 | 날짜 | 변경 내용 |
|-----|------|----------|
| 1.0 | 2025-11-XX | 초기 PRD 작성 |
| 2.0 | 2025-12-01 | 상세 기능 명세 추가, UI/UX 구체화, TODO 리스트 정리 |

---

**문서 종료**
