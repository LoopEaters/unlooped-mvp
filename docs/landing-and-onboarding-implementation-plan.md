# Landing Page & Onboarding 구현 계획서

작성일: 2025-12-06
프로젝트: Unlooped MVP

---

## 목차

1. [개요](#개요)
2. [사용자 플로우](#사용자-플로우)
3. [기술 아키텍처](#기술-아키텍처)
4. [DB 스키마 설계](#db-스키마-설계)
5. [컴포넌트 설계](#컴포넌트-설계)
6. [구현 상세](#구현-상세)
7. [디자인 가이드](#디자인-가이드)
8. [구현 체크리스트](#구현-체크리스트)

---

## 개요

### 목표

1. **Landing Page**: 비로그인 사용자에게 Unlooped 프로젝트 소개 및 가치 제안
2. **Onboarding Modal**: 최초 로그인 사용자에게 핵심 기능 안내 (간단한 3-Step 모달)
3. **Seamless Flow**: Landing → Get Started → Login → Onboarding → Main App

### 핵심 원칙

- **책임 분리**: Landing Page는 완전히 별도 라우트 (`/`)로 분리
- **Main App 비침해**: 기존 앱 (`/app` 또는 로그인 후) 로직과 독립적
- **디자인 시스템 준수**: `theme.ts` 색상 시스템 활용
- **프로젝트 컨벤션**: Next.js 14 App Router, TypeScript, Tailwind CSS 4

---

## 사용자 플로우

### Flow Diagram

```
┌─────────────────┐
│  / (Landing)    │  ← 비로그인 사용자 진입점
│  - 프로젝트 소개  │
│  - 주요 기능      │
│  - CTA 버튼      │
└────────┬────────┘
         │ [Get Started] 클릭
         ▼
┌─────────────────┐
│  LoginModal     │  ← 로그인/회원가입
│  - Google 로그인 │
│  - Email 로그인  │
└────────┬────────┘
         │ 인증 성공
         ▼
     ┌───────┐
     │ 최초? │  ← onboarding_completed 체크
     └───┬───┘
         │
    ┌────┴────┐
    │ YES     │ NO
    ▼         ▼
┌───────────┐  ┌──────────────┐
│Onboarding │  │  /app (Main) │
│  Modal    │  │              │
│ (3 Step)  │  └──────────────┘
└─────┬─────┘
      │ [시작하기] 클릭
      ▼
┌──────────────┐
│  /app (Main) │
│  - Header    │
│  - Timeline  │
│  - InputArea │
└──────────────┘
```

### 상세 시나리오

#### 1. 비로그인 사용자

```
1. 사용자가 루트 경로 `/` 접속
2. Landing Page 표시
   - Hero Section (헤드라인, 서브텍스트, CTA)
   - Features Section (Entity, Timeline, Mention 소개)
   - Footer (간단한 링크)
3. [Get Started] 버튼 클릭
4. LoginModal 자동 오픈 (showLoginModal: true)
```

#### 2. 최초 로그인 사용자

```
1. LoginModal에서 Google 로그인 or Email 가입
2. 인증 성공 → AuthProvider가 user 정보 로드
3. DB users 테이블에서 onboarding_completed === false 확인
4. OnboardingModal 자동 오픈
5. 3-Step 진행:
   - Step 1: Welcome & Entity 소개
   - Step 2: Timeline 사용법
   - Step 3: Mention 기능
6. [시작하기] 버튼 클릭 → onboarding_completed = true 업데이트
7. /app (메인 앱)으로 리다이렉트
```

#### 3. 재방문 사용자

```
1. 루트 경로 `/` 접속
2. AuthProvider가 session 확인
3. 로그인 상태면 `/app`으로 자동 리다이렉트
4. 비로그인이면 Landing Page 표시
```

#### 4. 온보딩 재진입

```
1. Header에 "도움말" 버튼 추가
2. 클릭 시 OnboardingModal 수동 오픈
3. 기존 사용자도 언제든지 온보딩 다시 볼 수 있음
```

---

## 기술 아키텍처

### 라우팅 구조

```
app/
├── (landing)/           # Landing Page Route Group
│   ├── page.tsx         # Landing Page 컴포넌트 (비로그인 전용)
│   └── layout.tsx       # Landing 전용 레이아웃 (Header 없음)
│
├── (main)/              # Main App Route Group
│   ├── page.tsx         # 기존 Home Page (로그인 후)
│   └── layout.tsx       # Main App 레이아웃 (Header 있음)
│
├── components/
│   ├── landing/
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   └── CTAButton.tsx
│   │
│   ├── onboarding/
│   │   ├── OnboardingModal.tsx
│   │   ├── WelcomeStep.tsx
│   │   ├── TimelineStep.tsx
│   │   └── MentionStep.tsx
│   │
│   └── auth/
│       └── LoginModal.tsx  # 기존 (수정 필요)
│
├── providers/
│   ├── AuthProvider.tsx    # 온보딩 상태 추가
│   └── QueryProvider.tsx
│
└── lib/
    ├── theme.ts            # 기존 색상 시스템
    └── queries.ts          # onboarding 관련 쿼리 추가
```

### Route Groups 설명

**왜 Route Groups를 사용하는가?**
- Landing Page와 Main App의 레이아웃을 완전히 분리
- URL 구조에 영향 없이 논리적 그룹화
- Landing: Header 없음, Main: Header 있음

**예시:**
```
/(landing)/page.tsx  → URL: /
/(main)/page.tsx     → URL: /app (또는 redirect 로직에 따라 /home)
```

---

## DB 스키마 설계

### users 테이블 수정

```sql
-- 온보딩 관련 필드 추가
ALTER TABLE users
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN onboarding_skipped BOOLEAN DEFAULT FALSE,
ADD COLUMN onboarding_completed_at TIMESTAMPTZ,
ADD COLUMN onboarding_version INT DEFAULT 1;

-- 인덱스 추가 (선택적 - 대량 사용자 대비)
CREATE INDEX idx_users_onboarding_completed
ON users(onboarding_completed);

COMMENT ON COLUMN users.onboarding_completed IS '온보딩 완료 여부';
COMMENT ON COLUMN users.onboarding_skipped IS '온보딩 스킵 여부 (현재 미사용, 향후 확장)';
COMMENT ON COLUMN users.onboarding_completed_at IS '온보딩 완료 시각';
COMMENT ON COLUMN users.onboarding_version IS '온보딩 버전 (향후 온보딩 업데이트 시 재진입용)';
```

### TypeScript 타입 업데이트

```bash
# Supabase 타입 재생성
npm run gen:types
```

```typescript
// types/supabase.ts에 자동 추가됨
export type User = Database['public']['Tables']['users']['Row'] & {
  onboarding_completed: boolean
  onboarding_skipped: boolean
  onboarding_completed_at: string | null
  onboarding_version: number
}
```

---

## 컴포넌트 설계

### 1. Landing Page (`app/(landing)/page.tsx`)

#### 책임
- Unlooped 프로젝트 소개
- 핵심 가치 제안
- CTA → LoginModal 트리거

#### Props
없음 (서버 컴포넌트)

#### 구조
```tsx
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </div>
  )
}
```

---

### 2. HeroSection (`app/components/landing/HeroSection.tsx`)

#### 책임
- 메인 헤드라인
- 서브텍스트
- Primary CTA 버튼

#### 디자인
```
┌────────────────────────────────────┐
│                                    │
│        🎯 Unlooped                 │
│                                    │
│   모든 생각을 하나로 연결하세요       │
│   Entity, Timeline, Mention으로     │
│   당신의 아이디어를 체계화하세요     │
│                                    │
│     [Get Started →]                │
│                                    │
└────────────────────────────────────┘
```

#### 색상 (theme.ts)
```tsx
// 배경: defaultTheme.ui.primaryBg (bg-bg-primary)
// 헤드라인: defaultTheme.ui.textPrimary (text-white)
// 서브텍스트: defaultTheme.ui.textSecondary (text-gray-300)
// CTA 버튼: defaultTheme.ui.interactive.primaryBg (bg-blue-500)
```

---

### 3. FeaturesSection (`app/components/landing/FeaturesSection.tsx`)

#### 책임
- 3가지 핵심 기능 소개
- Entity Types 시각화

#### 구조
```tsx
const features = [
  {
    icon: '👤',
    title: 'Entity',
    description: 'Person, Project, Event를 구분하여 관리',
    color: defaultTheme.entityTypes.person.hex, // 타입별 색상
  },
  {
    icon: '📊',
    title: 'Timeline',
    description: '모든 활동을 시간순으로 시각화',
    color: defaultTheme.ui.interactive.primary,
  },
  {
    icon: '@',
    title: 'Mention',
    description: '@로 Entity를 연결하고 추적',
    color: defaultTheme.entityTypes.project.hex,
  },
]
```

#### 디자인
```
┌──────────────────────────────────────────────────┐
│              주요 기능                            │
├────────┬────────────┬───────────────────────────┤
│  👤    │    📊      │          @                │
│ Entity │ Timeline   │      Mention              │
│ Person,│ 모든 활동을 │ @로 Entity를              │
│Project,│시간순으로   │연결하고 추적              │
│ Event  │시각화      │                           │
└────────┴────────────┴───────────────────────────┘
```

---

### 4. OnboardingModal (`app/components/onboarding/OnboardingModal.tsx`)

#### 책임
- 3-Step 온보딩 플로우 관리
- DB 업데이트 (onboarding_completed)
- 완료 후 모달 닫기

#### Props
```typescript
interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}
```

#### State
```tsx
const [currentStep, setCurrentStep] = useState(1) // 1, 2, 3
const [isCompleting, setIsCompleting] = useState(false)
```

#### 로직
```tsx
const handleComplete = async () => {
  setIsCompleting(true)

  // Supabase 업데이트
  await supabase
    .from('users')
    .update({
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString()
    })
    .eq('id', userId)

  // React Query 캐시 무효화
  queryClient.invalidateQueries({ queryKey: ['user'] })

  onClose()
}
```

#### UI 구조
```tsx
<Dialog.Root open={isOpen} onOpenChange={onClose}>
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black/70" />
    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                bg-bg-card rounded-lg p-8 w-full max-w-2xl">
      {/* Progress Indicator */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map(step => (
          <div key={step} className={`h-1 flex-1 rounded ${
            step <= currentStep
              ? defaultTheme.ui.interactive.primaryBg
              : 'bg-gray-700'
          }`} />
        ))}
      </div>

      {/* Step Content */}
      {currentStep === 1 && <WelcomeStep />}
      {currentStep === 2 && <TimelineStep />}
      {currentStep === 3 && <MentionStep />}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        {currentStep > 1 && (
          <button onClick={() => setCurrentStep(currentStep - 1)}>
            이전
          </button>
        )}

        {currentStep < 3 ? (
          <button onClick={() => setCurrentStep(currentStep + 1)}>
            다음
          </button>
        ) : (
          <button onClick={handleComplete} disabled={isCompleting}>
            시작하기
          </button>
        )}
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

---

### 5. Step Components

#### WelcomeStep.tsx
```tsx
export default function WelcomeStep() {
  return (
    <div className="text-center">
      <h2 className={defaultTheme.ui.textPrimary}>
        Unlooped에 오신 것을 환영합니다! 🎉
      </h2>
      <p className={defaultTheme.ui.textSecondary}>
        간단한 3단계로 핵심 기능을 소개해드릴게요.
      </p>

      {/* Entity Types 미리보기 */}
      <div className="flex gap-4 justify-center mt-6">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${defaultTheme.entityTypes.person.bg}`} />
          <span className={defaultTheme.ui.textSecondary}>Person</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${defaultTheme.entityTypes.project.bg}`} />
          <span className={defaultTheme.ui.textSecondary}>Project</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${defaultTheme.entityTypes.event.bg}`} />
          <span className={defaultTheme.ui.textSecondary}>Event</span>
        </div>
      </div>
    </div>
  )
}
```

#### TimelineStep.tsx
```tsx
export default function TimelineStep() {
  return (
    <div>
      <h2 className={defaultTheme.ui.textPrimary}>
        📊 Timeline으로 한눈에 파악하세요
      </h2>
      <p className={defaultTheme.ui.textSecondary}>
        모든 메모와 활동이 Timeline에 기록됩니다.
      </p>

      {/* 간단한 Timeline 일러스트 (선택적) */}
      <div className="mt-6 p-4 bg-bg-secondary rounded-lg">
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-8 bg-bg-card rounded" />
          ))}
        </div>
      </div>
    </div>
  )
}
```

#### MentionStep.tsx
```tsx
export default function MentionStep() {
  return (
    <div>
      <h2 className={defaultTheme.ui.textPrimary}>
        @ Mention으로 연결하세요
      </h2>
      <p className={defaultTheme.ui.textSecondary}>
        @ 입력하면 Entity를 자동완성으로 멘션할 수 있어요.
      </p>

      {/* Mention 예시 */}
      <div className="mt-6 p-4 bg-bg-secondary rounded-lg">
        <p className={defaultTheme.ui.textPrimary}>
          오늘 <span className={getMentionHighlightClass('person')}>@김철수</span>와{' '}
          <span className={getMentionHighlightClass('project')}>@Unlooped</span>{' '}
          프로젝트 논의
        </p>
      </div>
    </div>
  )
}
```

---

## 구현 상세

### 1. AuthProvider 수정 (`app/providers/AuthProvider.tsx`)

#### 추가 State
```tsx
const [showOnboarding, setShowOnboarding] = useState(false)
```

#### 로그인 후 온보딩 체크
```tsx
useEffect(() => {
  if (session && userProfile) {
    // 최초 로그인 체크
    if (!userProfile.onboarding_completed) {
      setShowOnboarding(true)
    }
  }
}, [session, userProfile])
```

#### Context 값 확장
```tsx
return (
  <AuthContext.Provider value={{
    // 기존 값들...
    showOnboarding,
    setShowOnboarding,
  }}>
    {children}

    {/* OnboardingModal 추가 */}
    {showOnboarding && userProfile && (
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        userId={userProfile.id}
      />
    )}
  </AuthContext.Provider>
)
```

---

### 2. Landing Page 리다이렉트 로직

#### Middleware 방식 (추천)
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { session } } = await supabase.auth.getSession()

  // 루트 경로 접근 시
  if (req.nextUrl.pathname === '/') {
    // 로그인 상태면 /app으로 리다이렉트
    if (session) {
      return NextResponse.redirect(new URL('/app', req.url))
    }
    // 비로그인이면 Landing Page 표시 (그대로)
  }

  return res
}

export const config = {
  matcher: ['/'],
}
```

---

### 3. LoginModal 수정

#### CTA에서 트리거
```tsx
// Landing Page에서
<CTAButton onClick={() => setShowLoginModal(true)}>
  Get Started
</CTAButton>
```

#### LoginModal Props 추가 (선택적)
```tsx
interface LoginModalProps {
  source?: 'landing' | 'header' | 'manual'  // 진입 경로 트래킹용 (Analytics)
}
```

---

### 4. Header에 도움말 버튼 추가

```tsx
// app/components/common/Header.tsx
import { useAuth } from '@/app/providers/AuthProvider'

export default function Header() {
  const { setShowOnboarding } = useAuth()

  return (
    <header>
      {/* 기존 UI... */}

      <button
        onClick={() => setShowOnboarding(true)}
        className={`${defaultTheme.ui.textMuted} ${defaultTheme.ui.buttonHover}`}
        title="기능 소개 다시 보기"
      >
        <HelpCircle size={20} />
      </button>
    </header>
  )
}
```

---

## 디자인 가이드

### 색상 사용 규칙

**절대 하드코딩 금지! 반드시 theme.ts 사용**

#### Landing Page
```tsx
// 배경
className={defaultTheme.ui.primaryBg}              // bg-bg-primary

// 헤드라인
className={defaultTheme.ui.textPrimary}            // text-white

// 서브텍스트
className={defaultTheme.ui.textSecondary}          // text-gray-300

// CTA 버튼
className={`${defaultTheme.ui.interactive.primaryBg} ${defaultTheme.ui.interactive.primaryBgHover}`}
// bg-blue-500 hover:bg-blue-600
```

#### OnboardingModal
```tsx
// 배경
className="bg-bg-card"                             // 카드 배경

// Progress Bar (활성)
className={defaultTheme.ui.interactive.primaryBg}  // bg-blue-500

// Progress Bar (비활성)
className="bg-gray-700"

// 버튼
className={`${defaultTheme.ui.interactive.primaryBg} ${defaultTheme.ui.interactive.primaryBgHover}`}
```

#### Entity Type 색상
```tsx
import { getEntityTypeColor } from '@/app/lib/theme'

const personColor = getEntityTypeColor('person')
// { bg: 'bg-mention-person', text: 'text-mention-person', hex: '#22C55E' }

<div className={personColor.bg}>Person</div>
```

### 타이포그래피

```tsx
// 대제목 (Landing Hero)
<h1 className="text-5xl font-bold">

// 중제목 (Onboarding Step)
<h2 className="text-3xl font-semibold">

// 본문 (설명)
<p className="text-base">

// 작은 텍스트 (힌트)
<span className="text-sm text-text-muted">
```

### 간격 (Spacing)

```tsx
// 섹션 간격
<section className="py-16">

// 카드 내부 패딩
<div className="p-8">

// 요소 간 간격
<div className="space-y-4">
```

### Border Radius

```tsx
// 카드
className="rounded-lg"

// 버튼
className="rounded-md"

// 작은 요소 (Entity Dot)
className="rounded-full"
```

---

## 구현 체크리스트

### Phase 1: DB & 인프라

- [ ] **DB 스키마 수정**
  - [ ] users 테이블에 onboarding_completed, onboarding_skipped, onboarding_completed_at, onboarding_version 추가
  - [ ] 인덱스 생성 (선택적)
  - [ ] Supabase 타입 재생성 (`npm run gen:types`)

- [ ] **Route Groups 설정**
  - [ ] `app/(landing)/` 폴더 생성
  - [ ] `app/(landing)/layout.tsx` 생성 (Header 없음)
  - [ ] `app/(landing)/page.tsx` 생성 (Landing Page)
  - [ ] `app/(main)/` 폴더로 기존 앱 이동 (선택적, 또는 기존 구조 유지)

- [ ] **Middleware 설정**
  - [ ] `middleware.ts` 생성
  - [ ] 루트 경로 리다이렉트 로직 구현

---

### Phase 2: Landing Page

- [ ] **컴포넌트 생성**
  - [ ] `app/components/landing/HeroSection.tsx`
  - [ ] `app/components/landing/FeaturesSection.tsx`
  - [ ] `app/components/landing/CTAButton.tsx`
  - [ ] `app/components/landing/Footer.tsx` (선택적)

- [ ] **Landing Page 구현**
  - [ ] HeroSection: 헤드라인, 서브텍스트, CTA
  - [ ] FeaturesSection: Entity, Timeline, Mention 소개
  - [ ] CTAButton: LoginModal 트리거
  - [ ] 색상 theme.ts 준수 확인

- [ ] **LoginModal 연동**
  - [ ] Landing에서 CTA 클릭 → LoginModal 오픈
  - [ ] LoginModal Props 추가 (source 트래킹용, 선택적)

---

### Phase 3: Onboarding Modal

- [ ] **컴포넌트 생성**
  - [ ] `app/components/onboarding/OnboardingModal.tsx`
  - [ ] `app/components/onboarding/WelcomeStep.tsx`
  - [ ] `app/components/onboarding/TimelineStep.tsx`
  - [ ] `app/components/onboarding/MentionStep.tsx`

- [ ] **OnboardingModal 구현**
  - [ ] 3-Step 상태 관리
  - [ ] Progress Indicator UI
  - [ ] 이전/다음 네비게이션
  - [ ] 완료 버튼 → DB 업데이트
  - [ ] React Query 캐시 무효화
  - [ ] 색상 theme.ts 준수 확인

- [ ] **Step Components 구현**
  - [ ] WelcomeStep: Entity Types 색상 표시
  - [ ] TimelineStep: Timeline 일러스트 (간단)
  - [ ] MentionStep: Mention 예시 (getMentionHighlightClass 사용)

---

### Phase 4: AuthProvider 수정

- [ ] **온보딩 상태 추가**
  - [ ] `showOnboarding` state
  - [ ] `setShowOnboarding` state
  - [ ] Context에 추가

- [ ] **로그인 후 체크 로직**
  - [ ] useEffect에서 `onboarding_completed` 확인
  - [ ] false일 때 OnboardingModal 오픈

- [ ] **OnboardingModal 렌더링**
  - [ ] AuthProvider에서 조건부 렌더링
  - [ ] userId props 전달

---

### Phase 5: Header 수정

- [ ] **도움말 버튼 추가**
  - [ ] HelpCircle 아이콘 (lucide-react)
  - [ ] 클릭 시 setShowOnboarding(true)
  - [ ] Tooltip: "기능 소개 다시 보기"

---

### Phase 6: React Query 훅

- [ ] **app/lib/queries.ts 추가**
  ```tsx
  export function useCompleteOnboarding() {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: async (userId: string) => {
        const { error } = await supabase
          .from('users')
          .update({
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString(),
          })
          .eq('id', userId)

        if (error) throw error
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user'] })
      },
    })
  }
  ```

---

### Phase 7: 테스트

- [ ] **시나리오 테스트**
  - [ ] 비로그인 상태 → `/` → Landing Page 표시
  - [ ] CTA 클릭 → LoginModal 오픈
  - [ ] 최초 로그인 → OnboardingModal 자동 오픈
  - [ ] 3-Step 진행 → DB 업데이트 확인
  - [ ] 재방문 사용자 → `/` → `/app` 리다이렉트
  - [ ] Header 도움말 버튼 → OnboardingModal 재오픈

- [ ] **색상 검증**
  - [ ] Landing Page 전체 요소 theme.ts 사용 확인
  - [ ] OnboardingModal 전체 요소 theme.ts 사용 확인
  - [ ] 하드코딩된 색상 없는지 확인 (검색: `text-blue`, `bg-red` 등)

- [ ] **반응형 테스트** (선택적)
  - [ ] 모바일 화면에서 Landing Page 레이아웃
  - [ ] OnboardingModal 모바일 대응

---

### Phase 8: 최적화 (선택적)

- [ ] **Analytics 추가**
  - [ ] Landing Page 방문 수
  - [ ] CTA 클릭률
  - [ ] 온보딩 완료율
  - [ ] 온보딩 스킵률 (향후)

- [ ] **SEO 최적화**
  - [ ] Landing Page metadata
  - [ ] Open Graph 태그
  - [ ] Description

- [ ] **애니메이션**
  - [ ] Landing Hero 페이드인
  - [ ] OnboardingModal Step 전환 애니메이션
  - [ ] Progress Bar 애니메이션

---

## 향후 확장 계획

### 온보딩 버전 관리

```typescript
// 새 기능 추가 시 온보딩 버전 올리기
const CURRENT_ONBOARDING_VERSION = 2

// AuthProvider에서 체크
if (userProfile.onboarding_version < CURRENT_ONBOARDING_VERSION) {
  setShowOnboarding(true)
}
```

### 온보딩 스킵 기능

```tsx
// OnboardingModal에 추가
<button
  onClick={() => {
    updateUser({ onboarding_skipped: true })
    onClose()
  }}
  className={defaultTheme.ui.textMuted}
>
  건너뛰기
</button>
```

### A/B 테스트

- Landing Page 카피 테스트
- Onboarding Step 순서 테스트
- CTA 버튼 문구 테스트

---

## 파일 구조 요약

```
app/
├── (landing)/
│   ├── page.tsx                    # Landing Page
│   └── layout.tsx                  # Landing 전용 레이아웃
│
├── (main)/                         # 기존 앱 (선택적 리팩토링)
│   └── page.tsx
│
├── components/
│   ├── landing/
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── CTAButton.tsx
│   │   └── Footer.tsx
│   │
│   ├── onboarding/
│   │   ├── OnboardingModal.tsx
│   │   ├── WelcomeStep.tsx
│   │   ├── TimelineStep.tsx
│   │   └── MentionStep.tsx
│   │
│   ├── auth/
│   │   └── LoginModal.tsx
│   │
│   └── common/
│       └── Header.tsx              # 도움말 버튼 추가
│
├── providers/
│   └── AuthProvider.tsx            # 온보딩 상태 추가
│
├── lib/
│   ├── theme.ts                    # 기존 (수정 없음)
│   └── queries.ts                  # useCompleteOnboarding 추가
│
└── middleware.ts                   # 루트 리다이렉트 로직

docs/
├── onboarding-feature-options.md  # 이전 논의 문서
└── landing-and-onboarding-implementation-plan.md  # 이 문서
```

---

## 참고 자료

### 기존 문서
- `docs/prd_v2.md`: 프로젝트 전체 명세
- `docs/implementation_checklist.md`: 구현 현황
- `CLAUDE.md`: 프로젝트 컨벤션 및 디자인 시스템

### 색상 시스템
- `app/lib/theme.ts`: 전체 색상 팔레트
- `app/globals.css`: CSS 변수

### 기존 컴포넌트 참고
- `app/components/auth/LoginModal.tsx`: Radix Dialog 사용 예시
- `app/components/common/Header.tsx`: Header 구조

---

**End of Document**
