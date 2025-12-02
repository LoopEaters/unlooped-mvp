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
        .select('*')
        .eq('user_id', currentUserId)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 3 * 60 * 1000, // 3분
    enabled: !!userId,
    refetchOnMount: false, // 마운트 시 재조회 방지
    refetchOnWindowFocus: false, // 창 포커스 시 재조회 방지
  });
}

/**
 * Entity type 업데이트 (Optimistic Update)
 */
export function useUpdateEntityType() {
  const queryClient = useQueryClient();

  return useMutation<
    Entity,
    Error,
    { entityId: string; type: 'person' | 'project' | 'unknown'; userId: string },
    { previousEntities: Entity[] | undefined }
  >({
    mutationFn: async ({ entityId, type }) => {
      const { data, error } = await supabase
        .from('entity')
        .update({ type })
        .eq('id', entityId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    // Optimistic update: 서버 응답 전에 UI 즉시 업데이트
    onMutate: async ({ entityId, type, userId }) => {
      // 진행 중인 refetch 취소
      await queryClient.cancelQueries({ queryKey: ['entities', userId] });

      // 이전 데이터 백업
      const previousEntities = queryClient.getQueryData<Entity[]>(['entities', userId]);

      // Optimistic update 적용
      queryClient.setQueryData<Entity[]>(['entities', userId], (old) => {
        if (!old) return old;
        return old.map((entity) =>
          entity.id === entityId ? { ...entity, type } : entity
        );
      });

      // 롤백을 위해 이전 데이터 반환
      return { previousEntities };
    },
    onSuccess: (data, variables) => {
      // 서버에서 받은 최신 데이터로 캐시 업데이트 (invalidate 대신)
      queryClient.setQueryData<Entity[]>(['entities', variables.userId], (old) => {
        if (!old) return old;
        return old.map((entity) =>
          entity.id === data.id ? data : entity
        );
      });
      toast.success(`'${data.name}' 타입이 '${data.type}'(으)로 변경되었습니다`);
    },
    onError: (error, variables, context) => {
      // 에러 발생 시 롤백
      if (context?.previousEntities) {
        queryClient.setQueryData(['entities', variables.userId], context.previousEntities);
      }
      toast.error(`타입 변경 실패: ${error.message}`);
    },
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
        .order('created_at', { ascending: true }); // 오래된 것부터 (최신이 아래)

      if (error) throw error;
      return data || [];
    },
    staleTime: 1 * 60 * 1000, // 1분
    enabled: !!userId,
    refetchOnMount: false, // 마운트 시 재조회 방지
    refetchOnWindowFocus: false, // 창 포커스 시 재조회 방지
  });
}

/**
 * Entity 생성 (헬퍼 함수 - mutation 내부에서 사용)
 */
export async function createEntityDirect(
  name: string,
  userId: string,
  preClassifiedType?: string  // 미리 분류된 type (optional)
): Promise<Entity> {
  if (process.env.NODE_ENV === 'development') {
    console.log(`      ➕ [createEntityDirect] 시작: ${name}`);
  }

  // 이름 유효성 검사
  const regex = /^[가-힣a-zA-Z0-9]{1,20}$/;
  if (!regex.test(name)) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`      ❌ [createEntityDirect] 유효성 검사 실패: ${name}`);
    }
    throw new Error('Entity 이름은 한글, 영문, 숫자만 가능하며 1-20자여야 합니다.');
  }

  // AI 타입 분류 (미리 분류된 type이 없을 때만)
  let entityType = preClassifiedType || 'unknown';
  if (!preClassifiedType) {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(`      🤖 [AI] 타입 분류 API 호출: ${name}`);
      }
      const response = await fetch('/api/entity/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityName: name }),
      });

      if (response.ok) {
        const result = await response.json();
        entityType = result.type;
        if (process.env.NODE_ENV === 'development') {
          console.log(`      ✅ [AI] 타입 분류 완료: ${name} → ${result.type}`);
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error(`      ⚠️ [AI] API 응답 실패: ${response.status}`);
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`      ⚠️ [AI] 타입 분류 실패 (fallback to unknown): ${name}`, error);
      }
    }
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.log(`      ℹ️ [AI] 미리 분류된 type 사용: ${name} → ${entityType}`);
    }
  }

  // 📤 Entity 생성 (type 포함)
  if (process.env.NODE_ENV === 'development') {
    console.log(`      📤 [createEntityDirect] DB INSERT 시작: ${name} (type: ${entityType})`);
  }
  const { data, error } = await supabase
    .from('entity')
    .insert({ name, user_id: userId, type: entityType })
    .select()
    .single();

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`      ❌ [createEntityDirect] DB INSERT 실패: ${name}`, error);
    }
    // 중복된 이름 처리
    if (error.code === '23505') {
      throw new Error('이미 존재하는 Entity 이름입니다.');
    }
    throw error;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`      ✅ [createEntityDirect] DB INSERT 성공: ${name}`, data.id);
  }
  return data;
}

/**
 * Memo 생성 및 Entity 연결
 */
export function useCreateMemo(userId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    { memo: Memo; entities: Entity[] },
    Error,
    {
      content: string;
      entityNames: string[];
      pendingEntityTypes?: Record<string, string>;  // 미리 분류된 types
      onAIUpdateStart?: (entityIds: string[]) => void
    }
  >({
    mutationFn: async ({ content, entityNames, pendingEntityTypes = {} }) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 [useCreateMemo] 시작', { content, entityNames, pendingEntityTypes, userId });
      }

      if (!userId) throw new Error('User not authenticated');

      // 1. Memo 생성
      const { data: memo, error: memoError } = await supabase
        .from('memo')
        .insert({ content, user_id: userId })
        .select()
        .single();

      if (memoError) {
        console.error('❌ [useCreateMemo] 메모 생성 실패', memoError);
        throw memoError;
      }

      // 2. Entity 처리 및 연결
      const entities = await Promise.all(
        entityNames.map(async (name) => {
          // 기존 entity 조회
          let entity = await getEntityByName(name, userId);

          // 없으면 생성 (미리 분류된 type 사용)
          if (!entity) {
            const preClassifiedType = pendingEntityTypes[name];
            entity = await createEntityDirect(name, userId, preClassifiedType);
            // Toast 피드백
            toast.success(`✨ 새 엔티티 '${name}'이(가) 생성되었습니다`);
          }

          return entity;
        })
      );

      // 3. memo_entity 관계 생성
      if (entities.length > 0) {
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
      }

      return { memo, entities };
    },
    onSuccess: async (result, variables) => {

      const { memo, entities } = result;

      // 정확한 쿼리만 무효화 (prefix matching 방지)
      queryClient.invalidateQueries({ queryKey: ['memos', userId], exact: true });
      queryClient.invalidateQueries({ queryKey: ['memos', 'byEntity'] }); // byEntity는 prefix로
      queryClient.invalidateQueries({ queryKey: ['entities', userId], exact: true });

      toast.success('메모가 저장되었습니다.');

      // AI 업데이트 시작 알림 (콜백이 있으면)
      if (variables.onAIUpdateStart && entities && entities.length > 0) {
        const entityIds = entities.map((e: Entity) => e.id);
        variables.onAIUpdateStart(entityIds);

        // 각 Entity에 대해 AI 업데이트 비동기 실행
        Promise.all(
          entityIds.map(async (entityId: string) => {
            try {
              await updateEntityDescription(entityId);
              // 업데이트 완료 후 엔티티 캐시 무효화 (exact로)
              queryClient.invalidateQueries({ queryKey: ['entities', userId], exact: true });
            } catch (error) {
              console.error('AI 업데이트 실패 (조용히 무시)', error);
            }
          })
        );
      }

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
  // 🔧 디버그: React Query 상태 확인
  const query = useQuery<Memo[]>({
    queryKey: ['memos', 'byEntity', entityId],
    queryFn: async () => {
      console.log('🔎🔎🔎 [useMemosByEntity] FETCH 시작!!!', {
        entityId,
        timestamp: new Date().toISOString(),
        isWindowFocused: typeof window !== 'undefined' && document.hasFocus()
      });

      if (!entityId) {
        console.log('⏭️ [useMemosByEntity] entityId 없음, 빈 배열 반환');
        return [];
      }

      try {
        console.log('🔄 [useMemosByEntity] 쿼리 시작', { entityId });

        // 🔧 FIX: join 문법 변경 - memo_entity 테이블을 명시적으로 조인
        // 기존: memo_entity!inner(entity_id) - 이게 문제일 수 있음
        // 새로운: memo_entity(entity_id) - inner는 filter에서 처리
        console.log('🔧 [useMemosByEntity] 쿼리 빌드 중...');

        const query = supabase
          .from('memo')
          .select(`
            *,
            memo_entity(entity_id)
          `)
          .eq('memo_entity.entity_id', entityId)
          .order('created_at', { ascending: false });

        console.log('📡 [useMemosByEntity] 쿼리 실행 중...');
        const { data, error } = await query;

        console.log('📥 [useMemosByEntity] 응답 받음', { hasData: !!data, hasError: !!error });

        if (error) {
          console.error('❌ [useMemosByEntity] 쿼리 에러:', error);
          throw error;
        }

        // 중복 제거 + null 필터링
        const uniqueMemos = data
          ? Array.from(
              new Map(
                data
                  .filter((memo: any) => memo.memo_entity && memo.memo_entity.length > 0) // memo_entity가 있는 것만
                  .map((memo: any) => [memo.id, memo])
              ).values()
            )
          : [];

        console.log('✅ [useMemosByEntity] 성공:', { count: uniqueMemos.length });
        return uniqueMemos;
      } catch (error: any) {
        console.error('💥 [useMemosByEntity] 실패:', error);
        throw error;
      }
    },
    enabled: !!entityId,
    staleTime: 0, // 🔧 FIX: staleTime 0으로 설정하여 항상 최신 데이터
    gcTime: 5 * 60 * 1000, // 5분간 캐시 유지
    refetchOnMount: true, // 마운트 시 refetch
    refetchOnWindowFocus: true, // 🔧 FIX: 포커스 돌아올 때 refetch (중요!)
    retry: 2, // 2번 재시도
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000), // 1초, 2초, 3초
  });

  // 🔧 디버그: React Query 상태 로깅
  console.log('📊 [useMemosByEntity] React Query 상태:', {
    entityId,
    status: query.status,
    fetchStatus: query.fetchStatus,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    dataLength: query.data?.length,
  });

  return query;
}

/**
 * 여러 Entity에 해당하는 Memo 조회
 */
export function useMemosByEntities(entityIds: string[]) {
  return useQuery<Memo[]>({
    queryKey: ['memos', 'byEntities', entityIds],
    queryFn: async () => {
      if (!entityIds || entityIds.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('memo')
        .select('*, memo_entity!inner(entity_id)')
        .in('memo_entity.entity_id', entityIds)
        .order('created_at', { ascending: true }); // 오래된 것부터 (최신이 아래)

      if (error) {
        console.error('❌ [useMemosByEntities] 쿼리 에러:', error);
        throw error;
      }

      // 중복 제거: 같은 ID를 가진 메모가 여러 번 나올 경우 제거
      const uniqueMemos = data ? Array.from(
        new Map(data.map(memo => [memo.id, memo])).values()
      ) : [];

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [useMemosByEntities] 쿼리 성공:', {
          count: uniqueMemos.length,
          originalCount: data?.length,
          hadDuplicates: data && data.length !== uniqueMemos.length,
        });
      }

      return uniqueMemos;
    },
    enabled: entityIds.length > 0,
    refetchOnMount: false, // 마운트 시 재조회 방지
    refetchOnWindowFocus: false, // 창 포커스 시 재조회 방지
  });
}

/**
 * AI를 사용하여 Entity Description 업데이트
 */
export async function updateEntityDescription(entityId: string): Promise<void> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('🤖 [updateEntityDescription] 시작', { entityId })
    }

    const response = await fetch('/api/ai/update-entity-description', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entityId }),
    })

    if (!response.ok) {
      throw new Error('AI 업데이트 실패')
    }

    const result = await response.json()
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [updateEntityDescription] 성공', result)
    }
  } catch (error) {
    console.error('❌ [updateEntityDescription] 에러', error)
    // 에러를 throw하지 않고 조용히 실패 (메모 저장은 성공했으므로)
  }
}
