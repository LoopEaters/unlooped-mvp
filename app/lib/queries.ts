import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/app/lib/supabase/client';
import type { Database } from '@/types/supabase';

// 테이블 이름 타입 추출
type TableName = keyof Database['public']['Tables'];

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
