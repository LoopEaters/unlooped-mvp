# 🧩 Claude 스타일 컴포넌트 구현 예시

> 실제 코드로 바로 적용할 수 있는 Claude 스타일 컴포넌트 라이브러리

## 📋 목차

1. [공통 유틸리티](#공통-유틸리티)
2. [카드 컴포넌트](#카드-컴포넌트)
3. [버튼 컴포넌트](#버튼-컴포넌트)
4. [입력 컴포넌트](#입력-컴포넌트)
5. [모달/드로어](#모달드로어)
6. [애니메이션 래퍼](#애니메이션-래퍼)

---

## 공통 유틸리티

### 1. Claude Theme Extension (theme.ts에 추가)

```typescript
// app/lib/theme.ts

// 기존 defaultTheme에 추가
export const claudeStyleExtension = {
  // 배경 (더 깊은 다크 톤)
  claude: {
    bg: {
      primary: '#0A0E17',
      secondary: '#141821',
      tertiary: '#1C2029',
      elevated: '#242938',
    },

    // 액센트 (Claude 시그니처)
    accent: {
      purple: {
        base: '#A78BFA',
        light: '#C4B5FD',
        dark: '#8B5CF6',
        glow: 'rgba(167, 139, 250, 0.3)',
      },
      blue: {
        base: '#60A5FA',
        light: '#93C5FD',
        dark: '#3B82F6',
        glow: 'rgba(96, 165, 250, 0.3)',
      },
    },

    // 그라데이션
    gradient: {
      primary: 'linear-gradient(135deg, #A78BFA 0%, #60A5FA 100%)',
      card: 'linear-gradient(to bottom right, #141821 0%, #1C2029 100%)',
      glow: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(96, 165, 250, 0.1) 100%)',
    },

    // 보더
    border: {
      subtle: 'rgba(255, 255, 255, 0.05)',
      default: 'rgba(255, 255, 255, 0.1)',
      strong: 'rgba(255, 255, 255, 0.15)',
    },

    // 그림자
    shadow: {
      sm: '0 2px 8px rgba(0, 0, 0, 0.2)',
      md: '0 4px 16px rgba(0, 0, 0, 0.3)',
      lg: '0 8px 32px rgba(0, 0, 0, 0.4)',
      glow: '0 0 40px rgba(167, 139, 250, 0.3)',
    },
  },
}

// 통합된 테마
export const claudeTheme = {
  ...defaultTheme,
  ...claudeStyleExtension,
}
```

### 2. 공통 CSS 클래스 (globals.css에 추가)

```css
/* app/globals.css */

/* Claude 스타일 글로우 효과 */
@keyframes claude-glow-pulse {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.claude-glow {
  animation: claude-glow-pulse 3s ease-in-out infinite;
}

/* Claude 스타일 그라데이션 애니메이션 */
@keyframes claude-gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.claude-gradient-animate {
  background-size: 200% 200%;
  animation: claude-gradient 4s ease infinite;
}

/* 부드러운 블러 배경 */
.claude-blur-bg {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
```

---

## 카드 컴포넌트

### ClaudeCard.tsx

```tsx
'use client'

import { ReactNode, useState } from 'react'
import { cn } from '@/app/lib/util'
import { claudeTheme } from '@/app/lib/theme'

interface ClaudeCardProps {
  children: ReactNode
  variant?: 'default' | 'elevated' | 'glow'
  className?: string
  onClick?: () => void
}

export default function ClaudeCard({
  children,
  variant = 'default',
  className,
  onClick,
}: ClaudeCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn(
        'relative',
        'rounded-2xl',
        'transition-all duration-300',
        onClick && 'cursor-pointer',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        background: claudeTheme.claude.gradient.card,
      }}
    >
      {/* 글로우 보더 */}
      <div
        className="absolute -inset-[1px] rounded-2xl opacity-0 transition-opacity duration-300"
        style={{
          background: claudeTheme.claude.gradient.primary,
          opacity: isHovered ? 0.5 : 0,
          filter: 'blur(8px)',
        }}
      />

      {/* 카드 콘텐츠 */}
      <div
        className="relative z-10 p-6 rounded-2xl"
        style={{
          background: claudeTheme.claude.bg.secondary,
          borderWidth: '1px',
          borderColor: isHovered
            ? claudeTheme.claude.border.default
            : claudeTheme.claude.border.subtle,
        }}
      >
        {/* 호버 글로우 오버레이 */}
        {variant === 'glow' && (
          <div
            className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 pointer-events-none"
            style={{
              background: claudeTheme.claude.gradient.glow,
              opacity: isHovered ? 1 : 0,
            }}
          />
        )}

        {/* 실제 콘텐츠 */}
        <div className="relative z-10">{children}</div>
      </div>

      {/* 아래쪽 그림자 */}
      {variant === 'elevated' && (
        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-4 blur-xl transition-opacity duration-300"
          style={{
            background: claudeTheme.claude.accent.purple.glow,
            opacity: isHovered ? 0.6 : 0.3,
          }}
        />
      )}
    </div>
  )
}
```

**사용 예시:**
```tsx
<ClaudeCard variant="glow">
  <h3 className="text-xl font-semibold mb-2">Card Title</h3>
  <p className="text-slate-300">Card content goes here...</p>
</ClaudeCard>
```

---

## 버튼 컴포넌트

### ClaudeButton.tsx

```tsx
'use client'

import { ReactNode, ButtonHTMLAttributes } from 'react'
import { cn } from '@/app/lib/util'
import { claudeTheme } from '@/app/lib/theme'

interface ClaudeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export default function ClaudeButton({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  disabled,
  ...props
}: ClaudeButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const variantClasses = {
    primary: cn(
      'text-white font-medium',
      'rounded-full',
      'shadow-lg transition-all duration-200',
      'hover:shadow-xl hover:scale-105',
      'active:scale-100',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
    ),
    secondary: cn(
      'bg-transparent',
      'border-2',
      'text-purple-300',
      'rounded-full',
      'hover:bg-purple-500/10',
      'transition-all duration-200',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ),
    ghost: cn(
      'bg-transparent',
      'text-slate-300',
      'rounded-full',
      'hover:bg-white/5 hover:text-white',
      'transition-all duration-200',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ),
  }

  return (
    <button
      className={cn(
        'relative',
        'overflow-hidden',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      style={
        variant === 'primary'
          ? {
              background: claudeTheme.claude.gradient.primary,
              boxShadow: `0 8px 24px ${claudeTheme.claude.accent.purple.glow}`,
            }
          : variant === 'secondary'
          ? {
              borderColor: `${claudeTheme.claude.accent.purple.base}4D`, // 30% opacity
            }
          : undefined
      }
      disabled={disabled || isLoading}
      {...props}
    >
      {/* 호버 글로우 효과 (primary만) */}
      {variant === 'primary' && (
        <div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at center, ${claudeTheme.claude.accent.purple.glow} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* 버튼 텍스트 */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading && (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        )}
        {children}
      </span>
    </button>
  )
}
```

**사용 예시:**
```tsx
<ClaudeButton variant="primary" size="md">
  Get Started
</ClaudeButton>

<ClaudeButton variant="secondary" size="sm">
  Learn More
</ClaudeButton>

<ClaudeButton variant="ghost">
  Cancel
</ClaudeButton>
```

---

## 입력 컴포넌트

### ClaudeInput.tsx

```tsx
'use client'

import { InputHTMLAttributes, useState } from 'react'
import { cn } from '@/app/lib/util'
import { claudeTheme } from '@/app/lib/theme'

interface ClaudeInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export default function ClaudeInput({
  label,
  error,
  icon,
  className,
  ...props
}: ClaudeInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
        </label>
      )}

      <div className="relative group">
        {/* 포커스 글로우 효과 */}
        <div
          className="absolute -inset-1 rounded-full opacity-0 transition-opacity duration-300 blur-lg"
          style={{
            background: claudeTheme.claude.gradient.primary,
            opacity: isFocused ? 0.3 : 0,
          }}
        />

        {/* 아이콘 */}
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}

        {/* 입력 필드 */}
        <input
          className={cn(
            'relative w-full',
            'px-4 py-3',
            icon && 'pl-12',
            'rounded-full',
            'text-slate-100 placeholder-slate-500',
            'outline-none',
            'transition-all duration-200',
            error && 'border-red-400/50',
            className
          )}
          style={{
            background: claudeTheme.claude.bg.secondary,
            borderWidth: '1px',
            borderColor: error
              ? 'rgba(248, 113, 113, 0.5)'
              : isFocused
              ? claudeTheme.claude.accent.purple.base
              : claudeTheme.claude.border.default,
            boxShadow: isFocused
              ? `0 0 0 4px ${claudeTheme.claude.accent.purple.glow}`
              : 'none',
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </div>

      {/* 에러 메시지 */}
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}
```

**사용 예시:**
```tsx
import { Search } from 'lucide-react'

<ClaudeInput
  label="Search"
  placeholder="Search for anything..."
  icon={<Search className="w-5 h-5" />}
/>

<ClaudeInput
  label="Email"
  type="email"
  placeholder="you@example.com"
  error="Please enter a valid email"
/>
```

---

## 모달/드로어

### ClaudeModal.tsx

```tsx
'use client'

import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { claudeTheme } from '@/app/lib/theme'

interface ClaudeModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

export default function ClaudeModal({
  isOpen,
  onClose,
  children,
  title,
  maxWidth = 'lg',
}: ClaudeModalProps) {
  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const maxWidthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 오버레이 */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          >
            {/* 블러 배경 */}
            <div
              className="absolute inset-0 claude-blur-bg"
              style={{
                background: 'rgba(0, 0, 0, 0.7)',
              }}
            />
          </motion.div>

          {/* 모달 콘텐츠 */}
          <motion.div
            className={cn(
              'fixed left-1/2 top-1/2 z-50',
              'w-full',
              maxWidthClasses[maxWidth]
            )}
            initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {/* 상단 글로우 */}
              <div
                className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl -z-10 claude-glow"
                style={{
                  background: claudeTheme.claude.accent.purple.glow,
                }}
              />

              {/* 모달 박스 */}
              <div
                className="relative rounded-3xl p-8 shadow-2xl"
                style={{
                  background: claudeTheme.claude.gradient.card,
                  borderWidth: '1px',
                  borderColor: claudeTheme.claude.border.default,
                  boxShadow: claudeTheme.claude.shadow.lg,
                }}
              >
                {/* 헤더 */}
                {title && (
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                    <button
                      onClick={onClose}
                      className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                )}

                {/* 콘텐츠 */}
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

**사용 예시:**
```tsx
const [isOpen, setIsOpen] = useState(false)

<ClaudeModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Edit Memo"
  maxWidth="lg"
>
  <div className="space-y-4">
    <ClaudeInput label="Title" placeholder="Enter title..." />
    <textarea className="w-full p-4 rounded-2xl bg-[#141821] border border-white/10 text-white" />
    <div className="flex gap-3 justify-end">
      <ClaudeButton variant="ghost" onClick={() => setIsOpen(false)}>
        Cancel
      </ClaudeButton>
      <ClaudeButton variant="primary">
        Save Changes
      </ClaudeButton>
    </div>
  </div>
</ClaudeModal>
```

---

## 애니메이션 래퍼

### FadeIn.tsx

```tsx
'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
}

export default function FadeIn({
  children,
  delay = 0,
  duration = 0.3,
  direction = 'up',
}: FadeInProps) {
  const directions = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
    none: {},
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
```

### StaggerChildren.tsx

```tsx
'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface StaggerChildrenProps {
  children: ReactNode
  staggerDelay?: number
}

export default function StaggerChildren({
  children,
  staggerDelay = 0.1,
}: StaggerChildrenProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
```

**사용 예시:**
```tsx
<StaggerChildren staggerDelay={0.1}>
  <StaggerItem>
    <ClaudeCard>Item 1</ClaudeCard>
  </StaggerItem>
  <StaggerItem>
    <ClaudeCard>Item 2</ClaudeCard>
  </StaggerItem>
  <StaggerItem>
    <ClaudeCard>Item 3</ClaudeCard>
  </StaggerItem>
</StaggerChildren>
```

---

## 🎯 실제 적용 예시

### MemoCard를 ClaudeCard로 변환

**Before (기존):**
```tsx
<div className="bg-bg-card border border-border-main rounded-lg p-4">
  {content}
</div>
```

**After (Claude 스타일):**
```tsx
<ClaudeCard variant="glow">
  {content}
</ClaudeCard>
```

### 버튼을 ClaudeButton으로 변환

**Before:**
```tsx
<button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
  Submit
</button>
```

**After:**
```tsx
<ClaudeButton variant="primary" size="md">
  Submit
</ClaudeButton>
```

---

## 📦 설치 필요 패키지

```bash
# Framer Motion (애니메이션)
npm install framer-motion

# 아이콘 (선택사항 - 이미 설치되어 있음)
npm install lucide-react
```

---

## 🚀 다음 단계

1. **컴포넌트 생성**
   - `app/components/claude/` 폴더 생성
   - 위 컴포넌트들을 각각의 파일로 생성

2. **기존 컴포넌트 마이그레이션**
   - MemoCard → ClaudeCard
   - 기존 버튼 → ClaudeButton
   - InputArea → ClaudeInput 사용

3. **테스트 페이지 생성**
   - `/playground` 경로에 모든 컴포넌트 미리보기
   - 각 variant와 상태 테스트

---

**작성일:** 2024-12-05
**버전:** 1.0
