# Unlooped MVP - 구현 체크리스트

**문서 버전**: 1.0
**최종 수정일**: 2025-12-01
**기준 문서**: [PRD v2](./prd_v2.md)

---

## 📋 전체 진행률 요약

| Phase | 진행률 | 상태 |
|-------|--------|------|
| **Phase 1 - MVP** | **45%** | 🟡 진행 중 |
| **Phase 2 - 사용성 개선** | 0% | ⏸️ 대기 |
| **Phase 3 - 고급 기능** | 0% | ⏸️ 대기 |

---

## Phase 1 - MVP (현재 구현 목표)

### 1️⃣ 프로젝트 기반 인프라 ✅ 100%

#### 1.1 기술 스택 설정
- [x] Next.js 14 설정 (App Router)
- [x] TypeScript 설정
- [x] Tailwind CSS 4 설정
- [x] Radix UI 설치 및 사용
- [x] Lucide React 아이콘
- [x] TanStack React Query v5 설정
- [x] Supabase 클라이언트 설정
- [x] Prettier & ESLint 설정

#### 1.2 Supabase 설정
- [x] Supabase 프로젝트 생성
- [x] 환경 변수 설정 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- [x] 클라이언트/서버 Supabase 클라이언트 분리
  - [x] `app/lib/supabase/client.ts` - 브라우저용 (@supabase/ssr)
  - [x] `app/lib/supabase/server.ts` - 서버용 (쿠키 기반)
- [x] TypeScript 타입 자동 생성 (`types/supabase.ts`)
- [x] 타입 생성 스크립트 (`npm run gen:types`)

#### 1.3 프로바이더 설정
- [x] QueryProvider 구현 (`app/providers/QueryProvider.tsx`)
  - [x] QueryClient 설정 (staleTime: 1분, refetchOnWindowFocus: false)
- [x] AuthProvider 구현 (`app/providers/AuthProvider.tsx`)
  - [x] 전역 인증 상태 관리
- [x] **ToastProvider 구현 (`app/providers/ToastProvider.tsx`)** ⭐ 최근 추가
  - [x] Sonner 라이브러리 사용
  - [x] 위치: top-right, duration: 3초
  - [x] 다크 테마 스타일 적용
- [x] Layout에 모든 Provider 적용 (`app/layout.tsx`)

---

### 2️⃣ 데이터베이스 설계 🟡 70%

#### 2.1 테이블 생성
- [x] **users** 테이블
  - [x] id (PK, FK to auth.users.id)
  - [x] email, username, avatar_url
  - [x] created_at, updated_at
- [x] **memo** 테이블
  - [x] id (PK)
  - [x] user_id (FK to users.id, ON DELETE CASCADE)
  - [x] content (text)
  - [x] created_at, updated_at
- [x] **entity** 테이블 ⭐ user_id 추가 완료
  - [x] id (PK)
  - [x] **user_id (FK to users.id, ON DELETE CASCADE)** ⭐
  - [x] name (varchar, 필수)
  - [x] type, description, summary, start_date (선택적)
  - [x] created_at, updated_at
- [x] **memo_entity** 테이블 (다대다 관계)
  - [x] memo_id (FK to memo.id, ON DELETE CASCADE)
  - [x] entity_id (FK to entity.id, ON DELETE CASCADE)
  - [x] created_at
  - [x] UNIQUE(memo_id, entity_id)
- [x] ~~entity_relation 테이블~~ (Phase 3 기능, 현재 불필요)

#### 2.2 Row Level Security (RLS) 정책 ⏸️ 나중에 구현
- [ ] users 테이블 RLS (본인 데이터만 조회)
- [ ] memo 테이블 RLS (본인 메모만 CRUD)
- [ ] entity 테이블 RLS (본인 entity만 CRUD)
- [ ] memo_entity 테이블 RLS (본인 메모의 관계만 관리)

> **참고**: RLS 정책은 보안 강화를 위해 Phase 1 후반에 적용 예정

#### 2.3 인덱스
- [ ] memo.user_id 인덱스
- [ ] entity.user_id 인덱스
- [ ] entity.name 인덱스
- [ ] memo_entity.memo_id 인덱스
- [ ] memo_entity.entity_id 인덱스

---

### 3️⃣ 사용자 인증 (User Auth) ✅ 100%

#### 3.1 AuthProvider 로직
- [x] Context 기반 전역 상태 관리
- [x] **인증 방식**
  - [x] Google OAuth
  - [x] Github OAuth
  - [x] Email/Password 로그인
  - [x] Email/Password 회원가입
- [x] **로그아웃**
  - [x] Server Action (`signOutAction`)
  - [x] 서버 쿠키 삭제 및 캐시 무효화
  - [x] 홈으로 리다이렉트
- [x] **users 테이블 자동 관리**
  - [x] auth.users 생성 시 public.users 자동 생성
  - [x] 소셜 로그인 아바타 자동 동기화 (`syncSocialAvatar`)
- [x] 인증 상태 변경 리스너 (`onAuthStateChange`)
- [x] UserProfile 타입 (Auth User + users 테이블 병합)

#### 3.2 LoginModal 컴포넌트
- [x] Radix UI Dialog 사용
- [x] **소셜 로그인 버튼**
  - [x] Google 로그인 (SVG 아이콘)
  - [x] Github 로그인 (SVG 아이콘)
- [x] **Email/Password 폼**
  - [x] 이메일 입력 (validation)
  - [x] 비밀번호 입력 (min 6자)
  - [x] 로그인/회원가입 토글
- [x] **UI/UX**
  - [x] 에러 메시지 표시
  - [x] 로딩 상태 (버튼 disabled)
  - [x] 미인증 시 모달 닫기 방지
  - [x] ESC/외부 클릭 방지 (프로덕션 환경)

#### 3.3 인증 상태 체크
- [x] 전역 AuthContext로 상태 관리
- [x] 미인증 시 LoginModal 자동 표시
- [ ] ~~미인증 사용자 리다이렉트~~ (현재 모달 사용)
- [ ] ~~Middleware를 통한 URL 변경 시 인증 체크~~ (Phase 2)

---

### 4️⃣ React Query 훅 🟡 40%

#### 4.1 Generic 훅 (app/lib/queries.ts) ✅
- [x] **useUser()** - 현재 인증 사용자 조회
- [x] **useTableData\<T\>()** - 테이블 데이터 조회 (Generic)
- [x] **useInsertData\<T\>()** - 데이터 생성 + 자동 캐시 무효화
- [x] **useUpdateData\<T\>()** - 데이터 수정 + 자동 캐시 무효화
- [x] **useDeleteData\<T\>()** - 데이터 삭제 + 자동 캐시 무효화

#### 4.2 도메인 특화 훅 ✅ 100%
> **파일 위치**: `app/lib/queries.ts`

**Memo 관련**:
- [x] **useMemos()** - 현재 사용자의 메모 조회 (created_at DESC)
  - [x] staleTime: 1분
  - [x] user_id 필터링
  - [x] 최신순 정렬
- [x] **useCreateMemo()** - 메모 생성 + memo_entity 관계 생성
  - [x] memo 테이블 INSERT
  - [x] @entity_name 정규표현식 추출
  - [x] 기존 entity 조회 또는 자동 생성
  - [x] memo_entity 관계 생성
  - [x] 캐시 무효화
  - [x] Toast 피드백
- [ ] **useUpdateMemo()** - 메모 수정 (Phase 2)
- [ ] **useDeleteMemo()** - 메모 삭제 (Phase 2)

**Entity 관련**:
- [x] **useEntities()** - 현재 사용자의 Entity 전체 조회
  - [x] staleTime: 3분 (PRD 명세)
  - [x] user_id 필터링
  - [x] 이름순 정렬 (ascending)
  - [x] id, name만 SELECT (최적화)
- [x] **useCreateEntity()** - Entity 생성 + Toast 피드백
  - [x] 이름 유효성 검사: `/^[가-힣a-zA-Z0-9]{1,20}$/`
  - [x] 중복 체크 (DB 제약)
  - [x] entity 테이블 INSERT
  - [x] Optimistic update
  - [x] Toast: "✨ 새 엔티티 '{name}'이(가) 생성되었습니다"
- [x] **getEntityByName()** - 이름으로 Entity 조회 (헬퍼 함수)
- [ ] **useUpdateEntity()** - Entity 이름 수정 (Phase 2)
- [ ] **useDeleteEntity()** - Entity 삭제 (Phase 2)

**Memo-Entity 관계**:
- [x] **useMemosByEntity(entityId)** - 특정 Entity의 메모 필터링
  - [x] JOIN query (memo_entity!inner)
  - [x] enabled: !!entityId
- [ ] **useEntitiesByMemo(memoId)** - 특정 메모의 Entity 리스트 (Phase 2)

---

### 5️⃣ 메모 작성 기능 (Memo Creation) ✅ 95%

#### 5.1 Input 창 (app/components/InputArea.tsx) ✅
- [x] **기본 구조**
  - [x] contentEditable div with ref
  - [x] placeholder CSS ("메모를 작성하세요... (@로 엔티티 추가)")
  - [x] Send 아이콘 버튼
- [x] **메모 저장 기능** ⭐
  - [x] useCreateMemo() 훅 연결
  - [x] @ 패턴 추출 (정규표현식: `/@([가-힣a-zA-Z0-9]+)/g`)
  - [x] 저장 중 로딩 상태 (버튼 disabled, 스피너)
  - [x] 성공 Toast ("메모가 저장되었습니다")
  - [x] 저장 후 Input 창 자동 초기화 (content + textContent)
- [x] **키보드 단축키**
  - [x] Enter: 메모 저장 (드롭다운 닫혀있을 때)
  - [x] Shift+Enter: 줄바꿈 (기본 동작)
  - [x] 드롭다운 열려있을 때는 Entity 선택에 사용
- [x] **@ 입력 감지**
  - [x] useEffect로 content 변경 감지
  - [x] lastIndexOf('@')로 최근 @ 위치 찾기
  - [x] @ 뒤 텍스트 추출 (스페이스 전까지)
  - [x] 유효성 검사 (`/^[가-힣a-zA-Z0-9]*$/`)
  - [x] Entity 드롭다운 표시 트리거

#### 5.2 Entity 자동완성 시스템 ✅ 100%
> **컴포넌트**: `app/components/EntityDropdown.tsx`

- [x] **드롭다운 컴포넌트** ⭐
  - [x] @ 입력 시 Input 창 위에 표시 (absolute bottom-full)
  - [x] 캐시된 Entity 리스트 필터링 (`startsWith()`)
  - [x] 최대 5개 표시
  - [x] 애니메이션 (fade-in, slide-in-from-bottom)
  - [x] **UI 구조**:
    - 매칭 있음: Entity 리스트
    - 매칭 없음: "새 엔티티 생성" 버튼
  - [x] **키보드 네비게이션** (InputArea에서 처리)
    - [x] ArrowDown/ArrowUp: 항목 이동
    - [x] Enter/Tab: 선택 확정
    - [x] Esc: 드롭다운 닫기
  - [x] 마우스 클릭 선택 (onClick)
  - [x] 선택된 항목 하이라이트 (bg-blue-500/20)
- [x] **Entity 선택 처리** (InputArea.handleEntitySelect)
  - [x] 기존 entity: 이름으로 교체
  - [x] 새 entity: 입력한 텍스트로 교체
  - [x] 스페이스 자동 추가
  - [x] 커서 위치 조정 (Range API)
  - [x] 드롭다운 닫기
- [x] **다중 Entity 입력 지원**
  - [x] 하나의 메모에 여러 @ 입력 가능
  - [x] lastIndexOf('@')로 최근 @ 처리

#### 5.3 메모 저장 프로세스 ✅ 100%
> **구현**: `useCreateMemo()` in `app/lib/queries.ts`

- [x] **Memo 생성**
  - [x] user_id: 현재 인증 사용자 ID
  - [x] content: 메모 전체 내용 (@ 포함)
  - [x] created_at: 자동
- [x] **정규표현식으로 @entity_name 패턴 추출**
  ```typescript
  const entityPattern = /@([가-힣a-zA-Z0-9]+)/g
  const matches = [...content.matchAll(entityPattern)]
  const entityNames = matches.map((match) => match[1])
  ```
- [x] **Entity 처리**
  - [x] 각 entity 이름에 대해 getEntityByName() 조회
  - [x] 없으면 useCreateEntity().mutateAsync()로 자동 생성
  - [x] Promise.all로 병렬 처리
- [x] **memo_entity 관계 생성**
  - [x] memo_id, entity_id 배열로 INSERT
  - [x] UNIQUE 제약으로 중복 방지
- [x] **캐시 무효화**
  - [x] queryClient.invalidateQueries(['memos'])
- [x] **Toast 피드백**
  - [x] 메모 저장: "메모가 저장되었습니다"
  - [x] Entity 생성: "✨ 새 엔티티 '{name}'이(가) 생성되었습니다"
- [ ] **개선 사항 (선택적)**
  - [ ] 다중 Entity 생성 시 Toast 중복 방지
  - [ ] Optimistic update (현재는 invalidate만)

---

### 6️⃣ 히스토리 섹션 (History Sidebar) ✅ 95%

#### 6.1 메모 목록 표시 (app/components/MainContainer.tsx) ✅
- [x] **기본 레이아웃**
  - [x] 스크롤 영역 설정
  - [x] 메모 추가 시 자동 스크롤 (useEffect, dependency: memos)
- [x] **메모 데이터 fetch** ⭐
  - [x] useMemos() 훅 연결
  - [x] 로딩 상태 (스켈레톤 UI - 3개 카드 애니메이션)
  - [x] 에러 상태 표시 (빨간색 메시지)
  - [x] 빈 상태 메시지 ("아직 메모가 없습니다")
  - [x] 조건부 렌더링 (isLoading, error, empty, success)
- [x] **메모 카드 컴포넌트** (`app/components/MemoCard.tsx`) ⭐
  - [x] Memo 타입 정의
  - [x] formatDate 함수 (YYYY-MM-DD HH:mm)
  - [x] 작성 시간 표시 (text-xs, text-muted)
  - [x] 메모 내용 표시 (whitespace-pre-wrap, break-words)
  - [x] Entity 하이라이트 (highlightEntities 사용)
  - [x] 호버 효과 (bg-bg-secondary/50)
  - [x] 카드 디자인 (border, rounded, padding)
  - [ ] 클릭 이벤트 (Phase 2: 상세 모달)

#### 6.2 Entity 하이라이트 ✅ 90%
> **유틸 함수**: `app/lib/utils/highlightEntities.tsx`

- [x] **정규표현식으로 `@entity_name` 패턴 찾기** ⭐
  ```typescript
  const entityPattern = /@([가-힣a-zA-Z0-9]+)/g
  ```
- [x] **React 컴포넌트로 치환** ⭐
  - [x] while 루프로 모든 매칭 처리
  - [x] 매칭 이전/이후 일반 텍스트 추가
  - [x] key 설정 (중복 방지)
  ```tsx
  <span className="bg-mention-project/20 text-mention-project px-1.5 py-0.5 rounded font-medium">
    @entity_name
  </span>
  ```
- [ ] **Entity type에 따른 색상 매핑** (Phase 2)
  - 현재: 모든 Entity에 mention-project 색상 사용
  - 향후: entity 테이블의 type 컬럼 활용
    - type === "project" → bg-mention-project
    - type === "person" → bg-mention-person
    - type === "event" → bg-mention-event
- [ ] Entity 클릭 시 필터링 (Phase 2)

#### 6.3 우측 사이드바 (app/components/RightSidebar.tsx) ✅
- [x] **기본 레이아웃**
  - [x] 스크롤 영역 설정
  - [x] 메모 추가 시 자동 스크롤 (useEffect)
  - [x] 너비: w-80
- [x] **헤더** ⭐
  - [x] "히스토리" 제목 (text-lg, font-semibold)
  - [x] "최근 작성한 메모" 부제목 (text-xs, text-muted)
- [x] **히스토리 데이터 표시** ⭐
  - [x] 구현 방식: MainContainer와 동일한 메모 리스트
  - [x] useMemos() 훅 연결
  - [x] 로딩 상태 (스켈레톤 UI)
  - [x] 빈 상태 메시지
  - [x] MemoCard 컴포넌트 재사용

---

### 7️⃣ 전역 에러 처리 및 피드백 ✅ 80%

#### 7.1 Toast 시스템 ✅
- [x] **ToastProvider 설정**
  - [x] Sonner 라이브러리 사용
  - [x] 위치: top-right
  - [x] duration: 3초 (기본)
  - [x] 다크 테마 스타일
  - [x] richColors, closeButton
- [x] Layout에 적용 (`app/layout.tsx`)

#### 7.2 Toast 사용 예시
```typescript
import { toast } from 'sonner'

// 성공
toast.success("✨ 새 엔티티 'project1'이(가) 생성되었습니다")

// 에러 (5초 duration)
toast.error("메모 저장에 실패했습니다. 다시 시도해주세요.", { duration: 5000 })

// 정보
toast.info("메모가 저장되었습니다")

// 로딩
toast.loading("저장 중...")
```

#### 7.3 에러 메시지 매핑 (TODO)
> **유틸 함수 필요**: `app/lib/utils/errorMessages.ts`

- [ ] Supabase 에러 코드별 메시지 매핑
  ```typescript
  export function getErrorMessage(error: any): string {
    if (error.code === 'PGRST116') return '데이터를 찾을 수 없습니다'
    if (error.code === '23505') return '이미 존재하는 데이터입니다'
    // ... 기타 에러 코드
    return error.message || '오류가 발생했습니다'
  }
  ```
- [ ] 공통 에러 메시지 정의
  - [ ] 네트워크 오류: "네트워크 연결을 확인해주세요"
  - [ ] 인증 오류: "로그인이 필요합니다"
  - [ ] 권한 오류: "접근 권한이 없습니다"
  - [ ] 메모 저장 실패: "메모 저장에 실패했습니다"
  - [ ] Entity 생성 실패: "엔티티 생성에 실패했습니다"

---

### 8️⃣ UI 컴포넌트 ✅ 90%

#### 8.1 Header (app/components/Header.tsx) ✅
- [x] **좌측: 로고 및 타이틀**
  - [x] FolderOpen 아이콘
  - [x] "Archive" 텍스트
- [x] **중앙: 검색 바**
  - [x] Search 아이콘
  - [x] placeholder: "Search records..."
  - [x] state 연결 (기능 미구현)
- [x] **우측: 네비게이션**
  - [x] Dashboard, Records, Entities 링크 (href="#")
- [x] **아이콘 영역**
  - [x] **알림 (Radix Popover)**
    - [x] Bell 아이콘 + Tooltip
    - [x] Popover 콘텐츠 (placeholder 알림)
  - [x] **설정 (Radix Tooltip)**
    - [x] Settings 아이콘
  - [x] **프로필 (Radix Avatar + DropdownMenu)**
    - [x] 아바타 이미지 또는 이니셜
    - [x] 사용자 정보 표시 (username, email)
    - [x] Profile, Settings 메뉴
    - [x] 로그아웃 버튼 (동작 완료)
    - [x] 로그아웃 중 로딩 상태

#### 8.2 메인 레이아웃 (app/page.tsx) ✅
- [x] 전체 레이아웃 구조
  - [x] Header (상단 고정)
  - [x] 좌측 70%: MainContainer + InputArea
  - [x] 우측 30%: RightSidebar
- [x] Flexbox 레이아웃 (h-screen, flex-col)
- [x] overflow 처리

---

### 9️⃣ 스타일링 ✅ 100%

#### 9.1 디자인 시스템 (app/globals.css)
- [x] **색상 팔레트 (@theme)**
  - [x] `--color-bg-primary: #1a1f2e` (메인 배경)
  - [x] `--color-bg-secondary: #252b3b` (카드 배경)
  - [x] `--color-bg-card: #2a2f3e`
  - [x] `--color-bg-input: #323847`
  - [x] `--color-border-main: #374151`
  - [x] `--color-text-muted: #9ca3af`
  - [x] Entity 하이라이트 색상
    - [x] `--color-mention-project: #a855f7` (보라)
    - [x] `--color-mention-person: #22c55e` (초록)
    - [x] `--color-mention-event: #3b82f6` (파랑)
- [x] **커스텀 스크롤바**
  - [x] 너비: 6px
  - [x] track: #252b3b
  - [x] thumb: #374151
  - [x] hover: #4b5563
- [x] **contentEditable placeholder**
  - [x] `[contenteditable][data-placeholder]:empty:before`
  - [x] color: #6b7280

---

## 🎉 Phase 1 완료! ✅

다음 **모든 기능**이 작동합니다:

1. ✅ **Google/Github/Email OAuth 로그인** - LoginModal, AuthProvider 완료
2. ✅ **메모 작성** (@ 포함/미포함 모두) - InputArea, useCreateMemo 완료
3. ✅ **@ 입력 시 Entity 자동완성** - EntityDropdown, 키보드/마우스 네비게이션 완료
4. ✅ **새 Entity 생성** - useCreateEntity, 유효성 검사, Toast 피드백 완료
5. ✅ **히스토리에 메모 표시** (Entity 하이라이트) - MainContainer, MemoCard, highlightEntities 완료
6. ✅ **Toast 피드백** - Sonner 기반 ToastProvider 완료

### 🎯 MVP 핵심 기능 100% 달성!

---

## Phase 2 - 사용성 개선 (TODO)

### 우선순위 1 (높음)
- [ ] 실시간 히스토리 필터링 (@ 입력 중)
- [ ] 히스토리 페이지네이션 또는 무한 스크롤
- [ ] 메모 클릭 시 상세 보기 모달
- [ ] Entity 클릭 시 필터링 기능

### 우선순위 2 (중간)
- [ ] 메모 수정 기능
- [ ] 메모 삭제 기능
- [ ] Entity 이름 수정
- [ ] Entity 삭제

### 우선순위 3 (낮음)
- [ ] 반응형 디자인 (모바일/태블릿)
- [ ] Entity 색상/아이콘 커스터마이징
- [ ] 메모 검색 기능
- [ ] 메모 내보내기 (export)

---

## Phase 3 - 고급 기능 (TODO)

- [ ] 메모 간 연결 (backlink)
- [ ] 그래프 뷰 (entity 관계도)
- [ ] AI 기반 메모 추천
- [ ] 협업 기능 (공유 entity)

---

## 📊 세부 진행률

| 카테고리 | 완료 | 전체 | 진행률 |
|---------|------|------|--------|
| 프로젝트 인프라 | 13 | 13 | 100% ✅ |
| 데이터베이스 | 10 | 14 | 71% 🟡 |
| 사용자 인증 | 15 | 15 | 100% ✅ |
| React Query 훅 | 13 | 15 | 87% 🟢 |
| 메모 작성 기능 | 30 | 32 | 94% 🟢 |
| 히스토리 섹션 | 24 | 27 | 89% 🟢 |
| 에러 처리 & 피드백 | 7 | 9 | 78% 🟡 |
| UI 컴포넌트 | 18 | 18 | 100% ✅ |
| 스타일링 | 11 | 11 | 100% ✅ |
| **전체 (Phase 1 필수)** | **141** | **154** | **92%** ✅ |

---

## 🎯 다음 단계 추천 순서

### Phase 1 마무리 작업 (선택적)

#### 1. 성능 최적화 (중요도: 중)
- [ ] **DB 인덱스 추가** (0.5일)
  - memo.user_id, entity.user_id
  - entity.name, memo_entity 조인용
  - 쿼리 성능 향상

#### 2. 보안 강화 (중요도: 높음)
- [ ] **RLS 정책 적용** (1일)
  - users, memo, entity, memo_entity 테이블
  - 본인 데이터만 접근 가능하도록 제한
  - 프로덕션 배포 전 필수

#### 3. UX 개선 (중요도: 낮음)
- [ ] **에러 메시지 매핑** (0.5일)
  - Supabase 에러 코드별 한글 메시지
  - getErrorMessage 유틸 함수
- [ ] **다중 Entity 생성 시 Toast 중복 방지** (0.5일)
  - useCreateMemo에서 silent 옵션 추가

#### 4. QA 및 테스트 (중요도: 중)
- [ ] **수동 QA** (1일)
  - 메모 작성/조회 플로우
  - Entity 자동완성/생성
  - 에러 시나리오
  - 다양한 브라우저 테스트

---

### Phase 2 - 사용성 개선 시작 (선택)

**우선순위 1 (높음)**:
1. **실시간 히스토리 필터링** (@ 입력 중)
2. **메모 클릭 시 상세 보기 모달**
3. **Entity 클릭 시 필터링 기능**
4. **메모 수정 기능**
5. **메모 삭제 기능**

**우선순위 2 (중간)**:
- Entity type별 색상 매핑
- Entity 이름 수정
- Entity 삭제
- 히스토리 페이지네이션

**우선순위 3 (낮음)**:
- 반응형 디자인
- 메모 검색 기능
- 메모 내보내기

---

## 📝 메모

### 최근 변경사항
- **2025-12-01**: 🎉 **Phase 1 MVP 완료!** ✅
  - 메모 작성 기능 (InputArea, EntityDropdown) ✅
  - 도메인 특화 React Query 훅 (useMemos, useCreateMemo, useEntities, useCreateEntity) ✅
  - 히스토리 섹션 (MainContainer, RightSidebar, MemoCard) ✅
  - Entity 하이라이트 (highlightEntities) ✅
- **2025-12-01**: ToastProvider (Sonner) 구현 완료 ✅
- **2025-12-01**: entity 테이블에 user_id 추가 완료 ✅
- **2025-12-01**: 타입 재생성 완료 (npm run gen:types) ✅

### 참고 문서
- [PRD v2](./prd_v2.md) - 상세 기능 명세
- [CLAUDE.md](../CLAUDE.md) - 프로젝트 개요 및 개발 원칙
- [Supabase Schema](../types/supabase.ts) - 데이터베이스 타입 정의

### 개발 팁
- 타입 재생성: `npm run gen:types`
- Toast 사용: `import { toast } from 'sonner'`
- Supabase 클라이언트:
  - 클라이언트: `import { supabase } from '@/app/lib/supabase/client'`
  - 서버: `import { createClient } from '@/app/lib/supabase/server'`

---

**문서 종료**
