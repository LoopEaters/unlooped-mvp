# 🎨 테마 시스템 완전 마이그레이션 가이드

> **목표:** 모든 테마 색상을 hex 값으로 통일하고, 컴포넌트에서 style 속성으로 적용
> **작업자:** 5명 (Person A, B, C, D, E)
> **예상 시간:** 각자 30-45분
> **날짜:** 2025-12-06

---

## 📋 전체 개요

### 현재 문제
- `defaultTheme`은 Tailwind 클래스 (`'bg-bg-primary'`)
- `claudeTheme`은 hex 값 (`'#0A0E17'`)
- **일관성 없음** → 테마 전환 시 색상이 안 바뀜

### 해결 방법
1. **theme.ts**: 모든 테마를 hex/rgb 값으로 통일
2. **컴포넌트**: `className={theme.ui.*}` → `style={{...}}` 변환
3. **Tailwind utility는 유지**: `p-4`, `rounded-lg` 등

### 변환 예시

#### ❌ Before (잘못된 방식)
```tsx
<div className={`${theme.ui.primaryBg} ${theme.ui.textPrimary} p-4`}>
  Hello
</div>
```

#### ✅ After (올바른 방식)
```tsx
<div
  className="p-4 rounded-lg"
  style={{
    backgroundColor: theme.ui.primaryBg,
    color: theme.ui.textPrimary,
  }}
>
  Hello
</div>
```

---

## 🚀 시작하기 전 필수 확인사항

### 전체 팀 공통

1. **브랜치 생성**
   ```bash
   git checkout -b theme-migration-[본인이름]
   ```

2. **최신 코드 pull**
   ```bash
   git pull origin dev
   ```

3. **의존성 설치**
   ```bash
   npm install
   ```

4. **작업 시작 전 빌드 확인**
   ```bash
   npm run build
   ```

5. **충돌 방지**: 각자 할당된 파일만 수정!

---

## 📦 Person A: Core Theme 시스템 (가장 중요!)

### 담당 파일
- ✅ `app/lib/theme.ts` (핵심!)
- ✅ `app/providers/ThemeProvider.tsx` (검증)
- ✅ `app/globals.css` (필요 시 정리)

### 작업 내용

#### 1. `app/lib/theme.ts` 전체 수정

**defaultTheme 변환 규칙:**

| Before (Tailwind 클래스) | After (hex 값) |
|-------------------------|----------------|
| `'bg-bg-primary'` | `'#1a1f2e'` |
| `'bg-bg-secondary'` | `'#252b3b'` |
| `'bg-bg-card'` | `'#2a2f3e'` |
| `'text-white'` | `'#ffffff'` |
| `'text-gray-300'` | `'#d1d5db'` |
| `'text-text-muted'` | `'#9ca3af'` |
| `'border-border-main'` | `'#374151'` |
| `'bg-blue-500'` | `'#3B82F6'` |
| `'text-blue-400'` | `'#60A5FA'` |
| `'hover:bg-blue-600'` | `'#2563EB'` |
| `'bg-red-500/10'` | `'rgba(239, 68, 68, 0.1)'` |
| `'text-red-400'` | `'#f87171'` |

**변환할 섹션:**
- ✅ `entityTypes` (person, project, event, unknown) - bg, text만 hex로
- ✅ `ui.primaryBg` ~ `ui.stickyMetadataBg` (배경 색상 7개)
- ✅ `ui.textPrimary` ~ `ui.textPlaceholder` (텍스트 색상 4개)
- ✅ `ui.border` ~ `ui.borderStrong` (테두리 3개)
- ✅ `ui.loading`, `ui.error`, `ui.aiProcessing`, `ui.delete` (상태별 색상)
- ✅ `ui.buttonHover` (hover 색상)
- ✅ `ui.interactive` 전체 (primary, success, warning, danger)
- ✅ `ui.gray` 팔레트는 **이미 hex라서 그대로 유지**
- ✅ `ui.iconColors`는 **이미 hex라서 그대로 유지**
- ✅ `timeline`, `drawer`, `tooltip` 섹션은 **이미 hex라서 그대로 유지**

**특별 주의사항:**
- `bg-mention-person` → `'#22C55E'` (globals.css의 --color-mention-person 참고)
- `bg-mention-project` → `'#A855F7'`
- `bg-mention-event` → `'#F59E0B'`
- **hover 상태 제거**: `'hover:bg-gray-700'` → `'#374151'` (hover는 CSS로 처리)

#### 2. defaultTheme 변환 완료 예시

```typescript
export const defaultTheme: ThemeColors = {
  name: 'default',
  displayName: 'Default Dark',

  entityTypes: {
    person: {
      bg: '#22C55E',        // ← hex로 변환!
      text: '#22C55E',      // ← hex로 변환!
      hex: '#22C55E',
    },
    project: {
      bg: '#A855F7',
      text: '#A855F7',
      hex: '#A855F7',
    },
    event: {
      bg: '#F59E0B',
      text: '#F59E0B',
      hex: '#F59E0B',
    },
    unknown: {
      bg: '#9CA3AF',
      text: '#9CA3AF',
      hex: '#9CA3AF',
    },
  },

  mention: {
    normal: {
      bgOpacity: '20',     // ← 이건 그대로 (숫자로 쓰임)
    },
    emphasized: {
      bgOpacity: '40',
    },
  },

  ui: {
    // 배경
    primaryBg: '#1a1f2e',        // ← bg-bg-primary 변환
    secondaryBg: '#252b3b',      // ← bg-bg-secondary 변환
    tertiaryBg: '#2a2f3e',       // ← bg-bg-card 변환
    elevatedBg: '#2a2f3e',       // ← bg-bg-card 변환
    cardBg: '#2a2f3e',           // ← bg-bg-card 변환
    cardBgHover: '#252b3b80',    // ← hover:bg-bg-secondary/50 변환 (50% opacity = 80)
    stickyMetadataBg: 'rgba(26, 31, 46, 0.95)', // ← bg-bg-primary/95 변환

    // 텍스트
    textPrimary: '#ffffff',      // ← text-white 변환
    textSecondary: '#d1d5db',    // ← text-gray-300 변환
    textMuted: '#9ca3af',        // ← text-text-muted 변환
    textPlaceholder: '#9ca3af',  // ← text-gray-400 변환

    // 테두리
    border: '#374151',           // ← border-border-main 변환
    borderSubtle: 'rgba(55, 65, 81, 0.5)', // ← border-border-main/50 변환
    borderStrong: '#374151',     // ← border-border-main 변환

    // 상태별 색상
    loading: {
      bg: '#2a2f3e',             // ← bg-bg-card 변환
    },
    error: {
      text: '#f87171',           // ← text-red-400 변환
      bg: 'rgba(239, 68, 68, 0.1)', // ← bg-red-500/10 변환
    },
    aiProcessing: {
      text: '#60A5FA',           // ← text-blue-400 변환
      bg: 'rgba(59, 130, 246, 0.1)', // ← bg-blue-500/10 변환
    },
    delete: {
      text: '#f87171',           // ← text-red-400 변환
      bg: 'rgba(239, 68, 68, 0.1)', // ← bg-red-500/10 변환
      bgHover: 'rgba(239, 68, 68, 0.1)', // ← hover:bg-red-500/10 변환
    },

    // 검색 하이라이트 (이미 hex라서 그대로)
    searchHighlight: {
      borderColor: '#EAB308',
      borderColorLight: '#FACC15',
      shadowColor: 'rgba(234, 179, 8, 0.6)',
    },

    // 버튼 hover
    buttonHover: '#374151',      // ← hover:bg-gray-700 변환

    // 인터랙티브 색상
    interactive: {
      primary: '#3B82F6',
      primaryBg: '#3B82F6',      // ← bg-blue-500 변환
      primaryBgHover: '#2563EB', // ← hover:bg-blue-600 변환
      primaryBgLight: 'rgba(59, 130, 246, 0.2)', // ← bg-blue-500/20 변환
      primaryText: '#60A5FA',    // ← text-blue-400 변환

      success: '#22C55E',
      successBg: '#22C55E',      // ← bg-green-500 변환
      successText: '#4ADE80',    // ← text-green-400 변환

      warning: '#EAB308',
      warningBg: 'rgba(234, 179, 8, 0.3)', // ← bg-yellow-500/30 변환
      warningText: '#FDE047',    // ← text-yellow-200 변환

      danger: '#EF4444',
      dangerBg: 'rgba(239, 68, 68, 0.1)', // ← bg-red-500/10 변환
      dangerText: '#f87171',     // ← text-red-400 변환
      dangerTextHover: '#fca5a5', // ← hover:text-red-300 변환
    },

    // Gray 팔레트 (이미 hex라서 그대로)
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },

    // 아이콘 색상 (이미 hex라서 그대로)
    iconColors: {
      default: '#FFFFFF',
      muted: '#9CA3AF',
      orange: '#FB923C',
      blue: '#60A5FA',
      yellow: '#FACC15',
      green: '#4ADE80',
      purple: '#C084FC',
      cyan: '#22D3EE',
      indigo: '#818CF8',
      red: '#F87171',
    },
  },

  // timeline, drawer, tooltip는 이미 hex라서 그대로 유지
  timeline: {
    background: '#0F172A',
    entityLine: '#374151',
    entityLineActive: '#4B5563',
    timeScale: {
      text: '#9CA3AF',
      line: '#374151',
      majorLine: '#4B5563',
    },
    memo: {
      color: '#F8FAFC',
      hoverOpacity: 0.9,
      selectedOpacity: 1,
    },
  },

  drawer: {
    overlay: 'rgba(0, 0, 0, 0.5)',
    background: '#0A0F1E',
    border: '#1F2937',
    header: {
      title: '#FFFFFF',
      closeButton: '#9CA3AF',
      closeButtonHover: '#FFFFFF',
    },
    section: {
      title: '#9CA3AF',
      text: '#FFFFFF',
      textMuted: '#9CA3AF',
    },
    card: {
      background: '#0F172A',
      border: '#1F2937',
      borderHover: '#6B7280',
    },
    button: {
      primary: {
        bg: '#3B82F6',
        bgHover: '#2563EB',
        text: '#FFFFFF',
      },
      secondary: {
        bg: '#F97316',
        bgHover: '#EA580C',
        text: '#FFFFFF',
      },
    },
  },

  tooltip: {
    background: '#1a1a1a',
    border: '#2d2d2d',
    shadow: 'rgba(0, 0, 0, 0.5)',
    divider: '#2d2d2d',
    title: '#888888',
    text: '#FFFFFF',
    hint: '#666666',
  },
}
```

#### 3. claudeTheme은 이미 hex라서 그대로 유지!

**claudeTheme은 수정 불필요** - 이미 모든 값이 hex/rgba 형식입니다.

#### 4. 유틸리티 함수 검증

**getMentionHighlightClass() 함수 제거 또는 수정 필요:**

기존 코드:
```typescript
export function getMentionHighlightClass(
  type: string | null | undefined,
  isEmphasized: boolean = false,
  theme: ThemeColors = defaultTheme
): string {
  const typeColor = getEntityTypeColor(type, theme)
  const opacity = isEmphasized
    ? theme.mention.emphasized.bgOpacity
    : theme.mention.normal.bgOpacity

  // ❌ 문제: bg와 text가 이제 hex라서 className에 못 씀!
  return `${typeColor.bg}/${opacity} ${typeColor.text} px-1.5 py-0.5 rounded font-medium`
}
```

**새로운 버전 (style 객체 반환):**
```typescript
export function getMentionHighlightStyle(
  type: string | null | undefined,
  isEmphasized: boolean = false,
  theme: ThemeColors = defaultTheme
): { backgroundColor: string; color: string } {
  const typeColor = getEntityTypeColor(type, theme)
  const opacity = isEmphasized
    ? parseInt(theme.mention.emphasized.bgOpacity) / 100
    : parseInt(theme.mention.normal.bgOpacity) / 100

  // hex를 rgba로 변환
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  return {
    backgroundColor: hexToRgba(typeColor.hex, opacity),
    color: typeColor.hex,
  }
}
```

**사용 예시:**
```tsx
// Before
<span className={getMentionHighlightClass('person', false, theme)}>

// After
<span
  className="px-1.5 py-0.5 rounded font-medium"
  style={getMentionHighlightStyle('person', false, theme)}
>
```

#### 5. 검증

**변환 후 체크리스트:**
- [ ] defaultTheme의 모든 Tailwind 클래스가 hex로 변환됨
- [ ] claudeTheme은 그대로 유지 (이미 hex)
- [ ] `getMentionHighlightStyle()` 함수 추가
- [ ] TypeScript 에러 없음 (`npm run build` 성공)
- [ ] `themes` 객체에 두 테마 모두 등록됨

---

## 🎨 Person B: Header & Auth UI

### 담당 파일
- ✅ `app/components/common/Header.tsx`
- ✅ `app/components/common/SearchResults.tsx`
- ✅ `app/components/auth/LoginModal.tsx`
- ✅ `app/components/onboarding/OnboardingModal.tsx` (있다면)

### 작업 내용

#### 변환 패턴

**1. className에서 theme 제거**
```tsx
// ❌ Before
<header className={`flex items-center ${theme.ui.primaryBg} ${theme.ui.border}`}>

// ✅ After
<header
  className="flex items-center border-b"
  style={{
    backgroundColor: theme.ui.primaryBg,
    borderColor: theme.ui.border,
  }}
>
```

**2. 복합 className 분리**
```tsx
// ❌ Before
<div className={`p-4 ${theme.ui.textMuted} ${theme.ui.buttonHover}`}>

// ✅ After
<div
  className="p-4 hover:opacity-80 transition-opacity"
  style={{ color: theme.ui.textMuted }}
>
```

**3. 조건부 스타일**
```tsx
// ❌ Before
<a className={`transition-colors ${
  pathname === '/'
    ? 'text-white'
    : `${theme.ui.textMuted} hover:text-white`
}`}>

// ✅ After
<a
  className="transition-colors"
  style={{
    color: pathname === '/' ? '#ffffff' : theme.ui.textMuted,
  }}
  onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
  onMouseLeave={(e) => {
    if (pathname !== '/') e.currentTarget.style.color = theme.ui.textMuted
  }}
>
```

**또는 CSS 클래스 활용:**
```tsx
<a
  className={`nav-link ${pathname === '/' ? 'active' : ''}`}
  style={{ color: pathname === '/' ? '#ffffff' : theme.ui.textMuted }}
>
```

**4. Avatar 스타일**
```tsx
// ❌ Before
<Avatar.Root style={{ backgroundColor: theme.ui.iconColors.orange }}>

// ✅ After (이미 올바름!)
<Avatar.Root style={{ backgroundColor: theme.ui.iconColors.orange }}>
```

**5. Dropdown/Popover 스타일**
```tsx
// ❌ Before
<Popover.Content className={`${theme.ui.secondaryBg} ${theme.ui.border} rounded-lg`}>

// ✅ After
<Popover.Content
  className="rounded-lg shadow-xl"
  style={{
    backgroundColor: theme.ui.secondaryBg,
    borderColor: theme.ui.border,
    border: '1px solid',
  }}
>
```

#### 특별 주의: Header.tsx

**검색 input (131-138번 줄):**
```tsx
// ✅ After
<input
  type="text"
  placeholder="Search records..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none transition-colors"
  style={{
    backgroundColor: theme.ui.secondaryBg,
    color: '#ffffff',
    borderColor: theme.ui.border,
  }}
/>
```

**Navigation 링크 (164-196번 줄):**
```tsx
<a
  href="/"
  className="transition-colors"
  style={{
    color: pathname === '/' ? '#ffffff' : theme.ui.textMuted,
  }}
  onMouseEnter={(e) => {
    if (pathname !== '/') e.currentTarget.style.color = '#ffffff'
  }}
  onMouseLeave={(e) => {
    if (pathname !== '/') e.currentTarget.style.color = theme.ui.textMuted
  }}
>
  Records
</a>
```

#### 체크리스트
- [ ] Header.tsx: 모든 theme className → style 변환
- [ ] SearchResults.tsx: 검색 결과 스타일 변환
- [ ] LoginModal.tsx: 모달 배경/버튼 스타일 변환
- [ ] TypeScript 에러 없음
- [ ] hover 상태 정상 작동

---

## 🏠 Person C: Home Page Components

### 담당 파일
- ✅ `app/components/home/MainContainer.tsx`
- ✅ `app/components/home/MemoCard.tsx`
- ✅ `app/components/home/MemoCardCompact.tsx`
- ✅ `app/components/home/RightSidebar.tsx`

### 작업 내용

#### 변환 패턴

**1. MemoCard 배경색**
```tsx
// ❌ Before
<div className={`${theme.ui.cardBg} ${theme.ui.border} p-4 rounded-lg`}>

// ✅ After
<div
  className="p-4 rounded-lg border"
  style={{
    backgroundColor: theme.ui.cardBg,
    borderColor: theme.ui.border,
  }}
>
```

**2. Entity mention 배지**
```tsx
// ❌ Before
const entityColor = getEntityTypeColor(entity.type, theme)
<span className={`${entityColor.bg}/20 ${entityColor.text} px-2 py-1 rounded`}>

// ✅ After
const entityColor = getEntityTypeColor(entity.type, theme)
<span
  className="px-2 py-1 rounded font-medium"
  style={{
    backgroundColor: `${entityColor.hex}33`, // 33 = 20% opacity in hex
    color: entityColor.hex,
  }}
>
```

**3. Sticky metadata 배경**
```tsx
// ❌ Before
<div className={`sticky top-0 ${theme.ui.stickyMetadataBg} z-10`}>

// ✅ After
<div
  className="sticky top-0 z-10"
  style={{ backgroundColor: theme.ui.stickyMetadataBg }}
>
```

**4. Entity mention hex opacity 변환표**

| Opacity | Hex 값 | 계산법 |
|---------|--------|--------|
| 10% | 1A | 0.1 × 255 = 25.5 → 0x1A |
| 20% | 33 | 0.2 × 255 = 51 → 0x33 |
| 30% | 4D | 0.3 × 255 = 76.5 → 0x4D |
| 40% | 66 | 0.4 × 255 = 102 → 0x66 |
| 50% | 80 | 0.5 × 255 = 127.5 → 0x80 |

**사용 예시:**
```tsx
// 20% opacity
backgroundColor: `${entityColor.hex}33`

// 또는 rgba 사용
backgroundColor: `rgba(${parseInt(entityColor.hex.slice(1,3), 16)}, ${parseInt(entityColor.hex.slice(3,5), 16)}, ${parseInt(entityColor.hex.slice(5,7), 16)}, 0.2)`
```

#### 특별 주의: MainContainer.tsx

**EntitySection 컴포넌트 (258-400번 줄):**
```tsx
const EntitySection = memo(function EntitySection({ ... }) {
  const { theme } = useTheme()

  // ✅ 배경색 변환
  return (
    <div
      className="mb-8"
      style={{ borderColor: isLast ? 'transparent' : theme.ui.border }}
    >
      <div
        className="sticky top-0 z-10 pb-3 mb-4"
        style={{ backgroundColor: theme.ui.stickyMetadataBg }}
      >
        {/* ... */}
      </div>
    </div>
  )
})
```

**Loading skeleton:**
```tsx
<div
  className="animate-pulse p-4 rounded-lg"
  style={{ backgroundColor: theme.ui.loading.bg }}
>
  <div
    className="h-4 rounded"
    style={{ backgroundColor: theme.ui.gray[700] }}
  />
</div>
```

#### 체크리스트
- [ ] MainContainer: EntitySection 스타일 변환
- [ ] MemoCard: 배경/테두리/entity 배지 변환
- [ ] MemoCardCompact: 동일 패턴 적용
- [ ] RightSidebar: 사이드바 배경/버튼 변환
- [ ] Entity mention 색상 정상 표시

---

## 🎯 Person D: Entity Timeline & Details

### 담당 파일
- ✅ `app/components/entities/EntityTimeline.tsx`
- ✅ `app/components/entities/TimelineCanvas.tsx`
- ✅ `app/components/entities/EntityDetailDrawer.tsx`
- ✅ `app/components/entities/MemoDetailDrawer.tsx`
- ✅ `app/components/entities/MemoEditDrawer.tsx`

### 작업 내용

#### 변환 패턴

**1. Canvas 배경 (EntityTimeline.tsx 291번 줄)**
```tsx
// ❌ Before
<div className="w-full h-full bg-bg-secondary overflow-hidden">

// ✅ After
<div
  className="w-full h-full overflow-hidden"
  style={{ backgroundColor: theme.timeline.background }}
>
```

**2. Date scale 텍스트 (EntityTimeline.tsx 276-283번 줄)**
```tsx
// ✅ 이미 올바름! (style 사용 중)
<span style={{ color: theme.timeline.timeScale.text }}>
  {formatTimelineDate(mark.timestamp, mark.totalRange)}
</span>
```

**3. TimelineCanvas - Konva 요소는 이미 올바름!**

TimelineCanvas는 이미 `stroke`, `fill` 속성에 hex 값을 직접 전달하므로 **수정 불필요**합니다.

예시 (133번 줄):
```tsx
<Line
  stroke={
    mark.isMajor
      ? theme.timeline.timeScale.majorLine
      : theme.timeline.timeScale.line
  }
/>
```

이미 hex 값을 받고 있으므로 **그대로 유지**!

**4. EntityDetailDrawer / MemoDetailDrawer**

**Drawer 오버레이:**
```tsx
// ❌ Before (BaseDrawer.tsx에서 처리)
<div className="fixed inset-0 bg-black/50">

// ✅ After
<div
  className="fixed inset-0"
  style={{ backgroundColor: theme.drawer.overlay }}
>
```

**Drawer 배경:**
```tsx
// ❌ Before
<div className={`fixed right-0 top-0 h-full w-[500px] ${theme.drawer.background}`}>

// ✅ After
<div
  className="fixed right-0 top-0 h-full w-[500px]"
  style={{ backgroundColor: theme.drawer.background }}
>
```

**Drawer 버튼:**
```tsx
// ❌ Before
<button className={`px-4 py-2 ${theme.drawer.button.primary.bg} rounded-lg`}>

// ✅ After
<button
  className="px-4 py-2 rounded-lg transition-colors"
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
  Save
</button>
```

#### 특별 주의: MemoEditDrawer

**Entity 드롭다운 (EntityDropdown.tsx):**
```tsx
// ❌ Before
<button className={`${theme.ui.secondaryBg} ${theme.ui.border} px-3 py-2`}>

// ✅ After
<button
  className="px-3 py-2 rounded-lg border"
  style={{
    backgroundColor: theme.ui.secondaryBg,
    borderColor: theme.ui.border,
  }}
>
```

#### 체크리스트
- [ ] EntityTimeline: canvas 배경 변환
- [ ] TimelineCanvas: 이미 올바름 (검증만)
- [ ] EntityDetailDrawer: drawer 스타일 변환
- [ ] MemoDetailDrawer: drawer 스타일 변환
- [ ] MemoEditDrawer: 입력 필드/버튼 변환
- [ ] EntityDropdown: 드롭다운 스타일 변환

---

## 🔧 Person E: Common Components & Modals

### 담당 파일
- ✅ `app/components/common/BaseDrawer.tsx`
- ✅ `app/components/common/SettingsDrawer.tsx`
- ✅ `app/components/common/ProfileDrawer.tsx`
- ✅ `app/components/entities/MemoTooltip.tsx`
- ✅ `app/components/entities/EntityTooltip.tsx`
- ✅ `app/components/home/EntityDeleteModal.tsx`
- ✅ `app/components/home/MemoDeleteModal.tsx`

### 작업 내용

#### 변환 패턴

**1. BaseDrawer (모든 drawer의 기반)**

**Overlay:**
```tsx
// ❌ Before
<div className="fixed inset-0 bg-black/50">

// ✅ After
<div
  className="fixed inset-0 z-50"
  style={{ backgroundColor: theme.drawer.overlay }}
>
```

**Drawer Content:**
```tsx
// ❌ Before
<div className={`drawer-content ${theme.drawer.background} ${theme.drawer.border}`}>

// ✅ After
<div
  className="drawer-content border-l"
  style={{
    backgroundColor: theme.drawer.background,
    borderColor: theme.drawer.border,
  }}
>
```

**Header:**
```tsx
// ❌ Before
<div className={`flex items-center justify-between p-6 ${theme.drawer.border} border-b`}>
  <h2 className={theme.drawer.header.title}>{title}</h2>
  <button className={theme.drawer.header.closeButton}>X</button>
</div>

// ✅ After
<div
  className="flex items-center justify-between p-6 border-b"
  style={{ borderColor: theme.drawer.border }}
>
  <h2 style={{ color: theme.drawer.header.title }}>{title}</h2>
  <button
    style={{ color: theme.drawer.header.closeButton }}
    onMouseEnter={(e) => {
      e.currentTarget.style.color = theme.drawer.header.closeButtonHover
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.color = theme.drawer.header.closeButton
    }}
  >
    X
  </button>
</div>
```

**2. SettingsDrawer**

**카드 배경:**
```tsx
// ❌ Before
<div className={`${theme.ui.cardBg} rounded-lg p-4`}>

// ✅ After
<div
  className="rounded-lg p-4"
  style={{ backgroundColor: theme.ui.cardBg }}
>
```

**Select 드롭다운:**
```tsx
// ❌ Before
<select className={`${theme.ui.secondaryBg} ${theme.ui.textPrimary} ${theme.ui.border}`}>

// ✅ After
<select
  className="w-full px-3 py-2 rounded-lg focus:outline-none"
  style={{
    backgroundColor: theme.ui.secondaryBg,
    color: theme.ui.textPrimary,
    borderColor: theme.ui.gray[500],
    border: '1px solid',
  }}
>
```

**Toggle 스위치:**
```tsx
// ❌ Before
<button
  className="relative inline-flex h-6 w-11 items-center rounded-full"
  style={{ backgroundColor: isFullWidth ? theme.ui.interactive.primary : theme.ui.gray[600] }}
>

// ✅ After (이미 올바름!)
<button
  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
  style={{
    backgroundColor: isFullWidth ? theme.ui.interactive.primary : theme.ui.gray[600]
  }}
>
```

**3. Tooltip (MemoTooltip, EntityTooltip)**

**Tooltip 배경:**
```tsx
// Konva에서 사용 (이미 올바름!)
<Rect
  fill={theme.tooltip.background}
  stroke={theme.tooltip.border}
/>
```

**4. DeleteModal**

**Modal 오버레이:**
```tsx
// ❌ Before
<div className="fixed inset-0 bg-black/50 z-50">

// ✅ After
<div
  className="fixed inset-0 z-50"
  style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
>
```

**Modal 컨텐츠:**
```tsx
// ❌ Before
<div className={`${theme.ui.secondaryBg} rounded-lg p-6`}>

// ✅ After
<div
  className="rounded-lg p-6 max-w-md mx-auto mt-20"
  style={{ backgroundColor: theme.ui.secondaryBg }}
>
```

**Delete 버튼:**
```tsx
// ❌ Before
<button className={`${theme.ui.interactive.dangerBg} ${theme.ui.interactive.dangerText}`}>

// ✅ After
<button
  className="px-4 py-2 rounded-lg transition-colors"
  style={{
    backgroundColor: theme.ui.interactive.dangerBg,
    color: theme.ui.interactive.dangerText,
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.color = theme.ui.interactive.dangerTextHover
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.color = theme.ui.interactive.dangerText
  }}
>
  Delete
</button>
```

#### 체크리스트
- [ ] BaseDrawer: overlay, content, header 변환
- [ ] SettingsDrawer: 카드, select, toggle 변환
- [ ] ProfileDrawer: 동일 패턴 적용
- [ ] MemoTooltip: Konva 요소 검증 (이미 올바름)
- [ ] EntityTooltip: Konva 요소 검증 (이미 올바름)
- [ ] EntityDeleteModal: modal 스타일 변환
- [ ] MemoDeleteModal: modal 스타일 변환

---

## ✅ 작업 완료 후 병합 프로세스

### 1. 각자 로컬 테스트

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 확인
# - 테마 전환 (Header 또는 Settings)
# - 모든 색상이 제대로 바뀌는지 확인
# - Timeline canvas 색상 확인
# - Drawer/Modal 색상 확인
```

### 2. 빌드 테스트

```bash
# TypeScript 에러 확인
npm run build

# 성공하면 다음 단계로
```

### 3. 커밋 & 푸시

```bash
# 변경사항 확인
git status

# 스테이징
git add app/lib/theme.ts  # Person A 예시
git add app/components/common/Header.tsx  # Person B 예시
# ... 각자 수정한 파일만 add

# 커밋
git commit -m "refactor(theme): migrate [본인 담당 영역] to hex-based theme system"

# 예시:
# Person A: "refactor(theme): migrate theme.ts to hex values"
# Person B: "refactor(theme): migrate Header and Auth UI to style attributes"
# Person C: "refactor(theme): migrate Home page components to style attributes"
# Person D: "refactor(theme): migrate Entity Timeline and Drawers to style attributes"
# Person E: "refactor(theme): migrate Common components and Modals to style attributes"

# 푸시
git push origin theme-migration-[본인이름]
```

### 4. 병합 순서 (중요!)

**순서를 반드시 지켜주세요:**

1. **Person A 먼저 병합** (theme.ts가 기반이므로)
   ```bash
   # 리뷰 후 dev 브랜치로 병합
   git checkout dev
   git merge theme-migration-A
   git push origin dev
   ```

2. **Person B, C, D, E 순차 병합**
   ```bash
   # 각자 dev에서 최신 코드 pull
   git checkout theme-migration-B
   git pull origin dev

   # 충돌 해결 (있다면)
   git merge dev

   # dev로 병합
   git checkout dev
   git merge theme-migration-B
   git push origin dev
   ```

### 5. 최종 검증 (전체 팀)

```bash
# dev 브랜치에서 최종 테스트
git checkout dev
git pull origin dev
npm install
npm run build
npm run dev

# 확인 사항:
# ✅ 테마 전환 시 모든 색상 변경됨
# ✅ Default 테마 정상 작동
# ✅ Claude 테마 정상 작동
# ✅ Timeline canvas 색상 정상
# ✅ Drawer/Modal 색상 정상
# ✅ Hover 상태 정상
# ✅ TypeScript 에러 없음
```

---

## 🚨 자주 발생하는 문제 & 해결법

### 문제 1: "TypeError: Cannot read property 'primaryBg' of undefined"

**원인:** theme 객체를 받기 전에 렌더링됨

**해결:**
```tsx
const { theme } = useTheme()

// ❌ Before
<div style={{ backgroundColor: theme.ui.primaryBg }}>

// ✅ After
const { theme } = useTheme()
if (!theme) return null  // 또는 <Loading />

<div style={{ backgroundColor: theme.ui.primaryBg }}>
```

### 문제 2: "Style prop value must be an object"

**원인:** className에 style을 잘못 넣음

**해결:**
```tsx
// ❌ Wrong
<div className={theme.ui.primaryBg}>

// ✅ Correct
<div style={{ backgroundColor: theme.ui.primaryBg }}>
```

### 문제 3: Hover 상태가 작동 안 함

**원인:** Tailwind hover: 클래스 제거

**해결:**
```tsx
// ❌ Before
<div className="hover:bg-blue-600">

// ✅ After - onMouseEnter/Leave 사용
<div
  style={{ backgroundColor: theme.ui.interactive.primaryBg }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = theme.ui.interactive.primaryBgHover
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = theme.ui.interactive.primaryBg
  }}
>
```

### 문제 4: Opacity가 적용 안 됨

**원인:** hex 값에 opacity suffix 잘못 사용

**해결:**
```tsx
// ❌ Wrong
backgroundColor: `${theme.ui.primaryBg}/20`  // Tailwind 문법

// ✅ Correct - hex suffix
backgroundColor: `${theme.ui.primaryBg}33`  // 20% = 33 in hex

// ✅ Correct - rgba
backgroundColor: `rgba(26, 31, 46, 0.2)`
```

### 문제 5: Border가 안 보임

**원인:** borderColor만 설정하고 border 자체를 안 넣음

**해결:**
```tsx
// ❌ Wrong
<div style={{ borderColor: theme.ui.border }}>

// ✅ Correct
<div
  className="border"  // 또는 border-b, border-t 등
  style={{ borderColor: theme.ui.border }}
>

// ✅ Correct - 완전한 style
<div style={{
  border: `1px solid ${theme.ui.border}`
}}>
```

---

## 📊 진행 상황 체크리스트

### Person A (Core Theme)
- [ ] theme.ts: defaultTheme 전체 hex 변환
- [ ] theme.ts: getMentionHighlightStyle() 함수 추가
- [ ] ThemeProvider.tsx 검증
- [ ] npm run build 성공
- [ ] 커밋 & 푸시 완료

### Person B (Header & Auth)
- [ ] Header.tsx 변환 완료
- [ ] SearchResults.tsx 변환 완료
- [ ] LoginModal.tsx 변환 완료
- [ ] npm run build 성공
- [ ] 커밋 & 푸시 완료

### Person C (Home Page)
- [ ] MainContainer.tsx 변환 완료
- [ ] MemoCard.tsx 변환 완료
- [ ] MemoCardCompact.tsx 변환 완료
- [ ] RightSidebar.tsx 변환 완료
- [ ] npm run build 성공
- [ ] 커밋 & 푸시 완료

### Person D (Entity Timeline)
- [ ] EntityTimeline.tsx 변환 완료
- [ ] TimelineCanvas.tsx 검증 완료
- [ ] EntityDetailDrawer.tsx 변환 완료
- [ ] MemoDetailDrawer.tsx 변환 완료
- [ ] MemoEditDrawer.tsx 변환 완료
- [ ] EntityDropdown.tsx 변환 완료
- [ ] npm run build 성공
- [ ] 커밋 & 푸시 완료

### Person E (Common & Modals)
- [ ] BaseDrawer.tsx 변환 완료
- [ ] SettingsDrawer.tsx 변환 완료
- [ ] ProfileDrawer.tsx 변환 완료
- [ ] MemoTooltip.tsx 검증 완료
- [ ] EntityTooltip.tsx 검증 완료
- [ ] EntityDeleteModal.tsx 변환 완료
- [ ] MemoDeleteModal.tsx 변환 완료
- [ ] npm run build 성공
- [ ] 커밋 & 푸시 완료

### 전체 팀 (병합 후)
- [ ] Person A 브랜치 dev 병합
- [ ] Person B 브랜치 dev 병합
- [ ] Person C 브랜치 dev 병합
- [ ] Person D 브랜치 dev 병합
- [ ] Person E 브랜치 dev 병합
- [ ] dev 브랜치 최종 빌드 성공
- [ ] 테마 전환 테스트 통과
- [ ] 모든 UI 요소 정상 작동 확인

---

## 🎯 최종 목표

**마이그레이션 완료 후:**
- ✅ 테마 전환 시 모든 색상이 즉시 바뀜 (Default ↔ Claude)
- ✅ 모든 테마 값이 hex/rgba로 통일
- ✅ TypeScript 타입 안전성 보장
- ✅ 유지보수 용이한 단일 테마 시스템
- ✅ 향후 새 테마 추가 간편 (theme.ts에 객체 하나 추가)

**Success criteria:**
1. `npm run build` 에러 없음
2. Default 테마 정상 작동
3. Claude 테마 정상 작동
4. Header에서 테마 전환 정상
5. Settings에서 테마 전환 정상
6. Timeline canvas 색상 정상
7. 모든 Drawer/Modal 색상 정상

---

## 📞 문의 및 지원

**문제 발생 시:**
1. 이 문서의 "자주 발생하는 문제 & 해결법" 섹션 확인
2. 팀 채팅방에 스크린샷과 함께 문의
3. 에러 메시지 전체 복사해서 공유

**작업 시간:** 각자 30-45분 예상

**화이팅! 🚀**
