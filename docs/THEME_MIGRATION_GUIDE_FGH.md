# 🎨 테마 시스템 마이그레이션 가이드 (추가 작업자: F, G, H)

> **목표:** A~E가 놓친 모든 파일 완전 변환
> **작업자:** 3명 (Person F, G, H)
> **예상 시간:** 각자 30-40분
> **날짜:** 2025-12-06

---

## 📋 상황 설명

**Person A~E는 다음을 담당했습니다:**
- Person A: 핵심 theme.ts, ThemeProvider
- Person B: Header, SearchResults, LoginModal
- Person C: MainContainer, MemoCard, RightSidebar
- Person D: EntityTimeline, Drawers (Entity/Memo)
- Person E: BaseDrawer, SettingsDrawer, Tooltips, Modals

**하지만 다음 파일들이 누락되었습니다:**
- ✅ **InputArea** (메인 입력창 - 매우 중요!)
- ✅ **Landing 페이지** (전체)
- ✅ **Import 페이지** (전체)
- ✅ **Onboarding 모달** (4개 컴포넌트)
- ✅ **Page 파일들** (app/page.tsx, app/entities/page.tsx, app/import/page.tsx 등)
- ✅ **기타 컴포넌트** (MentionList, DevOnboardingButton 등)

---

## 🚀 시작하기 전 필수 확인사항

### 전체 팀 공통

1. **Person A의 작업 완료 대기**
   - Person A가 `theme.ts`를 완료하고 dev에 병합할 때까지 대기
   - 병합 완료 공지 받으면 시작

2. **최신 코드 pull**
   ```bash
   git checkout dev
   git pull origin dev
   ```

3. **브랜치 생성**
   ```bash
   git checkout -b theme-migration-[본인이름]
   ```

4. **작업 시작 전 빌드 확인**
   ```bash
   npm install
   npm run build
   ```

---

## 📦 Person F: Input & Pages & Utils

### 담당 파일 (12개)
- ✅ `app/components/home/InputArea.tsx` ⭐⭐⭐ (가장 중요!)
- ✅ `app/page.tsx` (메인 홈)
- ✅ `app/entities/page.tsx`
- ✅ `app/import/page.tsx`
- ✅ `app/landing/page.tsx`
- ✅ `app/not-found.tsx`
- ✅ `app/layout.tsx` (검증만 - Person A가 수정했을 수도)
- ✅ `app/hooks/tiptap/MentionList.tsx`
- ✅ `app/lib/utils/highlightEntities.tsx`
- ✅ `app/components/entities/EntityDropdown.tsx` (Person D가 놓쳤을 수도)
- ✅ `app/components/home/MemoEditDrawer.tsx` (Person D가 놓쳤을 수도)
- ✅ `app/components/common/DevOnboardingButton.tsx`

### 작업 내용

#### 1. **InputArea.tsx** ⭐⭐⭐ (최우선 - 메인 입력창!)

**현재 문제:**
```tsx
// ❌ Before (18-50번 줄)
<div className="px-4 bg-bg-primary">
  <div className={`border-t border-border-main`}>
    <div className="border border-border-main/30 focus-within:border-border-main">
      <div className="text-text-muted">
      <button className="text-text-muted hover:bg-bg-secondary">
```

**변환 후:**
```tsx
// ✅ After
import { useTheme } from '@/app/providers/ThemeProvider'

export default function InputArea() {
  const { editor, isSubmitting, handleSubmit } = useTiptapEditor()
  const { isFullWidth } = useLayout()
  const { theme } = useTheme()  // ← 추가!

  return (
    <div
      className="px-4"
      style={{ backgroundColor: theme.ui.primaryBg }}
    >
      <div
        className={`${isFullWidth ? 'w-full' : 'max-w-3xl mx-auto'} border-t py-3`}
        style={{ borderColor: theme.ui.border }}
      >
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2 transition-all border"
          style={{
            backgroundColor: 'transparent',
            borderColor: `${theme.ui.border}4D`, // 30% opacity = 4D
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = theme.ui.border
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = `${theme.ui.border}4D`
          }}
        >
          {/* Editor area */}
          <div className="flex-1 min-w-0">
            {!editor ? (
              <div
                className="animate-pulse text-sm"
                style={{ color: theme.ui.textMuted }}
              >
                메모를 작성하세요...
              </div>
            ) : (
              <EditorContent editor={editor} className="tiptap-editor" />
            )}
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!editor || !editor.getText().trim() || isSubmitting}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: theme.ui.textMuted }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.color = '#ffffff'
                e.currentTarget.style.backgroundColor = theme.ui.secondaryBg
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.color = theme.ui.textMuted
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
            title="메모 저장 (Ctrl+Enter)"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Hint text */}
        <div
          className="text-xs mt-1.5 px-1"
          style={{ color: `${theme.ui.textMuted}80` }} // 50% opacity
        >
          {/* ... hint content ... */}
        </div>
      </div>
    </div>
  )
}
```

**특별 주의:**
- `border-border-main/30` → `${theme.ui.border}4D` (30% = 0x4D)
- `text-text-muted/50` → `${theme.ui.textMuted}80` (50% = 0x80)
- hover 상태는 `onMouseEnter/Leave` 사용

#### 2. **MentionList.tsx** (Tiptap 멘션 드롭다운)

**파일 읽어서 theme 사용 확인 후 변환:**
```tsx
// 예상 패턴
const { theme } = useTheme()

// ❌ Before
<div className="bg-bg-secondary border-border-main">

// ✅ After
<div
  className="rounded-lg shadow-xl"
  style={{
    backgroundColor: theme.ui.secondaryBg,
    borderColor: theme.ui.border,
    border: '1px solid',
  }}
>
```

#### 3. **Page 파일들** (app/page.tsx, app/entities/page.tsx 등)

**대부분 page.tsx는 레이아웃만 있고 theme을 직접 사용하지 않을 수 있습니다.**

**확인 방법:**
```bash
grep "bg-\|text-\|border-" app/page.tsx
```

**만약 theme 클래스 사용하면:**
```tsx
// Server Component인 경우 theme 사용 불가!
// → 하드코딩된 색상을 globals.css의 CSS 변수로 변경

// ❌ Before (Server Component)
<div className="bg-bg-primary">

// ✅ After (Client Component로 변경 또는 inline style)
'use client'
import { useTheme } from '@/app/providers/ThemeProvider'

export default function Page() {
  const { theme } = useTheme()

  return <div style={{ backgroundColor: theme.ui.primaryBg }}>
}
```

**또는 CSS 변수 사용:**
```tsx
// Server Component 유지
<div style={{ backgroundColor: 'var(--color-bg-primary)' }}>
```

#### 4. **EntityDropdown.tsx, MemoEditDrawer.tsx**

**Person D가 놓쳤을 가능성:**
- EntityDropdown: Entity 선택 드롭다운
- MemoEditDrawer: 이미 Person D에 있을 수도 (확인 필요)

**변환 패턴:**
```tsx
const { theme } = useTheme()

// Dropdown 배경
<div
  className="absolute z-10 mt-1 rounded-lg shadow-lg border max-h-60 overflow-auto"
  style={{
    backgroundColor: theme.ui.secondaryBg,
    borderColor: theme.ui.border,
  }}
>
```

#### 5. **not-found.tsx**

**404 페이지:**
```tsx
'use client'
import { useTheme } from '@/app/providers/ThemeProvider'

export default function NotFound() {
  const { theme } = useTheme()

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      style={{ backgroundColor: theme.ui.primaryBg }}
    >
      <h1 style={{ color: theme.ui.textPrimary }}>404 - Page Not Found</h1>
    </div>
  )
}
```

#### 6. **highlightEntities.tsx** (유틸리티)

**이 파일이 theme을 어떻게 사용하는지 확인:**
```bash
cat app/lib/utils/highlightEntities.tsx
```

**아마도 getMentionHighlightClass() 같은 함수가 있을 것:**
```tsx
// Person A가 만든 새로운 함수 사용
import { getMentionHighlightStyle } from '@/app/lib/theme'

// ❌ Before
const className = getMentionHighlightClass(type, false, theme)

// ✅ After
const style = getMentionHighlightStyle(type, false, theme)
```

#### 체크리스트
- [ ] InputArea.tsx 완전 변환 (최우선!)
- [ ] MentionList.tsx 변환
- [ ] page.tsx 파일들 확인 및 변환 (5개)
- [ ] EntityDropdown.tsx 변환 (Person D가 안 했으면)
- [ ] MemoEditDrawer.tsx 확인 (Person D가 했는지)
- [ ] not-found.tsx 변환
- [ ] highlightEntities.tsx 변환
- [ ] DevOnboardingButton.tsx 변환
- [ ] npm run build 성공

---

## 🏠 Person G: Landing Page 전체

### 담당 파일 (3개)
- ✅ `app/components/landing/HeroSection.tsx`
- ✅ `app/components/landing/FeaturesSection.tsx`
- ✅ `app/landing/page.tsx` (메인 레이아웃)

### 작업 내용

#### 1. **HeroSection.tsx**

**Landing 페이지 히어로 섹션:**
```tsx
import { useTheme } from '@/app/providers/ThemeProvider'

export default function HeroSection() {
  const { theme } = useTheme()

  return (
    <section
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: theme.ui.primaryBg }}
    >
      {/* 타이틀 */}
      <h1
        className="text-6xl font-bold mb-6"
        style={{ color: theme.ui.textPrimary }}
      >
        Unlooped MVP
      </h1>

      {/* 설명 */}
      <p
        className="text-xl mb-8"
        style={{ color: theme.ui.textSecondary }}
      >
        Your personal knowledge timeline
      </p>

      {/* CTA 버튼 */}
      <button
        className="px-8 py-4 rounded-lg text-lg font-semibold transition-all"
        style={{
          backgroundColor: theme.ui.interactive.primaryBg,
          color: '#ffffff',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.ui.interactive.primaryBgHover
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.ui.interactive.primaryBg
        }}
      >
        Get Started
      </button>
    </section>
  )
}
```

#### 2. **FeaturesSection.tsx**

**기능 소개 섹션:**
```tsx
import { useTheme } from '@/app/providers/ThemeProvider'

export default function FeaturesSection() {
  const { theme } = useTheme()

  const features = [
    { title: 'Timeline View', description: '...' },
    { title: 'Entity Linking', description: '...' },
    { title: 'AI-Powered', description: '...' },
  ]

  return (
    <section
      className="py-20"
      style={{ backgroundColor: theme.ui.secondaryBg }}
    >
      <div className="container mx-auto px-4">
        <h2
          className="text-4xl font-bold text-center mb-12"
          style={{ color: theme.ui.textPrimary }}
        >
          Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-lg border"
              style={{
                backgroundColor: theme.ui.cardBg,
                borderColor: theme.ui.border,
              }}
            >
              <h3
                className="text-2xl font-semibold mb-4"
                style={{ color: theme.ui.textPrimary }}
              >
                {feature.title}
              </h3>
              <p style={{ color: theme.ui.textSecondary }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

#### 3. **app/landing/page.tsx**

**Landing 페이지 레이아웃:**
```tsx
'use client'

import HeroSection from '@/app/components/landing/HeroSection'
import FeaturesSection from '@/app/components/landing/FeaturesSection'

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
    </>
  )
}
```

**또는 Server Component인 경우:**
- HeroSection, FeaturesSection이 각자 'use client'로 선언되어 있으면 됨

#### 체크리스트
- [ ] HeroSection.tsx 완전 변환
- [ ] FeaturesSection.tsx 완전 변환
- [ ] landing/page.tsx 확인 (레이아웃만 있을 수도)
- [ ] Landing 페이지 방문해서 테마 전환 테스트
- [ ] npm run build 성공

---

## 📥 Person H: Import & Onboarding

### 담당 파일 (9개)

#### Import 관련 (5개)
- ✅ `app/components/import/ImportPage.tsx`
- ✅ `app/components/import/TextInput.tsx`
- ✅ `app/components/import/ParsePreview.tsx`
- ✅ `app/components/import/ImportProgress.tsx`
- ✅ `app/components/import/ResultSummary.tsx`

#### Onboarding 관련 (4개)
- ✅ `app/components/onboarding/OnboardingModal.tsx` (Person B가 안 했으면)
- ✅ `app/components/onboarding/WelcomeStep.tsx`
- ✅ `app/components/onboarding/TimelineStep.tsx`
- ✅ `app/components/onboarding/MentionStep.tsx`

### 작업 내용

#### 1. **ImportPage.tsx** (메인 Import 컴포넌트)

**예상 구조:**
```tsx
import { useTheme } from '@/app/providers/ThemeProvider'

export default function ImportPage() {
  const { theme } = useTheme()
  const [step, setStep] = useState(1)

  return (
    <div
      className="min-h-screen p-8"
      style={{ backgroundColor: theme.ui.primaryBg }}
    >
      {/* Header */}
      <h1
        className="text-3xl font-bold mb-8"
        style={{ color: theme.ui.textPrimary }}
      >
        Import Data
      </h1>

      {/* Step indicator */}
      <div className="flex items-center gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: step >= i ? theme.ui.interactive.primary : theme.ui.gray[600],
              color: '#ffffff',
            }}
          >
            {i}
          </div>
        ))}
      </div>

      {/* Content */}
      {step === 1 && <TextInput onNext={...} />}
      {step === 2 && <ParsePreview onNext={...} />}
      {step === 3 && <ImportProgress />}
    </div>
  )
}
```

#### 2. **TextInput.tsx**

**텍스트 입력 영역:**
```tsx
import { useTheme } from '@/app/providers/ThemeProvider'

export default function TextInput({ onNext }) {
  const { theme } = useTheme()
  const [text, setText] = useState('')

  return (
    <div
      className="rounded-lg p-6 border"
      style={{
        backgroundColor: theme.ui.cardBg,
        borderColor: theme.ui.border,
      }}
    >
      <label
        className="block mb-2 text-sm font-medium"
        style={{ color: theme.ui.textSecondary }}
      >
        Paste your data
      </label>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-64 p-4 rounded-lg border focus:outline-none"
        style={{
          backgroundColor: theme.ui.secondaryBg,
          color: theme.ui.textPrimary,
          borderColor: theme.ui.border,
        }}
        placeholder="Paste your import data here..."
      />

      <button
        onClick={() => onNext(text)}
        className="mt-4 px-6 py-3 rounded-lg transition-colors"
        style={{
          backgroundColor: theme.ui.interactive.primaryBg,
          color: '#ffffff',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.ui.interactive.primaryBgHover
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.ui.interactive.primaryBg
        }}
      >
        Parse
      </button>
    </div>
  )
}
```

#### 3. **ParsePreview.tsx**

**파싱 결과 미리보기:**
```tsx
import { useTheme } from '@/app/providers/ThemeProvider'

export default function ParsePreview({ data, onNext }) {
  const { theme } = useTheme()

  return (
    <div
      className="rounded-lg p-6 border"
      style={{
        backgroundColor: theme.ui.cardBg,
        borderColor: theme.ui.border,
      }}
    >
      <h2
        className="text-xl font-semibold mb-4"
        style={{ color: theme.ui.textPrimary }}
      >
        Preview ({data.length} items)
      </h2>

      <div className="space-y-2 max-h-96 overflow-auto">
        {data.map((item, i) => (
          <div
            key={i}
            className="p-3 rounded border"
            style={{
              backgroundColor: theme.ui.secondaryBg,
              borderColor: theme.ui.borderSubtle,
            }}
          >
            <span style={{ color: theme.ui.textPrimary }}>
              {item.content}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={onNext}
          className="px-6 py-3 rounded-lg"
          style={{
            backgroundColor: theme.ui.interactive.primaryBg,
            color: '#ffffff',
          }}
        >
          Import
        </button>
      </div>
    </div>
  )
}
```

#### 4. **ImportProgress.tsx**

**진행 상황 표시:**
```tsx
import { useTheme } from '@/app/providers/ThemeProvider'

export default function ImportProgress() {
  const { theme } = useTheme()
  const [progress, setProgress] = useState(0)

  return (
    <div
      className="rounded-lg p-6 border"
      style={{
        backgroundColor: theme.ui.cardBg,
        borderColor: theme.ui.border,
      }}
    >
      <h2
        className="text-xl font-semibold mb-4"
        style={{ color: theme.ui.textPrimary }}
      >
        Importing...
      </h2>

      {/* Progress bar */}
      <div
        className="w-full h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: theme.ui.gray[700] }}
      >
        <div
          className="h-full transition-all"
          style={{
            width: `${progress}%`,
            backgroundColor: theme.ui.interactive.primary,
          }}
        />
      </div>

      <p
        className="mt-4 text-center"
        style={{ color: theme.ui.textSecondary }}
      >
        {progress}% complete
      </p>
    </div>
  )
}
```

#### 5. **ResultSummary.tsx**

**결과 요약:**
```tsx
import { useTheme } from '@/app/providers/ThemeProvider'

export default function ResultSummary({ result }) {
  const { theme } = useTheme()

  return (
    <div
      className="rounded-lg p-6 border"
      style={{
        backgroundColor: theme.ui.cardBg,
        borderColor: theme.ui.border,
      }}
    >
      <h2
        className="text-2xl font-semibold mb-4"
        style={{ color: theme.ui.interactive.successText }}
      >
        ✓ Import Complete
      </h2>

      <div className="space-y-2">
        <p style={{ color: theme.ui.textPrimary }}>
          Successfully imported <strong>{result.count}</strong> items
        </p>

        {result.errors > 0 && (
          <p style={{ color: theme.ui.error.text }}>
            {result.errors} items failed
          </p>
        )}
      </div>

      <button
        onClick={() => window.location.href = '/'}
        className="mt-6 px-6 py-3 rounded-lg"
        style={{
          backgroundColor: theme.ui.interactive.primaryBg,
          color: '#ffffff',
        }}
      >
        Go to Home
      </button>
    </div>
  )
}
```

#### 6. **OnboardingModal.tsx** (Person B가 안 했으면)

**온보딩 모달 메인:**
```tsx
import { useTheme } from '@/app/providers/ThemeProvider'

export default function OnboardingModal({ isOpen, onClose }) {
  const { theme } = useTheme()
  const [step, setStep] = useState(0)

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: theme.drawer.overlay }}
    >
      <div
        className="rounded-lg p-8 max-w-2xl w-full mx-4"
        style={{
          backgroundColor: theme.drawer.background,
          borderColor: theme.drawer.border,
          border: '1px solid',
        }}
      >
        {/* Step content */}
        {step === 0 && <WelcomeStep onNext={() => setStep(1)} />}
        {step === 1 && <TimelineStep onNext={() => setStep(2)} />}
        {step === 2 && <MentionStep onClose={onClose} />}
      </div>
    </div>
  )
}
```

#### 7-9. **WelcomeStep, TimelineStep, MentionStep**

**각 스텝 컴포넌트:**
```tsx
import { useTheme } from '@/app/providers/ThemeProvider'

export default function WelcomeStep({ onNext }) {
  const { theme } = useTheme()

  return (
    <div>
      <h2
        className="text-3xl font-bold mb-4"
        style={{ color: theme.drawer.header.title }}
      >
        Welcome to Unlooped! 👋
      </h2>

      <p
        className="mb-6 text-lg"
        style={{ color: theme.drawer.section.text }}
      >
        Let's get you started with a quick tour
      </p>

      <button
        onClick={onNext}
        className="px-6 py-3 rounded-lg"
        style={{
          backgroundColor: theme.drawer.button.primary.bg,
          color: theme.drawer.button.primary.text,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.drawer.button.primary.bgHover
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.drawer.button.primary.bg
        }}
      >
        Next
      </button>
    </div>
  )
}
```

**TimelineStep, MentionStep도 동일한 패턴 적용**

#### 체크리스트
- [ ] ImportPage.tsx 완전 변환
- [ ] TextInput.tsx 완전 변환
- [ ] ParsePreview.tsx 완전 변환
- [ ] ImportProgress.tsx 완전 변환
- [ ] ResultSummary.tsx 완전 변환
- [ ] OnboardingModal.tsx 변환 (Person B가 안 했으면)
- [ ] WelcomeStep.tsx 완전 변환
- [ ] TimelineStep.tsx 완전 변환
- [ ] MentionStep.tsx 완전 변환
- [ ] npm run build 성공

---

## ✅ 작업 완료 후 병합 프로세스

### 1. 각자 로컬 테스트

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 확인
# Person F: / (메인), /entities, InputArea 입력 테스트
# Person G: /landing
# Person H: /import, 온보딩 모달 (Settings에서 "기능 소개" 클릭)
```

### 2. 빌드 테스트

```bash
npm run build
# 성공하면 다음 단계로
```

### 3. 커밋 & 푸시

```bash
git add [수정한 파일들]

git commit -m "refactor(theme): migrate [본인 담당 영역] to hex-based theme system"

# 예시:
# Person F: "refactor(theme): migrate InputArea, Pages, and Utils to hex theme"
# Person G: "refactor(theme): migrate Landing page to hex theme"
# Person H: "refactor(theme): migrate Import and Onboarding to hex theme"

git push origin theme-migration-[본인이름]
```

### 4. 병합 순서

**F, G, H는 A가 병합된 후에 순차 병합:**

1. Person A 병합 대기 → 완료 후
2. Person F 병합 (InputArea가 중요해서 먼저)
3. Person G 병합
4. Person H 병합

```bash
# 각자 dev에서 최신 코드 pull 후 병합
git checkout theme-migration-F
git pull origin dev
git merge dev  # 충돌 해결

git checkout dev
git merge theme-migration-F
git push origin dev
```

---

## 🚨 자주 발생하는 문제 & 해결법

### 문제 1: InputArea에서 focus 이벤트가 작동 안 함

**원인:** div에 focus 이벤트는 직접 작동 안 함

**해결:**
```tsx
// ❌ Wrong
<div onFocus={...}>

// ✅ Correct - 자식 input/editor에 적용
<div className="input-wrapper">
  <EditorContent
    editor={editor}
    onFocus={() => {
      document.querySelector('.input-wrapper').style.borderColor = theme.ui.border
    }}
  />
</div>
```

### 문제 2: Landing 페이지가 Server Component라서 useTheme 못 씀

**원인:** page.tsx가 기본적으로 Server Component

**해결:**
```tsx
// 파일 맨 위에 추가
'use client'

import { useTheme } from '@/app/providers/ThemeProvider'
```

### 문제 3: Import 페이지에서 textarea placeholder 색상이 안 바뀜

**원인:** placeholder는 pseudo-element라서 style 속성으로 못 바꿈

**해결:**
```tsx
<style jsx>{`
  textarea::placeholder {
    color: ${theme.ui.textPlaceholder};
  }
`}</style>

<textarea ... />
```

**또는 CSS 클래스 사용:**
```css
/* globals.css */
.custom-textarea::placeholder {
  color: var(--color-text-muted);
}
```

### 문제 4: Onboarding 모달 오버레이 클릭 시 닫히게 하기

**추가 기능:**
```tsx
<div
  className="fixed inset-0 z-50"
  style={{ backgroundColor: theme.drawer.overlay }}
  onClick={onClose}  // 오버레이 클릭 시 닫기
>
  <div
    className="modal-content"
    onClick={(e) => e.stopPropagation()}  // 모달 내부 클릭은 전파 방지
  >
    {/* content */}
  </div>
</div>
```

---

## 📊 진행 상황 체크리스트

### Person F (Input & Pages)
- [ ] InputArea.tsx ⭐⭐⭐
- [ ] MentionList.tsx
- [ ] page.tsx (5개 파일)
- [ ] EntityDropdown.tsx
- [ ] MemoEditDrawer.tsx (확인)
- [ ] not-found.tsx
- [ ] highlightEntities.tsx
- [ ] DevOnboardingButton.tsx
- [ ] npm run build 성공
- [ ] 커밋 & 푸시 완료

### Person G (Landing)
- [ ] HeroSection.tsx
- [ ] FeaturesSection.tsx
- [ ] landing/page.tsx
- [ ] Landing 페이지 테마 전환 테스트
- [ ] npm run build 성공
- [ ] 커밋 & 푸시 완료

### Person H (Import & Onboarding)
- [ ] ImportPage.tsx
- [ ] TextInput.tsx
- [ ] ParsePreview.tsx
- [ ] ImportProgress.tsx
- [ ] ResultSummary.tsx
- [ ] OnboardingModal.tsx
- [ ] WelcomeStep.tsx
- [ ] TimelineStep.tsx
- [ ] MentionStep.tsx
- [ ] Import 페이지 테마 전환 테스트
- [ ] Onboarding 모달 테마 전환 테스트
- [ ] npm run build 성공
- [ ] 커밋 & 푸시 완료

---

## 🎯 최종 목표

**F, G, H 작업 완료 후:**
- ✅ **모든 컴포넌트** 테마 시스템 적용 완료
- ✅ InputArea (메인 입력창) 테마 전환 정상
- ✅ Landing 페이지 테마 전환 정상
- ✅ Import 페이지 테마 전환 정상
- ✅ Onboarding 모달 테마 전환 정상
- ✅ **누락된 컴포넌트 0개**

**Success criteria:**
1. `npm run build` 에러 없음
2. 모든 페이지에서 테마 전환 정상 작동
3. InputArea에서 메모 입력 시 테마 색상 적용
4. Landing 페이지 방문 시 테마 색상 적용
5. Import 페이지에서 테마 색상 적용
6. Onboarding 모달 테마 색상 적용

---

## 📞 문의 및 지원

**문제 발생 시:**
1. 이 문서의 "자주 발생하는 문제 & 해결법" 섹션 확인
2. Person A~E에게 유사한 작업 예시 요청
3. 팀 채팅방에 스크린샷과 함께 문의

**작업 시간:** 각자 30-40분 예상

**화이팅! 🚀**
