'use client'

import { useAuth } from '@/app/providers/AuthProvider'
import { useEntities } from '@/app/lib/queries'

/**
 * 앱의 전체 준비 상태를 관리하는 커스텀 훅
 *
 * 로딩 완료 조건:
 * 1. 인증 상태 확인 완료 (user)
 * 2. 필수 데이터(entities) 로딩 완료
 *
 * @returns isReady - 앱이 사용 가능한 상태인지 여부
 * @returns isAuthLoading - 인증 상태 확인 중
 * @returns isEntitiesLoading - Entity 데이터 로딩 중
 */
export function useAppReady() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const { isLoading: isEntitiesLoading } = useEntities(user?.id)

  // 개발 모드에서 로딩 상태 추적
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [useAppReady]', {
      isAuthLoading,
      isEntitiesLoading,
      hasUser: !!user,
      isReady: !isAuthLoading && !isEntitiesLoading,
    })
  }

  return {
    isReady: !isAuthLoading && !isEntitiesLoading,
    isAuthLoading,
    isEntitiesLoading,
    user,
  }
}
