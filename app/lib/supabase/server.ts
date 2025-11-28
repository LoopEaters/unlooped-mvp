import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

// Supabase URL과 Anon Key를 환경 변수에서 가져옵니다
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 서버 측(Server Components, Route Handlers)에서 사용할 Supabase Client를 생성합니다
// createServerClient는 쿠키를 통해 세션을 관리하므로 서버 환경에서 안전하게 동작합니다
export const createClient = async () => {
  const cookieStore = await cookies()

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // setAll이 Server Component에서 호출되면 무시됩니다
          // 이는 정상적인 동작입니다 (미들웨어나 Route Handler에서만 쿠키 설정 가능)
        }
      },
    },
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
