# Project Memory - Unlooped MVP

## Database Schema Constraints

### Auth-Related Foreign Keys

**`public.users.id` → `auth.users.id` (ON DELETE CASCADE)**
- `public.users.id`는 `auth.users.id`를 참조하는 FK 제약 조건이 설정되어 있음
- 제약 조건명: `users_id_fkey`
- 삭제 동작: `ON DELETE CASCADE` (auth 사용자 삭제 시 public.users도 함께 삭제)
- **중요**: 이 FK 제약은 DB에 실제로 존재하지만, `types/supabase.ts` 타입 파일에는 표시되지 않음
  - 이유: `supabase gen types` 명령어는 `public` 스키마 내의 FK만 타입에 포함
  - `auth` 스키마를 참조하는 FK는 자동 생성 타입에 포함되지 않음

### Database Tables

현재 프로젝트의 주요 테이블:
- `users`: 사용자 정보 (auth.users와 1:1 매핑)
- `entity`: 엔티티 정보
- `entity_relation`: 엔티티 간 관계
- `memo`: 사용자 메모
- `memo_entity`: 메모-엔티티 연결 테이블

## Supabase Configuration

- **Project ID**: `xlovwwdppjfsbuzibctk`
- **Project URL**: `https://xlovwwdppjfsbuzibctk.supabase.co`
- **Type Generation Command**: 
  - npm script: `npm run gen:types` (권장)
  - 직접 실행: `npx supabase gen types typescript --project-id xlovwwdppjfsbuzibctk > types/supabase.ts`
  
**중요**: 데이터베이스 스키마가 변경될 때마다 타입 파일을 업데이트해야 합니다. `npm run gen:types` 명령어를 실행하면 `types/supabase.ts` 파일이 자동으로 업데이트됩니다.
