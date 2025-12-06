# 온보딩 로직 및 기능 소개 구현 방안

작성일: 2025-12-05

## 목적

신규 사용자가 Unlooped의 주요 기능(Entity, Timeline, Mention 등)을 빠르게 이해하고 사용할 수 있도록 온보딩 경험을 제공한다.

---

## 구현 방식 옵션

### 1. 모달/다이얼로그 기반 온보딩 ⭐ (추천)

**구조:**
```
로그인 완료 → OnboardingModal 표시 → 스텝별 진행 (1/3, 2/3, 3/3) → 완료
```

**장점:**
- ✅ 기존 UI 패턴(LoginModal)과 일관성
- ✅ 구현 간단, 빠른 개발
- ✅ 사용자가 바로 기능 파악 가능
- ✅ 언제든지 다시 띄울 수 있음 (Header에 "도움말" 버튼)

**단점:**
- ❌ 긴 설명에는 부적합
- ❌ 여러 스텝이 많으면 답답할 수 있음

**구현 포인트:**
- `OnboardingModal.tsx` 컴포넌트 생성 (Radix Dialog 활용)
- 스텝별 컨텐츠:
  - Step 1: 엔티티란? (Person, Project, Event)
  - Step 2: 타임라인 사용법
  - Step 3: 멘션 기능 (@사용법)
- DB `users` 테이블에 `onboarding_completed: boolean` 필드 추가
- AuthProvider에서 로그인 후 자동으로 체크해서 띄우기

---

### 2. 전용 온보딩 페이지 (`/onboarding` 라우트)

**구조:**
```
로그인 완료 → /onboarding 페이지로 리다이렉트 → 풀스크린 스텝별 진행 → 완료 후 메인으로
```

**장점:**
- ✅ 충분한 공간으로 자세한 설명 가능
- ✅ 애니메이션/인터랙션 자유롭게 추가
- ✅ 프로그레스 바로 진행 상황 명확히 표시
- ✅ 브랜딩 강조 가능

**단점:**
- ❌ 개발 시간 더 필요
- ❌ 페이지 전환으로 컨텍스트 단절감
- ❌ 스킵하면 다시 보기 어려움

**구현 포인트:**
- `app/onboarding/page.tsx` 생성
- 여러 스텝 컴포넌트 (`WelcomeStep`, `EntityStep`, `TimelineStep`, `MentionStep`)
- `useState`로 현재 스텝 관리
- 완료 후 API 호출해서 `onboarding_completed` 업데이트 후 메인으로 이동

---

### 3. 인앱 투어 (Tooltip/Popover 방식)

**구조:**
```
로그인 완료 → 메인 화면에서 순차적으로 기능 하이라이트 + 툴팁 표시

예시:
"여기서 엔티티를 추가할 수 있어요!" → 다음 → "타임라인에서 히스토리를 확인하세요!"
```

**장점:**
- ✅ 실제 UI에서 직접 가이드
- ✅ 컨텍스트 유지
- ✅ 학습 효과가 가장 좋음

**단점:**
- ❌ 구현 복잡도 높음
- ❌ 외부 라이브러리 필요 (react-joyride, shepherd.js 등)
- ❌ UI 변경 시 유지보수 어려움

**구현 포인트:**
- `react-joyride` 같은 라이브러리 사용
- 각 UI 요소에 `data-tour` 속성 추가
- 투어 스텝 정의 및 순서 관리

---

### 4. 슬라이드 캐러셀 온보딩 (모바일 앱 스타일)

**구조:**
```
로그인 완료 → 풀스크린 슬라이드 3~5개 (좌우 스와이프) → Skip or 완료
```

**장점:**
- ✅ 익숙한 UX 패턴
- ✅ 이미지/일러스트레이션으로 시각적 전달
- ✅ 빠르게 넘길 수 있음

**단점:**
- ❌ 데스크톱에서는 덜 자연스러움
- ❌ 이미지/일러스트 제작 필요

---

## 🎯 최종 추천: **1번(모달) + 3번(투어) 하이브리드**

### Phase 1: 간단한 Welcome 모달

```tsx
로그인 직후 →
"Unlooped에 오신 것을 환영합니다! 🎉
간단한 기능 소개를 보시겠어요?"
[둘러보기] [나중에]
```

### Phase 2: 선택적 인앱 투어

```tsx
[둘러보기] 클릭 시 →
실제 화면에서 주요 기능만 4~5개 하이라이트
(Spotlight 효과 + 툴팁)
```

---

## 구현 시 고려사항

### 1. DB 스키마 설계

```sql
-- users 테이블에 추가
ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN onboarding_skipped BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN onboarding_completed_at TIMESTAMP;
```

### 2. 상태 관리 (AuthProvider)

```typescript
// AuthProvider에 추가
const [showOnboarding, setShowOnboarding] = useState(false);

// 로그인 후 체크
useEffect(() => {
  if (session && !user?.onboarding_completed) {
    setShowOnboarding(true);
  }
}, [session, user]);
```

### 3. 재진입 로직

```tsx
// Header에 "기능 소개 다시 보기" 버튼
<button onClick={() => setShowOnboarding(true)}>
  도움말
</button>
```

### 4. 온보딩 컨텐츠 예시

**Step 1: Entity 소개**
- Entity는 Person, Project, Event 세 가지 타입이 있습니다
- 색상으로 타입을 구분할 수 있습니다 (초록/보라/주황)

**Step 2: Timeline 사용법**
- 모든 활동이 Timeline에 기록됩니다
- 필터링으로 원하는 내용만 볼 수 있습니다

**Step 3: Mention 기능**
- @를 입력하면 Entity를 멘션할 수 있습니다
- 멘션으로 관계를 쉽게 추적할 수 있습니다

---

## 향후 고려사항

- 온보딩 완료율 트래킹 (analytics)
- 스킵한 사용자 대상 리마인더
- A/B 테스트로 최적의 온보딩 플로우 찾기
- 버전별 온보딩 업데이트 (새 기능 추가 시)
