# 🎨 Unlooped MVP - Claude 스타일 디자인 시스템

> Claude 웹사이트의 세련되고 모던한 디자인 철학을 다크 모드 기반 프로젝트에 적용하기 위한 가이드

## 📋 목차

1. [디자인 철학](#디자인-철학)
2. [색상 시스템](#색상-시스템)
3. [타이포그래피](#타이포그래피)
4. [레이아웃 및 간격](#레이아웃-및-간격)
5. [컴포넌트 스타일](#컴포넌트-스타일)
6. [애니메이션 및 인터랙션](#애니메이션-및-인터랙션)
7. [구현 로드맵](#구현-로드맵)

---

## 디자인 철학

### Claude 웹사이트의 핵심 특징

Claude 웹사이트는 다음과 같은 디자인 원칙을 따릅니다:

1. **미니멀리즘**: 불필요한 요소를 제거하고 본질에 집중
2. **부드러움**: 둥근 모서리, 은은한 그림자, 부드러운 트랜지션
3. **공간감**: 넉넉한 여백과 여유로운 레이아웃
4. **계층 구조**: 명확한 시각적 계층으로 정보 전달
5. **세련된 색상**: 절제된 색상 팔레트와 미묘한 그라데이션

### 우리 프로젝트에 적용하는 방법

현재 프로젝트는 **다크 모드 기반**이므로, Claude의 라이트 모드 디자인을 다크 모드로 변환하면서도 세련된 느낌을 유지합니다.

**핵심 전략:**
- 깊이감 있는 다크 배경 사용
- 부드러운 블러 효과와 그라데이션
- 미묘한 하이라이트와 그림자로 입체감 표현
- 넉넉한 여백과 타이포그래피 중심 레이아웃

---

## 색상 시스템

### 1. 기본 배경 색상 (Dark Mode)

```typescript
// app/lib/theme.ts 업데이트 예시

background: {
  primary: '#0A0E17',      // 매우 어두운 배경 (Claude의 깊이감)
  secondary: '#141821',    // 카드/섹션 배경
  tertiary: '#1C2029',     // hover 상태
  elevated: '#242938',     // 모달/드롭다운 (더 밝게)
}
```

**특징:**
- 순수 검정(#000000) 대신 약간의 블루 톤이 섞인 다크 컬러 사용
- 깊이감을 위한 미묘한 색상 차이 (5-10% 명도 차이)
- 부드러운 계층 구조

### 2. 액센트 색상 (Claude 스타일)

Claude의 시그니처 컬러는 **부드러운 퍼플-블루 그라데이션**입니다.

```typescript
accent: {
  // Primary - Claude 시그니처 퍼플
  primary: {
    base: '#A78BFA',        // purple-400
    light: '#C4B5FD',       // purple-300
    dark: '#8B5CF6',        // purple-500
    glow: 'rgba(167, 139, 250, 0.3)',  // 글로우 효과용
  },

  // Secondary - 블루 액센트
  secondary: {
    base: '#60A5FA',        // blue-400
    light: '#93C5FD',       // blue-300
    dark: '#3B82F6',        // blue-500
  },

  // Gradient (Claude 대표 그라데이션)
  gradient: {
    primary: 'linear-gradient(135deg, #A78BFA 0%, #60A5FA 100%)',
    subtle: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(96, 165, 250, 0.1) 100%)',
  }
}
```

### 3. Entity Type 색상 (현재 규칙 유지 + 개선)

기존 규칙을 유지하되, 더 세련되게:

```typescript
entityTypes: {
  person: {
    base: '#10B981',        // emerald-500 (초록)
    light: '#34D399',       // emerald-400
    glow: 'rgba(16, 185, 129, 0.2)',
  },
  project: {
    base: '#A78BFA',        // purple-400 (보라)
    light: '#C4B5FD',       // purple-300
    glow: 'rgba(167, 139, 250, 0.2)',
  },
  event: {
    base: '#F59E0B',        // amber-500 (주황)
    light: '#FBBF24',       // amber-400
    glow: 'rgba(245, 158, 11, 0.2)',
  },
}
```

### 4. 텍스트 색상 (Claude 스타일 대비)

```typescript
text: {
  primary: '#F8FAFC',       // slate-50 (거의 흰색, 부드러움)
  secondary: '#CBD5E1',     // slate-300 (중간 회색)
  tertiary: '#94A3B8',      // slate-400 (보조 텍스트)
  muted: '#64748B',         // slate-500 (흐릿한 텍스트)
  disabled: '#475569',      // slate-600 (비활성)
}
```

**중요:** Claude는 순수 흰색(#FFFFFF) 대신 **약간 회색빛 도는 흰색**을 사용해 눈의 피로를 줄입니다.

---

## 타이포그래피

### 1. 폰트 패밀리

Claude는 **Inter** 폰트를 사용합니다. 우리 프로젝트도 이미 Inter를 사용 중이므로 유지합니다.

```css
/* app/globals.css */
@theme {
  --font-family-sans: 'Inter', var(--font-noto-sans-kr), sans-serif;
}
```

### 2. 폰트 크기 및 스케일 (Claude 스타일)

Claude는 **큰 타이포그래피**를 사용하여 가독성과 우아함을 강조합니다.

```typescript
// tailwind.config.js 또는 theme.ts 업데이트
fontSize: {
  // 기본 크기 증가
  'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
  'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
  'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px (기본)
  'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
  'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px

  // 헤딩 - Claude 스타일 (더 크고 여유있게)
  '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
  '5xl': ['3rem', { lineHeight: '3.5rem' }],      // 48px
}
```

### 3. 폰트 무게 (Font Weight)

```typescript
fontWeight: {
  light: 300,
  normal: 400,    // 본문
  medium: 500,    // 강조
  semibold: 600,  // 제목
  bold: 700,      // 헤딩
}
```

**사용 가이드:**
- 본문: 400 (normal)
- 메뉴/버튼: 500 (medium)
- 섹션 제목: 600 (semibold)
- 페이지 제목: 700 (bold)

### 4. Letter Spacing

```typescript
letterSpacing: {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
}
```

**적용:**
- 큰 헤딩: `tracking-tight` (-0.025em)
- 본문: `tracking-normal`
- 버튼/라벨: `tracking-wide` (0.025em)

---

## 레이아웃 및 간격

### 1. 간격 시스템 (Spacing Scale)

Claude는 **8px 기반 그리드**를 사용하되, 더 넉넉한 간격을 선호합니다.

```typescript
// 권장 간격 사용
spacing: {
  // 기본
  'xs': '0.5rem',   // 8px
  'sm': '0.75rem',  // 12px
  'md': '1rem',     // 16px
  'lg': '1.5rem',   // 24px
  'xl': '2rem',     // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px
}
```

**사용 예시:**
```tsx
// 컴포넌트 내부 패딩: lg (24px)
<div className="p-6">

// 섹션 간 간격: 2xl (48px)
<div className="space-y-12">

// 페이지 여백: 3xl (64px)
<div className="py-16">
```

### 2. 컨테이너 너비

```typescript
maxWidth: {
  'xs': '20rem',    // 320px - 작은 모달
  'sm': '24rem',    // 384px - 폼
  'md': '28rem',    // 448px - 카드
  'lg': '32rem',    // 512px - 드로어
  'xl': '36rem',    // 576px - 메인 콘텐츠 (현재 프로젝트)
  '2xl': '42rem',   // 672px
  '3xl': '48rem',   // 768px - Claude 스타일 (더 넓게)
  '4xl': '56rem',   // 896px
  '5xl': '64rem',   // 1024px
  '6xl': '72rem',   // 1152px
  '7xl': '80rem',   // 1280px
}
```

**권장:**
- 현재 프로젝트의 메인 콘텐츠 너비를 `xl` (36rem)에서 **`3xl` (48rem)**로 변경
- 더 넉넉한 레이아웃으로 Claude 스타일에 가깝게

### 3. Border Radius (둥근 모서리)

Claude는 **매우 둥근 모서리**를 사용합니다.

```typescript
borderRadius: {
  'none': '0px',
  'sm': '0.25rem',    // 4px
  'base': '0.5rem',   // 8px (기본)
  'md': '0.75rem',    // 12px
  'lg': '1rem',       // 16px (카드)
  'xl': '1.5rem',     // 24px (큰 카드/모달)
  '2xl': '2rem',      // 32px (Claude 스타일)
  '3xl': '3rem',      // 48px (특별한 요소)
  'full': '9999px',   // 완전 둥글게 (버튼, 아바타)
}
```

**적용:**
```tsx
// 카드/섹션: xl (24px)
<div className="rounded-xl">

// 버튼: full
<button className="rounded-full">

// 모달: 2xl (32px)
<div className="rounded-2xl">
```

---

## 컴포넌트 스타일

### 1. 카드 (Card)

Claude 스타일 카드는 **블러 효과와 미묘한 그라데이션**을 사용합니다.

```tsx
// Claude 스타일 카드
<div className="
  relative
  bg-gradient-to-br from-[#141821] to-[#1C2029]
  backdrop-blur-xl
  border border-white/5
  rounded-2xl
  p-6
  shadow-2xl shadow-black/20
  hover:border-white/10
  hover:shadow-purple-500/10
  transition-all duration-300
">
  {/* 글로우 효과 */}
  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />

  {/* 콘텐츠 */}
  <div className="relative z-10">
    {children}
  </div>
</div>
```

**특징:**
- 그라데이션 배경
- `backdrop-blur-xl` 효과
- 미묘한 보더 (`border-white/5`)
- 호버 시 글로우 효과

### 2. 버튼 (Button)

Claude의 버튼은 **부드럽고 넉넉한 패딩**을 가집니다.

```tsx
// Primary Button (Claude 스타일)
<button className="
  relative
  px-6 py-3
  bg-gradient-to-r from-purple-500 to-blue-500
  text-white font-medium
  rounded-full
  shadow-lg shadow-purple-500/30
  hover:shadow-xl hover:shadow-purple-500/40
  hover:scale-105
  active:scale-100
  transition-all duration-200
">
  <span className="relative z-10">Button Text</span>
</button>

// Secondary Button (Outline)
<button className="
  px-6 py-3
  bg-transparent
  border-2 border-purple-400/30
  text-purple-300
  rounded-full
  hover:bg-purple-500/10
  hover:border-purple-400/50
  transition-all duration-200
">
  Button Text
</button>

// Ghost Button
<button className="
  px-4 py-2
  text-slate-300
  rounded-full
  hover:bg-white/5
  hover:text-white
  transition-all duration-200
">
  Button Text
</button>
```

### 3. 입력 필드 (Input)

```tsx
<div className="relative">
  <input
    type="text"
    placeholder="Search..."
    className="
      w-full
      px-4 py-3
      bg-[#141821]
      border border-white/10
      rounded-full
      text-slate-100 placeholder-slate-500
      focus:outline-none
      focus:border-purple-400/50
      focus:ring-4 focus:ring-purple-500/20
      transition-all duration-200
    "
  />

  {/* 글로우 효과 (focus) */}
  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity -z-10" />
</div>
```

### 4. 모달/드로어 (Modal/Drawer)

```tsx
// 오버레이
<div className="fixed inset-0 bg-black/70 backdrop-blur-md" />

// 모달 콘텐츠
<div className="
  relative
  bg-gradient-to-br from-[#0A0E17] to-[#141821]
  border border-white/10
  rounded-3xl
  p-8
  shadow-2xl shadow-black/50
  max-w-2xl
">
  {/* 상단 글로우 */}
  <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl -z-10" />

  {children}
</div>
```

---

## 애니메이션 및 인터랙션

### 1. 트랜지션 타이밍

Claude는 **부드럽고 자연스러운** 애니메이션을 사용합니다.

```typescript
// tailwind.config.js
transitionDuration: {
  '75': '75ms',     // 빠른 피드백
  '100': '100ms',
  '150': '150ms',   // 기본 hover
  '200': '200ms',   // 기본 (Claude 스타일)
  '300': '300ms',   // 중간
  '500': '500ms',   // 느린
  '700': '700ms',   // 페이지 전환
}

transitionTimingFunction: {
  'ease-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',  // 기본
  'ease-elastic': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',  // 탄력있게
}
```

**권장:**
```tsx
// 기본 호버
className="transition-all duration-200"

// 부드러운 페이드
className="transition-opacity duration-300"

// 스케일 애니메이션
className="transition-transform duration-200 hover:scale-105"
```

### 2. Micro-interactions

Claude는 작은 인터랙션에도 신경을 씁니다.

```tsx
// 버튼 클릭 피드백
<button
  onClick={handleClick}
  className="
    active:scale-95
    transition-transform duration-100
  "
>

// 카드 호버 효과
<div className="
  hover:-translate-y-1
  hover:shadow-2xl
  transition-all duration-300
">

// 로딩 스피너 (부드러운 회전)
<div className="
  animate-spin
  [animation-timing-function:cubic-bezier(0.4,0,0.2,1)]
">
```

### 3. 페이지 전환 애니메이션

```tsx
// Framer Motion 사용 예시
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3, ease: 'easeOut' }}
>
  {children}
</motion.div>
```

---

## 구현 로드맵

### Phase 1: 색상 시스템 업데이트 (1-2일)

**목표:** theme.ts를 Claude 스타일로 확장

**작업:**
1. ✅ 기본 완료 (현재 Entity Type 색상)
2. 배경 색상 개선 (더 깊은 다크 톤)
3. 액센트 색상 추가 (퍼플-블루 그라데이션)
4. 글로우 효과용 색상 추가

```typescript
// app/lib/theme.ts 확장
export const claudeTheme = {
  background: {
    primary: '#0A0E17',
    secondary: '#141821',
    tertiary: '#1C2029',
    elevated: '#242938',
  },
  accent: {
    primary: {
      base: '#A78BFA',
      light: '#C4B5FD',
      dark: '#8B5CF6',
      glow: 'rgba(167, 139, 250, 0.3)',
    },
    // ... 위 색상 시스템 참고
  },
  // ... 나머지
}
```

### Phase 2: 컴포넌트 리팩토링 (3-5일)

**목표:** 주요 컴포넌트를 Claude 스타일로 업데이트

**우선순위:**
1. **카드 컴포넌트** (MemoCard, MemoCardCompact)
   - 블러 효과 추가
   - 둥근 모서리 확대 (`rounded-xl` → `rounded-2xl`)
   - 그라데이션 배경
   - 호버 글로우 효과

2. **버튼 컴포넌트**
   - Primary: 그라데이션 배경
   - 둥근 모서리 (`rounded-full`)
   - 그림자 효과

3. **입력 필드** (InputArea)
   - Focus 글로우 효과
   - 부드러운 보더

4. **모달/드로어** (MemoEditDrawer, SettingsDrawer)
   - 배경 블러
   - 상단 글로우 효과
   - 부드러운 진입/퇴장 애니메이션

### Phase 3: 레이아웃 개선 (2-3일)

**목표:** 더 넉넉한 간격과 우아한 레이아웃

**작업:**
1. 메인 컨테이너 너비 확장 (`max-w-3xl` → `max-w-5xl`)
2. 섹션 간 간격 증가
3. 패딩/마진 조정
4. 타이포그래피 크기 증가

### Phase 4: 애니메이션 추가 (2-3일)

**목표:** 부드러운 인터랙션

**작업:**
1. Framer Motion 통합
2. 페이지 전환 애니메이션
3. 스크롤 애니메이션 (Intersection Observer)
4. Micro-interactions

### Phase 5: 최적화 및 폴리싱 (2-3일)

**목표:** 성능 최적화 및 세부 조정

**작업:**
1. CSS 최적화 (불필요한 스타일 제거)
2. 애니메이션 성능 최적화
3. 접근성 개선
4. 다크 모드 토글 추가 (선택사항)

---

## 🎯 Quick Wins (빠르게 적용 가능)

바로 적용할 수 있는 작은 변경사항:

### 1. 둥근 모서리 증가
```tsx
// 기존
className="rounded-lg"  // 8px

// Claude 스타일
className="rounded-2xl"  // 32px
```

### 2. 버튼 패딩 증가
```tsx
// 기존
className="px-4 py-2"

// Claude 스타일
className="px-6 py-3"
```

### 3. 글로우 효과 추가
```tsx
// 카드에 글로우 추가
<div className="
  relative
  rounded-2xl
  shadow-xl
  hover:shadow-purple-500/20
  transition-shadow duration-300
">
```

### 4. 그라데이션 보더
```tsx
// CSS 추가
<div className="
  p-[1px]
  bg-gradient-to-br from-purple-500/30 to-blue-500/30
  rounded-2xl
">
  <div className="bg-[#141821] rounded-2xl p-6">
    {children}
  </div>
</div>
```

---

## 📚 참고 자료

- [Claude 웹사이트](https://claude.ai) - 디자인 영감
- [Inter Font](https://rsms.me/inter/) - 타이포그래피
- [Tailwind CSS](https://tailwindcss.com) - 유틸리티 클래스
- [Framer Motion](https://www.framer.com/motion/) - 애니메이션

---

## ✅ 체크리스트

프로젝트를 Claude 스타일로 전환하기 위한 단계별 체크리스트:

- [ ] Phase 1: 색상 시스템 확장
  - [ ] 배경 색상 업데이트
  - [ ] 액센트 색상 추가 (퍼플-블루)
  - [ ] 글로우 효과용 색상 정의

- [ ] Phase 2: 컴포넌트 리팩토링
  - [ ] MemoCard 업데이트
  - [ ] 버튼 스타일 개선
  - [ ] 입력 필드 개선
  - [ ] 모달/드로어 업데이트

- [ ] Phase 3: 레이아웃 개선
  - [ ] 컨테이너 너비 확장
  - [ ] 간격 시스템 조정
  - [ ] 타이포그래피 크기 증가

- [ ] Phase 4: 애니메이션
  - [ ] Framer Motion 통합
  - [ ] 페이지 전환
  - [ ] Micro-interactions

- [ ] Phase 5: 최적화
  - [ ] 성능 최적화
  - [ ] 접근성 개선
  - [ ] 최종 폴리싱

---

**마지막 업데이트:** 2024-12-05
**버전:** 1.0
