import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

// Supabase URL과 Anon Key를 환경 변수에서 가져옵니다
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 클라이언트 측에서 사용할 Supabase Client를 생성합니다
// createBrowserClient는 싱글톤 패턴으로 동작하므로 여러 번 호출해도 같은 인스턴스를 반환합니다
// @supabase/ssr을 사용하여 브라우저에서 쿠키 기반 세션을 올바르게 관리합니다
export const createClient = () => {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-application-name': 'unlooped-mvp',
      },
    },
  })
}

// 싱글톤 인스턴스 (기존 코드와의 호환성을 위해)
export const supabase = createClient()
