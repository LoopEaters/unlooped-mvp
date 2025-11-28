import { createClient } from '@supabase/supabase-js';

// Supabase URL과 Anon Key를 환경 변수에서 가져옵니다
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 클라이언트 측에서 사용할 Supabase Client를 생성합니다
// createClient는 싱글톤 패턴으로 동작하므로 여러 번 호출해도 같은 인스턴스를 반환합니다
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // 브라우저에 세션 저장
    autoRefreshToken: true, // 자동으로 토큰 갱신
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'unlooped-mvp',
    },
  },
});
