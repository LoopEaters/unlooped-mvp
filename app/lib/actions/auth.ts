'use server'

import { createClient } from '@/app/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * 서버에서 로그아웃을 처리하는 Server Action
 * 서버 쿠키를 제대로 삭제합니다
 */
export async function signOutAction() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Sign out error:', error)
    return { error: error.message }
  }

  // 캐시 무효화
  revalidatePath('/', 'layout')
  
  return { success: true }
}

