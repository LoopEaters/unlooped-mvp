'use client';

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/app/lib/supabase/client';
import { Tables } from '@/types/supabase';
import { signOutAction } from '@/app/lib/actions/auth';

// Supabase Auth User + users 테이블 정보 합친 타입
export type UserProfile = User & {
  profile: Tables<'users'> | null;
};

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // users 테이블에서 프로필 정보 가져오기 (없으면 자동 생성)
  const fetchUserProfile = async (authUser: User) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('👤 [fetchUserProfile] 시작', authUser.id);
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (process.env.NODE_ENV === 'development') {
      console.log('👤 [fetchUserProfile] 조회 완료', { hasData: !!data, error: error?.code });
    }

    // users 테이블에 row가 없으면 자동으로 생성
    if (error && error.code === 'PGRST116') {
      if (process.env.NODE_ENV === 'development') {
        console.log('👤 [fetchUserProfile] 새 프로필 생성 중...');
      }

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          email: authUser.email!,
          username: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
        })
        .select()
        .single();

      if (insertError) {
        console.error('👤 [fetchUserProfile] 생성 실패:', insertError);
        return null;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('👤 [fetchUserProfile] 생성 완료');
      }
      return newUser;
    }

    if (error) {
      console.error('👤 [fetchUserProfile] 조회 에러:', error);
      return null;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('👤 [fetchUserProfile] 완료');
    }
    return data;
  };

  // 소셜 로그인 프로필 사진 자동 저장
  // 반환값: 업데이트된 avatar_url (업데이트가 없으면 null)
  const syncSocialAvatar = async (authUser: User, profile: Tables<'users'> | null): Promise<string | null> => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🖼️ [syncSocialAvatar] 시작', {
        hasProfile: !!profile,
        hasAvatarUrl: !!profile?.avatar_url,
        hasSocialAvatar: !!authUser.user_metadata?.avatar_url
      });
    }

    // 소셜 로그인에서 제공하는 프로필 사진 URL
    const socialAvatarUrl = authUser.user_metadata?.avatar_url;

    // 이미 avatar_url이 있으면 패스
    if (profile?.avatar_url || !socialAvatarUrl) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🖼️ [syncSocialAvatar] 스킵 (이미 있거나 소셜 아바타 없음)');
      }
      return null;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('🖼️ [syncSocialAvatar] 업데이트 중...');
    }

    // users 테이블에 소셜 프로필 사진 저장
    await supabase
      .from('users')
      .update({ avatar_url: socialAvatarUrl })
      .eq('id', authUser.id);

    if (process.env.NODE_ENV === 'development') {
      console.log('🖼️ [syncSocialAvatar] 완료');
    }

    // 업데이트된 avatar_url 반환
    return socialAvatarUrl;
  };

  // 🔧 NEW: 세션 처리 로직을 분리하여 재사용
  const handleSessionChange = useCallback(async (session: Session | null) => {
    // 모든 데이터를 먼저 준비한 후 한 번에 업데이트 (렌더링 최소화)
    const newUser = session?.user ?? null;
    let newProfile: UserProfile | null = null;
    let shouldShowModal = !session;

    // users 테이블에서 프로필 정보 가져오기
    if (session?.user) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 [AuthProvider] 프로필 처리 시작');
      }
      let profile = await fetchUserProfile(session.user);

      // 🔧 FIX: avatar sync를 백그라운드로 처리 (blocking 하지 않음)
      // 프로필 로드를 기다리지 않고 UI를 먼저 표시
      syncSocialAvatar(session.user, profile).then((updatedAvatarUrl) => {
        if (updatedAvatarUrl && profile) {
          // 아바타가 업데이트되면 상태만 다시 업데이트
          setUserProfile({
            ...session.user,
            profile: { ...profile, avatar_url: updatedAvatarUrl },
          });
        }
      });

      newProfile = {
        ...session.user,
        profile,
      };
    }

    // 한 번에 모든 상태 업데이트 (React 18이 자동으로 배칭)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 [AuthProvider] 상태 일괄 업데이트');
    }
    setSession(session);
    setUser(newUser);
    setUserProfile(newProfile);
    setIsLoading(false);
    setShowLoginModal(shouldShowModal);
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 [AuthProvider] useEffect 시작');
    }

    // 🔧 FIX: 초기 세션을 즉시 로드 (LCP 개선)
    let isInitialLoad = true;

    // 즉시 현재 세션 가져오기 (onAuthStateChange보다 빠름)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('⚡ [AuthProvider] 초기 세션 즉시 로드', {
          hasSession: !!session,
          userId: session?.user?.id,
        });
      }

      if (isInitialLoad) {
        handleSessionChange(session).finally(() => {
          isInitialLoad = false;
        });
      }
    });

    // 인증 상태 변경 리스너 등록
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 [AuthProvider] onAuthStateChange 트리거', {
          event,
          hasSession: !!session,
          userId: session?.user?.id,
          isInitialLoad,
        });
      }

      // 초기 로드는 getSession()으로 처리했으므로 중복 호출 방지
      if (isInitialLoad && event === 'INITIAL_SESSION') {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 [AuthProvider] 초기 세션 중복 처리 방지');
        }
        return;
      }

      await handleSessionChange(session);
    });

    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 [AuthProvider] cleanup - unsubscribe');
      }
      subscription.unsubscribe();
    };
  }, [handleSessionChange]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw error;
    }
  }, []);

  const signInWithGithub = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    // Server Action으로 서버 쿠키 삭제 + 캐시 무효화
    const result = await signOutAction();

    if (result.error) {
      throw new Error(result.error);
    }

    // 클라이언트 signOut으로 onAuthStateChange 트리거 (UI 상태 업데이트)
    await supabase.auth.signOut();

    // 홈으로 이동 (revalidatePath로 캐시가 무효화되어 최신 서버 데이터 자동 fetch)
    router.push('/');
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      userProfile,
      session,
      isLoading,
      signIn,
      signUp,
      signInWithGoogle,
      signInWithGithub,
      signOut,
      showLoginModal,
      setShowLoginModal,
    }),
    [
      user,
      userProfile,
      session,
      isLoading,
      signIn,
      signUp,
      signInWithGoogle,
      signInWithGithub,
      signOut,
      showLoginModal,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
