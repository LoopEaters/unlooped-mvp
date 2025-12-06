# 🚀 테마 시스템 빠른 시작 가이드

> 멀티 테마 지원 시스템 사용법 및 예제

## 📋 목차

1. [기본 사용법](#기본-사용법)
2. [테마 전환](#테마-전환)
3. [컴포넌트에서 테마 사용](#컴포넌트에서-테마-사용)
4. [Claude 스타일 테마 활성화](#claude-스타일-테마-활성화)
5. [새로운 테마 만들기](#새로운-테마-만들기)
6. [FAQ](#faq)

---

## 기본 사용법

### 1. ThemeProvider는 이미 설정되어 있습니다

`app/layout.tsx`에 이미 통합되어 있어 별도 설정 불필요:

```tsx
// ✅ 이미 설정됨!
<ThemeProvider defaultTheme="default">
  {/* 앱 컴포넌트들 */}
</ThemeProvider>
```

### 2. 컴포넌트에서 테마 사용

```tsx
'use client'

import { useTheme } from '@/app/providers/ThemeProvider'

export default function MyComponent() {
  const { theme, themeName, setTheme, toggleTheme } = useTheme()

  return (
    <div>
      {/* 현재 테마: {themeName} */}

      {/* 테마 색상 사용 */}
      <div className={theme.ui.textPrimary}>
        Primary Text
      </div>

      <div style={{ color: theme.ui.gray[400] }}>
        Gray 400 Text
      </div>

      {/* 테마 전환 버튼 */}
      <button onClick={toggleTheme}>
        Toggle Theme (Default ↔ Claude)
      </button>

      {/* 특정 테마로 전환 */}
      <button onClick={() => setTheme('claude')}>
        Switch to Claude Theme
      </button>
    </div>
  )
}
```

---

## 테마 전환

### 자동 토글 (Default ↔ Claude)

```tsx
const { toggleTheme } = useTheme()

<button onClick={toggleTheme}>
  테마 변경
</button>
```

### 특정 테마로 전환

```tsx
const { setTheme } = useTheme()

<button onClick={() => setTheme('default')}>Default</button>
<button onClick={() => setTheme('claude')}>Claude Style</button>
<button onClick={() => setTheme('custom')}>Custom</button>
```

### 현재 테마 확인

```tsx
const { themeName, theme } = useTheme()

console.log('현재 테마:', themeName)
console.log('테마 객체:', theme)
console.log('표시 이름:', theme.displayName)
```

---

## 컴포넌트에서 테마 사용

### 패턴 1: Tailwind 클래스로 사용

```tsx
const { theme } = useTheme()

<div className={theme.ui.textPrimary}>
  Text
</div>

<div className={theme.ui.interactive.primaryBg}>
  Button
</div>
```

### 패턴 2: inline style로 사용 (hex 값)

```tsx
const { theme } = useTheme()

<div style={{ color: theme.ui.gray[400] }}>
  Text
</div>

<div style={{
  backgroundColor: theme.ui.interactive.primary,
  color: '#FFF'
}}>
  Button
</div>
```

### 패턴 3: Entity Type 색상

```tsx
import { getEntityTypeColor } from '@/app/lib/theme'

const { theme } = useTheme()
const personColor = getEntityTypeColor('person', theme)

<div style={{ color: personColor.hex }}>
  Person Entity
</div>

// Claude 스타일에서만 사용 가능한 속성
{personColor.glow && (
  <div style={{ boxShadow: `0 0 20px ${personColor.glow}` }}>
    Glow Effect
  </div>
)}
```

### 패턴 4: Claude 스타일 전용 기능

```tsx
const { theme } = useTheme()

// Claude 스타일에만 있는 속성 체크
if (theme.claude) {
  return (
    <div style={{ background: theme.claude.gradient.primary }}>
      Purple-Blue Gradient
    </div>
  )
}
```

---

## Claude 스타일 테마 활성화

### 방법 1: UI에서 전환

```tsx
'use client'

import { useTheme } from '@/app/providers/ThemeProvider'

export default function ThemeSwitcher() {
  const { themeName, setTheme } = useTheme()

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setTheme('default')}
        className={themeName === 'default' ? 'active' : ''}
      >
        Default
      </button>
      <button
        onClick={() => setTheme('claude')}
        className={themeName === 'claude' ? 'active' : ''}
      >
        Claude Style
      </button>
    </div>
  )
}
```

### 방법 2: layout.tsx에서 기본 테마 변경

```tsx
// app/layout.tsx
<ThemeProvider defaultTheme="claude">  // "default" → "claude"
  {children}
</ThemeProvider>
```

### 방법 3: 로컬 스토리지 직접 설정

브라우저 콘솔에서:
```js
localStorage.setItem('app-theme', 'claude')
// 새로고침
```

---

## Claude 스타일 테마 특징

### 1. 더 깊은 다크 배경

```typescript
// Default
ui.primaryBg: 'bg-bg-primary'  // #1a1f2e

// Claude
ui.primaryBg: '#0A0E17'  // 더 어두움
```

### 2. 그라데이션 효과

```tsx
const { theme } = useTheme()

// Claude 테마에서만 사용 가능
{theme.claude && (
  <div style={{ background: theme.claude.gradient.primary }}>
    Purple-Blue Gradient
  </div>
)}
```

### 3. 글로우 효과

```tsx
const { theme } = useTheme()
const projectColor = getEntityTypeColor('project', theme)

{projectColor.glow && (
  <div style={{
    backgroundColor: projectColor.hex,
    boxShadow: `0 0 30px ${projectColor.glow}`
  }}>
    Project with Glow
  </div>
)}
```

### 4. 부드러운 텍스트 색상

```tsx
// Default: text-white (#FFFFFF)
// Claude: text-slate-50 (#F8FAFC) - 부드러운 흰색
```

---

## 새로운 테마 만들기

### 1. theme.ts에 새 테마 정의

```typescript
// app/lib/theme.ts

export const myCustomTheme: ThemeColors = {
  name: 'custom',
  displayName: 'My Custom Theme',

  entityTypes: {
    person: {
      bg: 'bg-mention-person',
      text: 'text-mention-person',
      hex: '#YOUR_COLOR',
    },
    // ... 나머지
  },

  ui: {
    primaryBg: '#YOUR_BG_COLOR',
    textPrimary: 'text-YOUR-COLOR',
    // ... 나머지
  },

  // ... 모든 필수 속성 정의
}
```

### 2. themes 객체에 추가

```typescript
export const themes: Record<ThemeName, ThemeColors> = {
  default: defaultTheme,
  claude: claudeTheme,
  custom: myCustomTheme,  // 추가
}
```

### 3. ThemeName 타입 업데이트

```typescript
export type ThemeName = 'default' | 'claude' | 'custom' | 'myNewTheme'
```

---

## 실전 예제

### 예제 1: 테마별 버튼 컴포넌트

```tsx
'use client'

import { useTheme } from '@/app/providers/ThemeProvider'

export default function ThemedButton({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()

  return (
    <button
      className={`px-6 py-3 rounded-full font-medium transition-all ${theme.ui.interactive.primaryText}`}
      style={{
        background: theme.claude?.gradient.primary || theme.ui.interactive.primaryBg,
        boxShadow: theme.claude ? '0 8px 24px rgba(167, 139, 250, 0.3)' : 'none'
      }}
    >
      {children}
    </button>
  )
}
```

### 예제 2: 테마별 카드

```tsx
'use client'

import { useTheme } from '@/app/providers/ThemeProvider'

export default function ThemedCard({ children }: { children: React.ReactNode }) {
  const { theme, themeName } = useTheme()

  const isClaudeTheme = themeName === 'claude'

  return (
    <div
      className={`p-6 rounded-2xl transition-all ${theme.ui.border}`}
      style={{
        background: isClaudeTheme
          ? theme.claude?.gradient.card
          : theme.ui.cardBg,
        backdropFilter: isClaudeTheme ? 'blur(16px)' : 'none',
      }}
    >
      {children}
    </div>
  )
}
```

### 예제 3: 테마 선택기 컴포넌트

```tsx
'use client'

import { useTheme } from '@/app/providers/ThemeProvider'
import { themes } from '@/app/lib/theme'

export default function ThemeSelector() {
  const { themeName, setTheme } = useTheme()

  return (
    <div className="flex gap-3">
      {Object.values(themes).map((theme) => (
        <button
          key={theme.name}
          onClick={() => setTheme(theme.name)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            themeName === theme.name
              ? 'bg-purple-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {theme.displayName}
        </button>
      ))}
    </div>
  )
}
```

---

## FAQ

### Q: 테마가 변경되지 않아요

A: 다음을 확인하세요:
1. `useTheme()` 훅을 ThemeProvider 내부에서 사용하고 있나요?
2. layout.tsx에 ThemeProvider가 추가되어 있나요?
3. 브라우저를 새로고침 해보세요

### Q: 로컬 스토리지에 테마가 저장되나요?

A: 네! 테마를 변경하면 자동으로 `localStorage`에 저장되어, 다음 방문 시에도 유지됩니다.

```js
// 저장 위치
localStorage.getItem('app-theme')  // 'default' | 'claude' | 'custom'
```

### Q: SSR/SSG에서 테마가 깜빡이는 현상이 있어요

A: 이는 클라이언트 사이드에서 테마를 로드하기 때문입니다. 해결 방법:

```tsx
// app/layout.tsx
<html suppressHydrationWarning>
```

이미 추가되어 있습니다!

### Q: Claude 테마만 사용하고 싶어요

A: layout.tsx에서 기본 테마를 변경하세요:

```tsx
<ThemeProvider defaultTheme="claude">
```

### Q: 기존 컴포넌트를 모두 수정해야 하나요?

A: 아니요! 기존 컴포넌트는 그대로 두고, 새로 만드는 컴포넌트부터 `useTheme()`을 사용하면 됩니다.

```tsx
// 기존 방식 (여전히 작동)
import { defaultTheme } from '@/app/lib/theme'
<div className={defaultTheme.ui.textPrimary}>

// 새로운 방식 (테마 전환 지원)
import { useTheme } from '@/app/providers/ThemeProvider'
const { theme } = useTheme()
<div className={theme.ui.textPrimary}>
```

### Q: tailwind.config에 추가 설정이 필요한가요?

A: 아니요! 모든 색상은 런타임에 적용되므로 추가 설정 불필요합니다.

---

## 다음 단계

1. **docs/design-system-claude-style.md** - Claude 스타일 디자인 시스템 가이드
2. **docs/claude-style-components-examples.md** - Claude 스타일 컴포넌트 예제
3. **app/lib/theme.ts** - 테마 정의 파일

---

## 요약

```tsx
// 1. 테마 사용
import { useTheme } from '@/app/providers/ThemeProvider'
const { theme, themeName, setTheme, toggleTheme } = useTheme()

// 2. 색상 적용
<div className={theme.ui.textPrimary}>
<div style={{ color: theme.ui.gray[400] }}>

// 3. 테마 전환
<button onClick={toggleTheme}>Toggle Theme</button>
<button onClick={() => setTheme('claude')}>Claude Style</button>

// 4. Entity 색상
import { getEntityTypeColor } from '@/app/lib/theme'
const color = getEntityTypeColor('person', theme)

// 5. Claude 전용 기능
{theme.claude && (
  <div style={{ background: theme.claude.gradient.primary }} />
)}
```

**축하합니다! 🎉 이제 멀티 테마 시스템을 사용할 준비가 되었습니다!**

---

**작성일:** 2024-12-05
**버전:** 1.0
