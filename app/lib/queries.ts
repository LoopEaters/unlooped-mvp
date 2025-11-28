import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

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
      return user;
    },
  });
}

// 예시: 특정 테이블에서 데이터 가져오기
// 사용 예: const { data, isLoading } = useTableData('your_table_name');
export function useTableData<T = any>(tableName: string) {
  return useQuery({
    queryKey: [tableName],
    queryFn: async () => {
      const { data, error } = await supabase.from(tableName).select('*');
      if (error) throw error;
      return data as T[];
    },
  });
}

// 예시: 데이터 추가 Mutation
export function useInsertData<T = any>(tableName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newData: Partial<T>) => {
      const { data, error } = await supabase.from(tableName).insert(newData).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // 데이터 추가 성공 시 해당 테이블의 캐시를 무효화하여 자동으로 다시 fetch
      queryClient.invalidateQueries({ queryKey: [tableName] });
    },
  });
}

// 예시: 데이터 업데이트 Mutation
export function useUpdateData<T = any>(tableName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string | number; updates: Partial<T> }) => {
      const { data, error } = await supabase.from(tableName).update(updates).eq('id', id).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
    },
  });
}

// 예시: 데이터 삭제 Mutation
export function useDeleteData(tableName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
    },
  });
}
