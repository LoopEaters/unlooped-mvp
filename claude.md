# Unlooped MVP 프로젝트

## 프로젝트 개요

Unlooped MVP는 Next.js 14 기반의 풀스택 웹 애플리케이션입니다. 실시간 데이터 관리와 사용자 인터랙션을 위한 모던한 UI/UX를 제공하는 MVP(Minimum Viable Product) 프로젝트입니다.

### 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **UI 라이브러리**: React 18
- **스타일링**: Tailwind CSS 4
- **상태 관리 & 데이터 페칭**: TanStack React Query v5
- **백엔드/데이터베이스**: Supabase
- **코드 품질**: Prettier, ESLint

### 프로젝트 구조

```
app/
├── components/      # 재사용 가능한 React 컴포넌트
│   ├── Header.tsx
│   ├── MainContainer.tsx
│   ├── InputArea.tsx
│   └── RightSidebar.tsx
├── lib/            # 유틸리티 및 라이브러리 설정
│   ├── supabase.ts    # Supabase 클라이언트 설정
│   ├── queries.ts     # React Query 훅 및 데이터 페칭 로직
│   └── util.ts        # 공통 유틸리티 함수
├── providers/      # React Context Providers
│   └── QueryProvider.tsx
└── page.tsx        # 메인 페이지

types/
└── supabase.ts     # Supabase 데이터베이스 스키마 타입 정의

supabase/
└── migrations/     # 데이터베이스 마이그레이션 파일
```

## 개발 원칙 (시니어 개발자 관점)

이 프로젝트는 **최고의 시니어 개발자**로서 가장 효율적이고 권장되는 형태로 개발됩니다. 다음 원칙을 준수합니다:

### 1. 코드 품질 및 유지보수성
- **타입 안정성**: TypeScript를 적극 활용하여 컴파일 타임에 오류를 방지
- **컴포넌트 분리**: 단일 책임 원칙(SRP)을 따르는 작고 재사용 가능한 컴포넌트
- **명확한 네이밍**: 의도를 명확히 전달하는 변수명과 함수명 사용
- **DRY 원칙**: 중복 코드 제거 및 공통 로직 추상화

### 2. 성능 최적화
- **React Query 활용**: 효율적인 서버 상태 관리 및 캐싱 전략
- **코드 스플리팅**: Next.js의 자동 코드 스플리팅 활용
- **최적화된 리렌더링**: React.memo, useMemo, useCallback 적절한 사용
- **이미지 및 리소스 최적화**: Next.js Image 컴포넌트 등 활용

### 3. 아키텍처 및 설계 패턴
- **관심사의 분리**: UI, 비즈니스 로직, 데이터 레이어 명확히 분리
- **커스텀 훅 패턴**: 재사용 가능한 로직을 커스텀 훅으로 추상화
- **에러 처리**: 일관된 에러 핸들링 전략 수립
- **환경 변수 관리**: 민감한 정보는 환경 변수로 관리

### 4. 개발 경험 (DX)
- **타입 안전성**: 엄격한 TypeScript 설정으로 개발 시점 오류 감지
- **자동 포맷팅**: Prettier를 통한 일관된 코드 스타일
- **린팅**: ESLint를 통한 코드 품질 관리
- **명확한 폴더 구조**: 직관적이고 확장 가능한 프로젝트 구조

### 5. 확장성 및 확장 가능성
- **모듈화**: 기능별로 독립적으로 확장 가능한 구조
- **마이그레이션 관리**: Supabase 마이그레이션을 통한 스키마 버전 관리
- **환경별 설정**: 개발/스테이징/프로덕션 환경 분리

### 6. 보안 및 모범 사례
- **환경 변수 보호**: 클라이언트/서버 환경 변수 적절히 분리
- **인증/인가**: Supabase Auth를 통한 안전한 사용자 인증
- **SQL Injection 방지**: Supabase 클라이언트를 통한 안전한 쿼리 실행
- **CORS 및 보안 헤더**: 적절한 보안 헤더 설정

### 7. 테스트 가능성
- **순수 함수**: 테스트하기 쉬운 순수 함수 우선 사용
- **의존성 주입**: 외부 의존성을 쉽게 모킹할 수 있는 구조
- **컴포넌트 분리**: 프레젠테이션 컴포넌트와 로직 분리

### 8. 문서화 및 커뮤니케이션
- **주석**: 복잡한 로직에 대한 명확한 주석
- **타입 정의**: 인터페이스와 타입을 통한 자체 문서화
- **커밋 메시지**: 명확하고 의미 있는 커밋 메시지

이러한 원칙들을 바탕으로 **유지보수 가능하고, 확장 가능하며, 성능이 우수한** 코드베이스를 구축합니다.

## 주요 명령어 및 작업 가이드

### Supabase 관련

#### 타입 파일 생성/업데이트
데이터베이스 스키마가 변경될 때마다 타입 파일을 업데이트해야 합니다:

```bash
# npm script 사용 (권장)
npm run gen:types

# 또는 직접 실행
npx supabase gen types typescript --project-id xlovwwdppjfsbuzibctk > types/supabase.ts
```

#### 타입 사용 예시
```typescript
import { Database } from '@/types/supabase'

// 테이블 Row 타입
type Entity = Database['public']['Tables']['entity']['Row']

// Insert 타입 (생성 시 사용)
type EntityInsert = Database['public']['Tables']['entity']['Insert']

// Update 타입 (수정 시 사용)
type EntityUpdate = Database['public']['Tables']['entity']['Update']
```

#### 데이터베이스 스키마 추가 정보

**Auth 관련 제약 조건:**
- `public.users.id`는 `auth.users.id`를 참조하는 FK (ON DELETE CASCADE)
- 이 제약은 DB에 실제로 존재하지만, 타입 파일(`types/supabase.ts`)에는 표시되지 않음
  - 이유: `supabase gen types`는 `public` 스키마 내의 FK만 타입에 포함
  - `auth` 스키마를 참조하는 FK는 자동 생성되지 않음
- Supabase Auth 사용자 삭제 시 `public.users` 레코드도 자동 삭제됨

### 환경 변수

현재 설정된 Supabase 환경 변수:
- `NEXT_PUBLIC_SUPABASE_URL`: https://xlovwwdppjfsbuzibctk.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (`.env.local` 파일에서 관리)

### 개발 워크플로우

1. **DB 스키마 변경 시**:
   - Supabase Dashboard에서 스키마 수정
   - 타입 파일 업데이트: `npm run gen:types` 실행
   - 관련 코드의 타입 에러 확인 및 수정

2. **새 기능 개발 시**:
   - `app/components/`에 컴포넌트 추가
   - 데이터 페칭이 필요하면 `app/lib/queries.ts`에 React Query 훅 추가
   - Supabase 클라이언트는 `app/lib/supabase.ts` 사용

3. **코드 포맷팅**:
   ```bash
   npm run format  # Prettier 실행
   npm run lint    # ESLint 실행
   ```

