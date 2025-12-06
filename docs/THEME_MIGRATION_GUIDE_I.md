# 🎨 테마 시스템 마이그레이션 가이드 (Person I - Critical Hooks)

> **목표:** 동적 CSS 생성 hooks와 ToastProvider 변환
> **작업자:** Person I (1명)
> **예상 시간:** 40-50분
> **날짜:** 2025-12-06
> **중요도:** ⭐⭐⭐ **매우 중요! Entity 멘션 색상의 핵심!**

---

## 📋 상황 설명

**누락된 파일 발견!**

A~H가 담당하지 못한 **가장 중요한 파일 3개**를 발견했습니다:
- ✅ `app/hooks/useTiptapEditor.ts` ⭐⭐⭐ (메모 입력)
- ✅ `app/hooks/useTiptapEditorForEdit.ts` ⭐⭐⭐ (메모 수정)
- ✅ `app/providers/ToastProvider.tsx`

**왜 중요한가?**
- 이 hooks는 **동적으로 CSS를 생성**하여 Entity 멘션(@person, @project)의 색상을 실시간으로 적용합니다
- ToastProvider는 모든 알림 메시지의 스타일을 담당합니다
- **테마 전환 시 멘션 색상이 안 바뀌면 이 hooks 때문입니다!**

---

## 🚀 시작하기 전 필수 확인사항

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
   git checkout -b theme-migration-I
   ```

4. **작업 시작 전 빌드 확인**
   ```bash
   npm install
   npm run build
   ```

---

## 📦 Person I: Critical Hooks (3개 파일)

### 담당 파일
- ✅ `app/hooks/useTiptapEditor.ts` ⭐⭐⭐ (최우선!)
- ✅ `app/hooks/useTiptapEditorForEdit.ts` ⭐⭐⭐ (최우선!)
- ✅ `app/providers/ToastProvider.tsx`

---

## 🎯 작업 내용

### 1. **useTiptapEditor.ts** ⭐⭐⭐ (가장 중요!)

**현재 문제:**
```typescript
// ❌ Before (16번 줄)
import { defaultTheme } from '@/app/lib/theme'

// ❌ Before (412-443번 줄)
const hex = defaultTheme.entityTypes.person.hex
bgColor = hexToRgba(hex, 0.2)
// ...
```

**이 파일은 동적으로 CSS를 생성합니다:**
- Entity type이 분류되면 → `<style>` 태그를 document에 삽입
- 각 Entity마다 고유한 CSS 규칙 생성
- 멘션 색상, hover 색상, border 애니메이션 정의

**변환 전략:**

#### Option A: useTheme hook 사용 (권장)

**문제:** 이 파일은 **Client Component가 아닌 hook**이므로 직접 `useTheme()`를 호출할 수 없습니다.

**해결:** hook을 호출하는 컴포넌트(InputArea)에서 theme을 받아서 전달합니다.

**수정 방법:**

**Step 1: useTiptapEditor.ts 수정**

```typescript
// ✅ After
import { getEntityTypeColor, type ThemeColors } from '@/app/lib/theme'

// 인터페이스 수정 - theme 파라미터 추가
interface UseTiptapEditorOptions {
  onSubmitCallback?: () => void
  theme: ThemeColors  // ← 추가!
}

export function useTiptapEditor(options: UseTiptapEditorOptions = {}) {
  const { onSubmitCallback, theme } = options  // ← theme 추가

  // ... 기존 코드 ...

  // ❌ Before (412번 줄)
  const hex = defaultTheme.entityTypes.person.hex

  // ✅ After (412번 줄)
  const hex = theme.entityTypes.person.hex

  // 모든 defaultTheme을 theme으로 변경!
  // 412, 420, 428, 436, 468, 469, 470, 471번 줄 모두 수정
}
```

**전체 변경 목록:**
```typescript
// Line 16: import 수정
// ❌ Before
import { defaultTheme } from '@/app/lib/theme'

// ✅ After
import { getEntityTypeColor, type ThemeColors } from '@/app/lib/theme'

// Line 51-53: 인터페이스 수정
interface UseTiptapEditorOptions {
  onSubmitCallback?: () => void
  theme: ThemeColors  // ← 추가!
}

// Line 61: hook 함수 시그니처 수정
export function useTiptapEditor(options: UseTiptapEditorOptions = {}) {
  const { onSubmitCallback, theme } = options  // ← theme 추가

  // Line 412, 420, 428, 436: defaultTheme → theme
  if (type === 'person') {
    const hex = theme.entityTypes.person.hex  // ← 변경!
    // ...
  } else if (type === 'project') {
    const hex = theme.entityTypes.project.hex  // ← 변경!
    // ...
  } else if (type === 'event') {
    const hex = theme.entityTypes.event.hex  // ← 변경!
    // ...
  } else if (type === 'unknown') {
    const hex = theme.entityTypes.unknown.hex  // ← 변경!
    // ...
  }

  // Line 468-471: 애니메이션 keyframes 생성
  const personHex = theme.entityTypes.person.hex  // ← 변경!
  const projectHex = theme.entityTypes.project.hex  // ← 변경!
  const eventHex = theme.entityTypes.event.hex  // ← 변경!
  const unknownHex = theme.entityTypes.unknown.hex  // ← 변경!
}
```

**Step 2: InputArea.tsx 수정 (Person F가 할 수도, 확인 필요)**

```typescript
// InputArea.tsx
import { useTheme } from '@/app/providers/ThemeProvider'

export default function InputArea() {
  const { theme } = useTheme()  // ← theme 가져오기

  // ❌ Before
  const { editor, isSubmitting, handleSubmit } = useTiptapEditor()

  // ✅ After
  const { editor, isSubmitting, handleSubmit } = useTiptapEditor({ theme })  // ← theme 전달!
}
```

#### Option B: theme을 매개변수로 직접 전달 (대안)

만약 Person F가 InputArea를 수정하기 어렵다면, hook 내부에서 `defaultTheme`을 계속 사용하되 **Person A가 수정한 hex 값**을 그대로 사용합니다.

**이 경우:**
- Person A가 `defaultTheme`을 hex로 변환했으므로 **작동은 합니다**
- 하지만 **테마 전환 시 멘션 색상이 안 바뀝니다** (항상 defaultTheme만 사용)

**결론: Option A 권장!**

---

### 2. **useTiptapEditorForEdit.ts** ⭐⭐⭐

**동일한 패턴 적용!**

**변경 목록:**
```typescript
// Line 16: import 수정
import { getEntityTypeColor, type ThemeColors } from '@/app/lib/theme'

// Line 32-36: 인터페이스 수정
interface UseTiptapEditorForEditOptions {
  memo: Memo
  onSuccess?: () => void
  createdAt?: string
  theme: ThemeColors  // ← 추가!
}

// Line 46: hook 함수 시그니처
export function useTiptapEditorForEdit(options: UseTiptapEditorForEditOptions) {
  const { memo, onSuccess, createdAt: createdAtProp, theme } = options  // ← theme 추가

  // Line 432-442: defaultTheme → theme
  if (type === 'person') {
    bgColor = hexToRgba(theme.entityTypes.person.hex, 0.2)  // ← 변경!
    textColor = theme.entityTypes.person.hex  // ← 변경!
  } else if (type === 'project') {
    bgColor = hexToRgba(theme.entityTypes.project.hex, 0.2)  // ← 변경!
    textColor = theme.entityTypes.project.hex  // ← 변경!
  } else if (type === 'event') {
    bgColor = hexToRgba(theme.entityTypes.event.hex, 0.2)  // ← 변경!
    textColor = theme.entityTypes.event.hex  // ← 변경!
  } else {
    bgColor = hexToRgba(theme.entityTypes.unknown.hex, 0.2)  // ← 변경!
    textColor = theme.entityTypes.unknown.hex  // ← 변경!
  }
}
```

**호출하는 곳 수정 (MemoEditDrawer.tsx - Person D가 할 수도):**

```typescript
// MemoEditDrawer.tsx
import { useTheme } from '@/app/providers/ThemeProvider'

export default function MemoEditDrawer({ memo, ... }) {
  const { theme } = useTheme()

  // ❌ Before
  const { editor, ... } = useTiptapEditorForEdit({ memo, onSuccess })

  // ✅ After
  const { editor, ... } = useTiptapEditorForEdit({ memo, onSuccess, theme })  // ← theme 전달!
}
```

---

### 3. **ToastProvider.tsx**

**현재 문제:**
```typescript
// ❌ Before (18-22번 줄)
toastOptions={{
  style: {
    background: 'var(--color-bg-secondary)',  // CSS 변수
    color: '#fff',
    border: '1px solid var(--color-border-main)',  // CSS 변수
  },
}}
```

**문제점:**
- CSS 변수 `--color-bg-secondary`, `--color-border-main`은 `globals.css`에 정의됨
- 테마 전환 시 CSS 변수가 업데이트되지 않음 (정적 값)

**해결 방법:**

#### Option A: CSS 변수 그대로 유지 (간단)

**globals.css에 Claude 테마용 CSS 변수 추가:**

```css
/* globals.css */

/* Default 테마 (기존) */
:root {
  --color-bg-secondary: #252b3b;
  --color-border-main: #374151;
}

/* Claude 테마 (추가) */
[data-theme="claude"] {
  --color-bg-secondary: #141821;
  --color-border-main: #1C2029;
}
```

**ThemeProvider에서 body에 data-theme 속성 추가:**

```typescript
// ThemeProvider.tsx (Person A가 수정)
useEffect(() => {
  document.body.setAttribute('data-theme', themeName)
}, [themeName])
```

**ToastProvider는 수정 불필요!** (CSS 변수가 자동으로 바뀜)

#### Option B: useTheme hook 사용 (복잡)

```typescript
// ✅ After
'use client'

import { Toaster } from 'sonner'
import { useTheme } from '@/app/providers/ThemeProvider'

export function ToastProvider() {
  const { theme } = useTheme()

  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      duration={3000}
      toastOptions={{
        style: {
          background: theme.ui.secondaryBg,  // ← hex 값 사용
          color: theme.ui.textPrimary,  // ← hex 값 사용
          border: `1px solid ${theme.ui.border}`,  // ← hex 값 사용
        },
        className: 'font-sans',
      }}
    />
  )
}
```

**권장: Option A (CSS 변수 방식)**
- 더 간단함
- ToastProvider 코드 수정 불필요
- Person A가 ThemeProvider에 `data-theme` 속성 추가만 하면 됨

**하지만 완전한 마이그레이션을 위해서는 Option B 권장!**

---

## ✅ 작업 체크리스트

### Person I (Critical Hooks)

#### useTiptapEditor.ts ⭐⭐⭐
- [ ] Line 16: `import { ThemeColors }` 추가
- [ ] Line 51-53: `UseTiptapEditorOptions`에 `theme: ThemeColors` 추가
- [ ] Line 61: hook 함수에서 `theme` 받기
- [ ] Line 412: `defaultTheme.entityTypes.person.hex` → `theme.entityTypes.person.hex`
- [ ] Line 420: `defaultTheme.entityTypes.project.hex` → `theme.entityTypes.project.hex`
- [ ] Line 428: `defaultTheme.entityTypes.event.hex` → `theme.entityTypes.event.hex`
- [ ] Line 436: `defaultTheme.entityTypes.unknown.hex` → `theme.entityTypes.unknown.hex`
- [ ] Line 468-471: 애니메이션 keyframes의 모든 `defaultTheme` → `theme`
- [ ] **Person F에게 요청**: InputArea.tsx에서 `theme` 전달하도록 수정

#### useTiptapEditorForEdit.ts ⭐⭐⭐
- [ ] Line 16: `import { ThemeColors }` 추가
- [ ] Line 32-36: `UseTiptapEditorForEditOptions`에 `theme: ThemeColors` 추가
- [ ] Line 46: hook 함수에서 `theme` 받기
- [ ] Line 432-442: 모든 `defaultTheme.entityTypes.*` → `theme.entityTypes.*`
- [ ] **Person D에게 요청**: MemoEditDrawer.tsx에서 `theme` 전달하도록 수정

#### ToastProvider.tsx
- [ ] **Option A 선택 시**: Person A에게 ThemeProvider에 `data-theme` 속성 추가 요청
- [ ] **Option B 선택 시**: `useTheme()` hook 추가 및 style 객체 수정
- [ ] 테스트: Toast 메시지 표시 시 테마 색상 적용 확인

#### 최종 검증
- [ ] npm run build 성공
- [ ] 메모 입력 시 멘션 색상 정상 표시
- [ ] 테마 전환 시 멘션 색상 즉시 변경
- [ ] Toast 메시지 색상 정상 표시
- [ ] 커밋 & 푸시 완료

---

## 🚨 중요한 협업 포인트

### Person F와 협업 필요!

**InputArea.tsx 수정 요청:**
```typescript
// Person F에게 요청: InputArea.tsx에 theme 전달 추가

import { useTheme } from '@/app/providers/ThemeProvider'

export default function InputArea() {
  const { theme } = useTheme()
  const { editor, isSubmitting, handleSubmit } = useTiptapEditor({ theme })  // ← 여기!
}
```

### Person D와 협업 필요!

**MemoEditDrawer.tsx 수정 요청:**
```typescript
// Person D에게 요청: MemoEditDrawer.tsx에 theme 전달 추가

import { useTheme } from '@/app/providers/ThemeProvider'

export default function MemoEditDrawer({ memo, ... }) {
  const { theme } = useTheme()
  const { editor, ... } = useTiptapEditorForEdit({ memo, onSuccess, theme })  // ← 여기!
}
```

### Person A와 협업 필요!

**ThemeProvider.tsx 수정 요청 (Option A 선택 시):**
```typescript
// Person A에게 요청: ThemeProvider.tsx에 data-theme 속성 추가

export function ThemeProvider({ children, defaultTheme = 'default' }) {
  const [themeName, setThemeName] = useState<ThemeName>(defaultTheme)

  // ✅ 추가!
  useEffect(() => {
    document.body.setAttribute('data-theme', themeName)
  }, [themeName])

  // ... 기존 코드 ...
}
```

**globals.css 수정 요청:**
```css
/* globals.css에 추가 */

[data-theme="claude"] {
  --color-bg-secondary: #141821;
  --color-border-main: #1C2029;
}
```

---

## 🔍 테스트 방법

### 1. 메모 입력 테스트
```bash
npm run dev
```

1. 홈 화면으로 이동
2. 입력창에 `@` 입력하여 Entity 멘션
3. Entity 선택 후 색상 확인
4. Header에서 테마 전환
5. 다시 `@` 입력하여 색상이 바뀌는지 확인

### 2. 메모 수정 테스트
1. 기존 메모 카드 클릭
2. Edit 버튼 클릭
3. Entity 멘션 색상 확인
4. 테마 전환 후 색상 변경 확인

### 3. Toast 테스트
1. 메모 저장 시 "저장되었습니다" toast 확인
2. 테마 전환 후 toast 배경/테두리 색상 확인

---

## 🚨 자주 발생하는 문제 & 해결법

### 문제 1: "Cannot call hooks at the top level"

**원인:** hook 파일에서 직접 `useTheme()` 호출 시도

**해결:** hook을 호출하는 컴포넌트에서 theme을 전달받도록 수정

### 문제 2: 멘션 색상이 테마 전환 시 안 바뀜

**원인:** `defaultTheme`을 계속 사용 중

**해결:** 모든 `defaultTheme`을 `theme`으로 변경 확인

### 문제 3: InputArea에서 theme을 전달했는데도 에러

**원인:** useTiptapEditor의 인터페이스가 업데이트 안 됨

**해결:**
```typescript
// useTiptapEditor.ts
interface UseTiptapEditorOptions {
  onSubmitCallback?: () => void
  theme: ThemeColors  // ← 이게 있는지 확인!
}
```

### 문제 4: Toast 색상이 안 바뀜 (Option A 선택 시)

**원인:** `data-theme` 속성이 body에 없음

**해결:** Person A에게 ThemeProvider 수정 요청

---

## 📊 완료 후 검증

### 필수 체크
- [ ] `npm run build` 성공
- [ ] TypeScript 에러 0개
- [ ] 메모 입력 시 멘션 색상 정상 (person: 초록, project: 보라, event: 주황)
- [ ] 테마 전환 시 멘션 색상 즉시 변경
- [ ] Toast 메시지 배경/테두리 색상 정상
- [ ] 테마 전환 시 Toast 색상 변경

### 협업 체크
- [ ] Person F에게 InputArea 수정 요청 완료
- [ ] Person D에게 MemoEditDrawer 수정 요청 완료
- [ ] Person A에게 ThemeProvider/globals.css 수정 요청 완료 (Option A)

---

## 🎯 최종 목표

**Person I 작업 완료 후:**
- ✅ 메모 입력 시 Entity 멘션 색상이 테마에 따라 바뀜
- ✅ 메모 수정 시 Entity 멘션 색상이 테마에 따라 바뀜
- ✅ Toast 메시지 색상이 테마에 따라 바뀜
- ✅ **완벽한 테마 시스템 완성!** 🎉

---

## 📞 병합 순서

**Person I는 다음 순서로 병합:**

1. Person A 완료 & 병합 대기
2. Person F, D와 협업 (InputArea, MemoEditDrawer 수정)
3. Person I 작업 완료
4. Person I 병합
5. **최종 테스트!**

**작업 시간:** 40-50분 예상 (협업 포함)

**화이팅! 🚀 이게 마지막입니다!**
