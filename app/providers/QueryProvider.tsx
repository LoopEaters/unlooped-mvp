'use client'

import {
  QueryClient,
  QueryClientProvider,
  MutationCache,
  QueryCache,
} from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

/**
 * 전역 에러 핸들러
 * React Query의 에러를 받아서 사용자에게 토스트 메시지로 표시
 */
function handleError(error: Error) {
  console.error('Query Error:', error)

  // 에러 메시지 매핑
  let message = '알 수 없는 오류가 발생했습니다.'

  if (error.message.includes('fetch')) {
    message = '네트워크 연결을 확인해주세요.'
  } else if (error.message.includes('auth')) {
    message = '로그인이 필요합니다.'
  } else if (error.message.includes('permission')) {
    message = '접근 권한이 없습니다.'
  } else if (error.message) {
    message = error.message
  }

  toast.error(message, {
    duration: 5000,
  })
}

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: handleError,
        }),
        mutationCache: new MutationCache({
          onError: handleError,
        }),
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1분
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
