import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/app/lib/supabase/client';
import type { Database } from '@/types/supabase';
import { toast } from 'sonner';
import { isValidEntityName } from '@/app/lib/utils/entityValidation';

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
    { entityId: string; type: 'person' | 'project' | 'event' | 'unknown'; userId: string },
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
      if (!isValidEntityName(name)) {
        throw new Error('Entity 이름은 한글, 영문, 숫자, "-", "_"만 가능하며 1-20자여야 합니다.');
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
  if (!isValidEntityName(name)) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`      ❌ [createEntityDirect] 유효성 검사 실패: ${name}`);
    }
    throw new Error('Entity 이름은 한글, 영문, 숫자, "-", "_"만 가능하며 1-20자여야 합니다.');
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
 * Memo 업데이트 + Entity 관계 동기화
 */
export function useUpdateMemo(userId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    { memo: Memo; addedEntities: Entity[]; removedEntityIds: string[]; orphanedEntityIds: string[] },
    Error,
    {
      memoId: string;
      content: string;
      entityNames: string[];
      originalEntityIds: string[];
      pendingEntityTypes?: Record<string, string>;
    }
  >({
    mutationFn: async ({
      memoId,
      content,
      entityNames,
      originalEntityIds,
      pendingEntityTypes = {},
    }) => {
      if (!userId) throw new Error('User not authenticated');

      // 1. Update memo content
      const { data: memo, error: memoError } = await supabase
        .from('memo')
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', memoId)
        .select()
        .single();

      if (memoError) throw memoError;

      // 2. Get or create entities (reuse existing logic)
      const entities = await Promise.all(
        entityNames.map(async (name) => {
          let entity = await getEntityByName(name, userId);

          if (!entity) {
            const preClassifiedType = pendingEntityTypes[name];
            entity = await createEntityDirect(name, userId, preClassifiedType);
            toast.success(`✨ 새 엔티티 '${name}'이(가) 생성되었습니다`);
          }

          return entity;
        })
      );

      const newEntityIds = entities.map((e) => e.id);

      // 3. Calculate changes
      const originalSet = new Set(originalEntityIds);
      const newSet = new Set(newEntityIds);

      const toAdd = newEntityIds.filter((id) => !originalSet.has(id));
      const toRemove = originalEntityIds.filter((id) => !newSet.has(id));

      // Track orphaned entities
      let orphanedEntityIds: string[] = [];

      // 4. Delete removed relationships
      if (toRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from('memo_entity')
          .delete()
          .eq('memo_id', memoId)
          .in('entity_id', toRemove);

        if (deleteError) throw deleteError;

        // 4.1. Check for orphaned entities and delete them
        for (const entityId of toRemove) {
          const { count, error: countError } = await supabase
            .from('memo_entity')
            .select('*', { count: 'exact', head: true })
            .eq('entity_id', entityId);

          if (countError) throw countError;

          // If no other memo uses this entity, it's orphaned
          if (count === 0) {
            orphanedEntityIds.push(entityId);
          }
        }

        // Delete orphaned entities
        if (orphanedEntityIds.length > 0) {
          const { error: deleteEntityError } = await supabase
            .from('entity')
            .delete()
            .in('id', orphanedEntityIds);

          if (deleteEntityError) throw deleteEntityError;

          if (process.env.NODE_ENV === 'development') {
            console.log('🗑️ [useUpdateMemo] 고아 Entity 삭제:', orphanedEntityIds);
          }
        }
      }

      // 5. Add new relationships
      if (toAdd.length > 0) {
        const inserts: MemoEntityInsert[] = toAdd.map((entityId) => ({
          memo_id: memoId,
          entity_id: entityId,
        }));

        const { error: insertError } = await supabase
          .from('memo_entity')
          .insert(inserts);

        if (insertError) throw insertError;
      }

      return {
        memo,
        addedEntities: entities.filter((e) => toAdd.includes(e.id)),
        removedEntityIds: toRemove,
        orphanedEntityIds,
      };
    },
    onSuccess: (result) => {
      // Invalidate queries (same pattern as useCreateMemo)
      queryClient.invalidateQueries({ queryKey: ['memos', userId], exact: true });
      queryClient.invalidateQueries({ queryKey: ['memos', 'byEntity'] });
      queryClient.invalidateQueries({ queryKey: ['entities', userId], exact: true });

      // Show appropriate success message
      if (result.orphanedEntityIds.length > 0) {
        toast.success(
          `메모가 수정되고 ${result.orphanedEntityIds.length}개의 엔티티가 삭제되었습니다.`
        );
      } else {
        toast.success('메모가 수정되었습니다.');
      }

      // Optional: Trigger AI updates for added entities
      if (result.addedEntities.length > 0) {
        result.addedEntities.forEach((entity) => {
          updateEntityDescription(entity.id).catch((err) =>
            console.error('AI 업데이트 실패', err)
          );
        });
      }
    },
    onError: (error) => {
      console.error('❌ [useUpdateMemo] 에러 발생', error);
      toast.error(`메모 수정 실패: ${error.message}`);
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
    refetchOnWindowFocus: false, // 포커스 돌아올 때 refetch 하지 않음 (캐시 활용)
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
 * Memo 삭제 + 고아(orphaned) Entity 자동 삭제
 * - 메모와 연결된 entity가 다른 메모에서 사용되지 않으면 함께 삭제
 */
export function useDeleteMemoWithOrphanedEntities(userId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    { deletedMemoId: string; deletedEntityIds: string[] },
    Error,
    string
  >({
    mutationFn: async (memoId: string) => {
      if (!userId) throw new Error('User not authenticated');

      // 1. 메모와 연결된 entity ID들 가져오기
      const { data: memoEntities, error: fetchError } = await supabase
        .from('memo_entity')
        .select('entity_id')
        .eq('memo_id', memoId);

      if (fetchError) throw fetchError;

      const entityIds = memoEntities?.map((me) => me.entity_id) || [];

      // 2. 각 entity가 다른 메모에서도 쓰이는지 확인
      const orphanedEntityIds: string[] = [];

      for (const entityId of entityIds) {
        const { count, error: countError } = await supabase
          .from('memo_entity')
          .select('*', { count: 'exact', head: true })
          .eq('entity_id', entityId);

        if (countError) throw countError;

        // 이 entity를 사용하는 메모가 1개 (현재 메모)뿐이면 고아
        if (count === 1) {
          orphanedEntityIds.push(entityId);
        }
      }

      // 3. 고아 entity들 삭제
      if (orphanedEntityIds.length > 0) {
        const { error: deleteEntityError } = await supabase
          .from('entity')
          .delete()
          .in('id', orphanedEntityIds);

        if (deleteEntityError) throw deleteEntityError;

        if (process.env.NODE_ENV === 'development') {
          console.log('🗑️ [고아 Entity 삭제]', orphanedEntityIds);
        }
      }

      // 4. 메모 삭제 (memo_entity는 CASCADE로 자동 삭제됨)
      const { error: deleteMemoError } = await supabase
        .from('memo')
        .delete()
        .eq('id', memoId);

      if (deleteMemoError) throw deleteMemoError;

      return {
        deletedMemoId: memoId,
        deletedEntityIds: orphanedEntityIds,
      };
    },
    onSuccess: (result) => {
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['memos', userId], exact: true });
      queryClient.invalidateQueries({ queryKey: ['memos', 'byEntity'] });
      queryClient.invalidateQueries({ queryKey: ['entities', userId], exact: true });

      if (result.deletedEntityIds.length > 0) {
        toast.success(
          `메모와 함께 ${result.deletedEntityIds.length}개의 엔티티가 삭제되었습니다.`
        );
      } else {
        toast.success('메모가 삭제되었습니다.');
      }
    },
    onError: (error) => {
      console.error('❌ [useDeleteMemoWithOrphanedEntities] 에러 발생', error);
      toast.error(`삭제 실패: ${error.message}`);
    },
  });
}

/**
 * Entity 삭제 + 연결된 메모에서 @멘션 제거
 * - entity가 멘션된 모든 메모에서 "@entityName" → "entityName"으로 변경
 * - memo_entity 관계 삭제
 * - entity 삭제
 */
export function useDeleteEntityWithMemoUpdate(userId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    { deletedEntityId: string; updatedMemoCount: number },
    Error,
    { entityId: string; entityName: string }
  >({
    mutationFn: async ({ entityId, entityName }) => {
      if (!userId) throw new Error('User not authenticated');

      // 1. 이 entity와 연결된 모든 메모 조회
      const { data: memoEntities, error: fetchError } = await supabase
        .from('memo_entity')
        .select('memo_id')
        .eq('entity_id', entityId);

      if (fetchError) throw fetchError;

      const memoIds = memoEntities?.map((me) => me.memo_id) || [];

      // 2. 각 메모에서 @entityName → entityName으로 교체
      let updatedCount = 0;

      if (memoIds.length > 0) {
        const { data: memos, error: memosError } = await supabase
          .from('memo')
          .select('id, content')
          .in('id', memoIds);

        if (memosError) throw memosError;

        // 각 메모 업데이트
        for (const memo of memos || []) {
          const updatedContent = memo.content.replace(
            new RegExp(`@${entityName}`, 'g'),
            entityName
          );

          // 실제로 변경된 경우에만 업데이트
          if (updatedContent !== memo.content) {
            const { error: updateError } = await supabase
              .from('memo')
              .update({ content: updatedContent })
              .eq('id', memo.id);

            if (updateError) throw updateError;
            updatedCount++;
          }
        }
      }

      // 3. memo_entity 관계 삭제
      if (memoIds.length > 0) {
        const { error: deleteRelError } = await supabase
          .from('memo_entity')
          .delete()
          .eq('entity_id', entityId);

        if (deleteRelError) throw deleteRelError;
      }

      // 4. entity 삭제
      const { error: deleteEntityError } = await supabase
        .from('entity')
        .delete()
        .eq('id', entityId);

      if (deleteEntityError) throw deleteEntityError;

      return {
        deletedEntityId: entityId,
        updatedMemoCount: updatedCount,
      };
    },
    onSuccess: (result) => {
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['memos', userId], exact: true });
      queryClient.invalidateQueries({ queryKey: ['memos', 'byEntity'] });
      queryClient.invalidateQueries({ queryKey: ['entities', userId], exact: true });

      if (result.updatedMemoCount > 0) {
        toast.success(
          `엔티티가 삭제되고 ${result.updatedMemoCount}개의 메모에서 @ 멘션이 제거되었습니다.`
        );
      } else {
        toast.success('엔티티가 삭제되었습니다.');
      }
    },
    onError: (error) => {
      console.error('❌ [useDeleteEntityWithMemoUpdate] 에러 발생', error);
      toast.error(`삭제 실패: ${error.message}`);
    },
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

// ==================== Timeline API ====================

/**
 * 타임라인 렌더링용 데이터 조회
 * - 모든 Entity와 Memo를 가져오고
 * - 각 Memo가 어떤 Entity들과 연결되어 있는지 포함
 */
export function useTimelineData(userId?: string) {
  return useQuery({
    queryKey: ['timeline', userId],
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

      // 1. Entity 조회
      const { data: entities, error: entitiesError } = await supabase
        .from('entity')
        .select('*')
        .eq('user_id', currentUserId)
        .order('name', { ascending: true });

      if (entitiesError) throw entitiesError;

      // 2. Memo 조회 (memo_entity 관계 포함)
      const { data: memosRaw, error: memosError } = await supabase
        .from('memo')
        .select(`
          *,
          memo_entity(entity_id)
        `)
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: true });

      if (memosError) throw memosError;

      // 3. Memo 데이터 가공 (entity_id 배열로 변환)
      const memos = (memosRaw || []).map((memo: any) => ({
        ...memo,
        entityIds: (memo.memo_entity || []).map((me: any) => me.entity_id),
      }));

      return {
        entities: entities || [],
        memos,
      };
    },
    staleTime: 3 * 60 * 1000, // 3분
    enabled: !!userId,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

// ==================== Search API ====================

/**
 * Entity 검색 (name, description, summary)
 * 최소 2자 이상 입력 시 검색 수행
 */
export function useSearchEntities(query: string, userId: string) {
  return useQuery<Entity[]>({
    queryKey: ['search', 'entities', userId, query],
    queryFn: async () => {
      if (!query || query.length < 2) {
        return [];
      }

      const searchPattern = `%${query}%`;

      const { data, error } = await supabase
        .from('entity')
        .select('*')
        .eq('user_id', userId)
        .or(`name.ilike.${searchPattern},description.ilike.${searchPattern},summary.ilike.${searchPattern}`)
        .order('name', { ascending: true })
        .limit(5);

      if (error) {
        console.error('❌ [useSearchEntities] 쿼리 에러:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!userId && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2분
  });
}

/**
 * Memo 검색 (content)
 * 최소 2자 이상 입력 시 검색 수행
 */
export function useSearchMemos(query: string, userId: string) {
  return useQuery<Memo[]>({
    queryKey: ['search', 'memos', userId, query],
    queryFn: async () => {
      if (!query || query.length < 2) {
        return [];
      }

      const { data, error } = await supabase
        .from('memo')
        .select('*')
        .eq('user_id', userId)
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('❌ [useSearchMemos] 쿼리 에러:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!userId && query.length >= 2,
    staleTime: 1 * 60 * 1000, // 1분
  });
}
