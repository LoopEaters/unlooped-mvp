# 🎨 테마 마이그레이션 전체 파일 체크리스트

> **목적:** 모든 파일이 배정되었는지 확인
> **날짜:** 2025-12-06

---

## 📋 전체 파일 리스트 (theme 사용하는 모든 파일)

### ✅ Person A - Core Theme System (3개)
- [x] `app/lib/theme.ts` ⭐⭐⭐
- [x] `app/providers/ThemeProvider.tsx`
- [x] `app/globals.css`

### ✅ Person B - Header & Auth UI (3개)
- [x] `app/components/common/Header.tsx`
- [x] `app/components/common/SearchResults.tsx`
- [x] `app/components/auth/LoginModal.tsx`

### ✅ Person C - Home Page Components (4개)
- [x] `app/components/home/MainContainer.tsx`
- [x] `app/components/home/MemoCard.tsx`
- [x] `app/components/home/MemoCardCompact.tsx`
- [x] `app/components/home/RightSidebar.tsx`

### ✅ Person D - Entity Timeline & Details (5개)
- [x] `app/components/entities/EntityTimeline.tsx`
- [x] `app/components/entities/TimelineCanvas.tsx`
- [x] `app/components/entities/EntityDetailDrawer.tsx`
- [x] `app/components/entities/MemoDetailDrawer.tsx`
- [x] `app/components/entities/MemoEditDrawer.tsx`

### ✅ Person E - Common Components & Modals (7개)
- [x] `app/components/common/BaseDrawer.tsx`
- [x] `app/components/common/SettingsDrawer.tsx`
- [x] `app/components/common/ProfileDrawer.tsx`
- [x] `app/components/entities/MemoTooltip.tsx`
- [x] `app/components/entities/EntityTooltip.tsx`
- [x] `app/components/home/EntityDeleteModal.tsx`
- [x] `app/components/home/MemoDeleteModal.tsx`

### ✅ Person F - Input & Pages & Utils (12개)
- [x] `app/components/home/InputArea.tsx` ⭐⭐⭐
- [x] `app/page.tsx`
- [x] `app/entities/page.tsx`
- [x] `app/import/page.tsx`
- [x] `app/landing/page.tsx`
- [x] `app/not-found.tsx`
- [x] `app/layout.tsx`
- [x] `app/hooks/tiptap/MentionList.tsx`
- [x] `app/lib/utils/highlightEntities.tsx`
- [x] `app/components/entities/EntityDropdown.tsx`
- [x] `app/components/common/DevOnboardingButton.tsx`
- [x] `app/providers/SettingsProvider.tsx`

### ✅ Person G - Landing Page (3개)
- [x] `app/components/landing/HeroSection.tsx`
- [x] `app/components/landing/FeaturesSection.tsx`
- [x] `app/landing/page.tsx` (중복 - F와 공유)

### ✅ Person H - Import & Onboarding (9개)
- [x] `app/components/import/ImportPage.tsx`
- [x] `app/components/import/TextInput.tsx`
- [x] `app/components/import/ParsePreview.tsx`
- [x] `app/components/import/ImportProgress.tsx`
- [x] `app/components/import/ResultSummary.tsx`
- [x] `app/components/onboarding/OnboardingModal.tsx`
- [x] `app/components/onboarding/WelcomeStep.tsx`
- [x] `app/components/onboarding/TimelineStep.tsx`
- [x] `app/components/onboarding/MentionStep.tsx`

---

## 🔍 검증 (theme 사용하는 모든 파일)

아래는 `grep -rl "theme\|Theme\|useTheme\|defaultTheme"` 결과입니다:

```
✅ app/components/auth/LoginModal.tsx → Person B
✅ app/components/common/BaseDrawer.tsx → Person E
✅ app/components/common/DevOnboardingButton.tsx → Person F
✅ app/components/common/Header.tsx → Person B
✅ app/components/common/ProfileDrawer.tsx → Person E
✅ app/components/common/SearchResults.tsx → Person B
✅ app/components/common/SettingsDrawer.tsx → Person E
✅ app/components/entities/EntityDetailDrawer.tsx → Person D
✅ app/components/entities/EntityDropdown.tsx → Person F
✅ app/components/entities/EntityTimeline.tsx → Person D
✅ app/components/entities/EntityTooltip.tsx → Person E
✅ app/components/entities/MemoDetailDrawer.tsx → Person D
✅ app/components/entities/MemoTooltip.tsx → Person E
✅ app/components/entities/TimelineCanvas.tsx → Person D
✅ app/components/home/EntityDeleteModal.tsx → Person E
✅ app/components/home/MainContainer.tsx → Person C
✅ app/components/home/MemoCard.tsx → Person C
✅ app/components/home/MemoCardCompact.tsx → Person C
✅ app/components/home/MemoDeleteModal.tsx → Person E
✅ app/components/home/MemoEditDrawer.tsx → Person D
✅ app/components/home/RightSidebar.tsx → Person C
✅ app/components/import/ImportPage.tsx → Person H
✅ app/components/import/ImportProgress.tsx → Person H
✅ app/components/import/ParsePreview.tsx → Person H
✅ app/components/import/ResultSummary.tsx → Person H
✅ app/components/import/TextInput.tsx → Person H
✅ app/components/landing/FeaturesSection.tsx → Person G
✅ app/components/landing/HeroSection.tsx → Person G
✅ app/components/onboarding/MentionStep.tsx → Person H
✅ app/components/onboarding/OnboardingModal.tsx → Person H
✅ app/components/onboarding/TimelineStep.tsx → Person H
✅ app/components/onboarding/WelcomeStep.tsx → Person H
✅ app/entities/page.tsx → Person F
✅ app/hooks/tiptap/MentionList.tsx → Person F
✅ app/import/page.tsx → Person F
✅ app/landing/page.tsx → Person F (레이아웃) / Person G (컴포넌트)
✅ app/layout.tsx → Person A (검증) / Person F (확인)
✅ app/lib/utils/highlightEntities.tsx → Person F
✅ app/providers/SettingsProvider.tsx → Person F
✅ app/providers/ThemeProvider.tsx → Person A
```

---

## 🔍 추가 확인: Tailwind theme 클래스 사용 파일

`bg-bg-`, `text-text-`, `border-border-` 클래스 사용 파일:

```
✅ app/components/common/Header.tsx → Person B
✅ app/components/entities/EntityDropdown.tsx → Person F
✅ app/components/entities/MemoDetailDrawer.tsx → Person D
✅ app/components/home/InputArea.tsx → Person F ⭐⭐⭐
✅ app/components/home/MemoEditDrawer.tsx → Person D
✅ app/entities/page.tsx → Person F
✅ app/not-found.tsx → Person F
✅ app/page.tsx → Person F
```

---

## ✅ 최종 결론

### 배정 완료
- **총 파일 수:** 39개 (theme 사용)
- **Person A:** 3개
- **Person B:** 3개
- **Person C:** 4개
- **Person D:** 5개
- **Person E:** 7개
- **Person F:** 12개
- **Person G:** 3개
- **Person H:** 9개

### 중복 확인
- `app/landing/page.tsx`: Person F (레이아웃 확인) + Person G (컴포넌트 작업)
  - **해결:** Person G가 주로 작업, Person F는 확인만
- `app/layout.tsx`: Person A (ThemeProvider 관련) + Person F (확인)
  - **해결:** Person A가 이미 수정했을 것, Person F는 검증만

### 누락 파일
- **없음!** ✅

---

## 🎯 작업 순서

1. **Person A 먼저 완료** (theme.ts 기반이므로)
2. **A가 dev 병합 후**
3. **B, C, D, E 병합** (순차 또는 병렬)
4. **F, G, H 병합** (순차)
5. **최종 테스트**

---

## 📊 예상 시간

- Person A: 45분 (가장 중요)
- Person B: 30분
- Person C: 35분
- Person D: 40분
- Person E: 35분
- Person F: 40분 (InputArea가 복잡)
- Person G: 25분 (Landing은 간단)
- Person H: 35분

**총 병렬 작업 시간: 약 1시간** (A 완료 대기 포함)

---

## ✅ 완료!

**모든 파일이 배정되었습니다. 누락 없음!** 🎉
