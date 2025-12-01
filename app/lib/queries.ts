import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/app/lib/supabase/client';
import type { Database } from '@/types/supabase';
import { toast } from 'sonner';

// 테이블 이름 타입 추출
type TableName = keyof Database['public']['Tables'];

// 타입 정의
type Entity = Database['public']['Tables']['entity']['Row'];
type EntityInsert = Database['public']['Tables']['entity']['Insert'];
type Memo = Database['public']['Tables']['memo']['Row'];
type MemoInsert = Database['public']['Tables']['memo']['Insert'];
type MemoEntityInsert = Database['public']['Tables']['memo_entity']['Insert'];

// 예시: 사용자 정보 가져오기
export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return user; // user는 null일 수 있음
    },
  });
}

// 예시: 특정 테이블에서 데이터 가져오기
// 사용 예: const { data, isLoading } = useTableData('entity');
// T는 테이블 이름 타입입니다 (예: 'entity', 'memo', 'users' 등)
// 반환 타입: Database['public']['Tables'][T]['Row'][] - 해당 테이블의 Row 타입 배열
export function useTableData<T extends TableName>(tableName: T) {
  return useQuery<Database['public']['Tables'][T]['Row'][]>({
    queryKey: [tableName],
    queryFn: async () => {
      const { data, error } = await supabase.from(tableName).select('*');
      if (error) throw error;
      // data가 null일 수 있으므로 빈 배열로 처리
      return (data ?? []) as unknown as Database['public']['Tables'][T]['Row'][];
    },
  });
}

// 예시: 데이터 추가 Mutation
// 반환 타입: Database['public']['Tables'][T]['Row'][] - 추가된 레코드 배열
export function useInsertData<T extends TableName>(tableName: T) {
  const queryClient = useQueryClient();

  return useMutation<
    Database['public']['Tables'][T]['Row'][],
    Error,
    Database['public']['Tables'][T]['Insert']
  >({
    mutationFn: async (newData: Database['public']['Tables'][T]['Insert']) => {
      const { data, error } = await supabase
        .from(tableName)
        .insert(newData as any)
        .select();
      if (error) throw error;
      if (!data) throw new Error('No data returned from insert');
      return data as unknown as Database['public']['Tables'][T]['Row'][];
    },
    onSuccess: () => {
      // 데이터 추가 성공 시 해당 테이블의 캐시를 무효화하여 자동으로 다시 fetch
      queryClient.invalidateQueries({ queryKey: [tableName] });
    },
  });
}

// 예시: 데이터 업데이트 Mutation
// 반환 타입: Database['public']['Tables'][T]['Row'][] - 업데이트된 레코드 배열
export function useUpdateData<T extends TableName>(tableName: T) {
  const queryClient = useQueryClient();

  return useMutation<
    Database['public']['Tables'][T]['Row'][],
    Error,
    { id: string | number; updates: Database['public']['Tables'][T]['Update'] }
  >({
    mutationFn: async ({ id, updates }: { id: string | number; updates: Database['public']['Tables'][T]['Update'] }) => {
      const { data, error } = await (supabase
        .from(tableName)
        .update(updates as any) as any)
        .eq('id', id as string)
        .select();
      if (error) throw error;
      if (!data) throw new Error('No data returned from update');
      return data as unknown as Database['public']['Tables'][T]['Row'][];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
    },
  });
}

// 예시: 데이터 삭제 Mutation
// 반환 타입: void - 삭제 성공 시 아무것도 반환하지 않음
export function useDeleteData<T extends TableName>(tableName: T) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string | number>({
    mutationFn: async (id: string | number) => {
      const { error } = await (supabase
        .from(tableName)
        .delete() as any)
        .eq('id', id as string);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
    },
  });
}

// ==================== Entity API ====================

/**
 * 현재 사용자의 전체 Entity 조회
 * staleTime: 3분 (PRD 명세)
 */
export function useEntities(userId?: string) {
  return useQuery<Entity[]>({
    queryKey: ['entities', userId],
    queryFn: async () => {
      // userId가 없으면 직접 조회
      let currentUserId = userId;
      if (!currentUserId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        currentUserId = user.id;
      }

      const { data, error } = await supabase
        .from('entity')
        .select('id, name')
        .eq('user_id', currentUserId)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 3 * 60 * 1000, // 3분
    enabled: !!userId || true, // userId가 없어도 실행
  });
}

/**
 * Entity 생성
 */
export function useCreateEntity() {
  const queryClient = useQueryClient();

  return useMutation<Entity, Error, string>({
    mutationFn: async (name: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // 이름 유효성 검사
      const regex = /^[가-힣a-zA-Z0-9]{1,20}$/;
      if (!regex.test(name)) {
        throw new Error('Entity 이름은 한글, 영문, 숫자만 가능하며 1-20자여야 합니다.');
      }

      const { data, error } = await supabase
        .from('entity')
        .insert({ name, user_id: user.id })
        .select()
        .single();

      if (error) {
        // 중복된 이름 처리
        if (error.code === '23505') {
          throw new Error('이미 존재하는 Entity 이름입니다.');
        }
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      // Optimistic update
      queryClient.setQueryData<Entity[]>(['entities'], (old) => {
        if (!old) return [data];
        return [...old, data].sort((a, b) => a.name.localeCompare(b.name));
      });

      toast.success(`✨ 새 엔티티 '${data.name}'이(가) 생성되었습니다`);
    },
  });
}

/**
 * 이름으로 Entity 조회
 */
export async function getEntityByName(name: string, userId: string): Promise<Entity | null> {
  const { data, error } = await supabase
    .from('entity')
    .select('*')
    .eq('user_id', userId)
    .eq('name', name)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// ==================== Memo API ====================

/**
 * 현재 사용자의 전체 Memo 조회 (최신순)
 */
export function useMemos(userId?: string) {
  return useQuery<Memo[]>({
    queryKey: ['memos', userId],
    queryFn: async () => {
      // userId가 없으면 직접 조회
      let currentUserId = userId;
      if (!currentUserId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        currentUserId = user.id;
      }

      const { data, error } = await supabase
        .from('memo')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 1 * 60 * 1000, // 1분
    enabled: !!userId || true,
  });
}

/**
 * Entity 생성 (헬퍼 함수 - mutation 내부에서 사용)
 */
async function createEntityDirect(name: string, userId: string): Promise<Entity> {
  console.log(`      ➕ [createEntityDirect] 시작: ${name}`);

  // 이름 유효성 검사
  const regex = /^[가-힣a-zA-Z0-9]{1,20}$/;
  if (!regex.test(name)) {
    console.error(`      ❌ [createEntityDirect] 유효성 검사 실패: ${name}`);
    throw new Error('Entity 이름은 한글, 영문, 숫자만 가능하며 1-20자여야 합니다.');
  }
  console.log(`      ✅ [createEntityDirect] 유효성 검사 통과: ${name}`);

  console.log(`      📤 [createEntityDirect] DB INSERT 시작: ${name}`);
  const { data, error } = await supabase
    .from('entity')
    .insert({ name, user_id: userId })
    .select()
    .single();

  if (error) {
    console.error(`      ❌ [createEntityDirect] DB INSERT 실패: ${name}`, error);
    // 중복된 이름 처리
    if (error.code === '23505') {
      throw new Error('이미 존재하는 Entity 이름입니다.');
    }
    throw error;
  }

  console.log(`      ✅ [createEntityDirect] DB INSERT 성공: ${name}`, data.id);
  return data;
}

/**
 * Memo 생성 및 Entity 연결
 */
export function useCreateMemo(userId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    Memo,
    Error,
    { content: string; entityNames: string[] }
  >({
    mutationFn: async ({ content, entityNames }) => {
      console.log('🚀 [useCreateMemo] 시작', { content, entityNames, userId });

      if (!userId) throw new Error('User not authenticated');
      console.log('✅ [useCreateMemo] 사용자 인증 확인', userId);

      // 1. Memo 생성
      console.log('📝 [useCreateMemo] 메모 생성 시작');
      const { data: memo, error: memoError } = await supabase
        .from('memo')
        .insert({ content, user_id: userId })
        .select()
        .single();

      if (memoError) {
        console.error('❌ [useCreateMemo] 메모 생성 실패', memoError);
        throw memoError;
      }
      console.log('✅ [useCreateMemo] 메모 생성 성공', memo.id);

      // 2. Entity 처리 및 연결
      console.log('🏷️ [useCreateMemo] Entity 처리 시작', { count: entityNames.length });
      const entities = await Promise.all(
        entityNames.map(async (name) => {
          console.log(`  🔍 [Entity: ${name}] 조회 시작`);

          // 기존 entity 조회
          let entity = await getEntityByName(name, userId);

          // 없으면 생성
          if (!entity) {
            console.log(`  ➕ [Entity: ${name}] 새로 생성`);
            entity = await createEntityDirect(name, userId);
            console.log(`  ✅ [Entity: ${name}] 생성 완료`, entity.id);
            // Toast 피드백
            toast.success(`✨ 새 엔티티 '${name}'이(가) 생성되었습니다`);
          } else {
            console.log(`  ✅ [Entity: ${name}] 기존 Entity 사용`, entity.id);
          }

          return entity;
        })
      );
      console.log('✅ [useCreateMemo] Entity 처리 완료', entities.length);

      // 3. memo_entity 관계 생성
      if (entities.length > 0) {
        console.log('🔗 [useCreateMemo] memo_entity 관계 생성 시작');
        const memoEntityInserts: MemoEntityInsert[] = entities.map((entity) => ({
          memo_id: memo.id,
          entity_id: entity.id,
        }));

        const { error: linkError } = await supabase
          .from('memo_entity')
          .insert(memoEntityInserts);

        if (linkError) {
          console.error('❌ [useCreateMemo] memo_entity 생성 실패', linkError);
          throw linkError;
        }
        console.log('✅ [useCreateMemo] memo_entity 관계 생성 완료');
      }

      console.log('🎉 [useCreateMemo] 모든 작업 완료');
      return memo;
    },
    onSuccess: () => {
      console.log('♻️ [useCreateMemo] 캐시 무효화 시작');
      // 메모 및 엔티티 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['memos'] });
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      toast.success('메모가 저장되었습니다.');
      console.log('✅ [useCreateMemo] 완전히 종료');
    },
    onError: (error) => {
      console.error('❌ [useCreateMemo] 에러 발생', error);
      toast.error(`메모 저장 실패: ${error.message}`);
    },
  });
}

/**
 * Entity별 Memo 조회 (단일 entity)
 */
export function useMemosByEntity(entityId: string | null) {
  return useQuery<Memo[]>({
    queryKey: ['memos', 'byEntity', entityId],
    queryFn: async () => {
      if (!entityId) return [];

      const { data, error } = await supabase
        .from('memo')
        .select('*, memo_entity!inner(entity_id)')
        .eq('memo_entity.entity_id', entityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!entityId,
  });
}

/**
 * 여러 Entity에 해당하는 Memo 조회
 */
export function useMemosByEntities(entityIds: string[]) {
  return useQuery<Memo[]>({
    queryKey: ['memos', 'byEntities', entityIds],
    queryFn: async () => {
      if (!entityIds || entityIds.length === 0) return [];

      const { data, error } = await supabase
        .from('memo')
        .select('*, memo_entity!inner(entity_id)')
        .in('memo_entity.entity_id', entityIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: entityIds.length > 0,
  });
}
