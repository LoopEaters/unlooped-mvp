'use client';

import { createContext, useContext, useEffect, useState } from 'react';
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
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    // users 테이블에 row가 없으면 자동으로 생성
    if (error && error.code === 'PGRST116') {
      console.log('Creating new user profile...');

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
        console.error('Error creating user profile:', insertError);
        return null;
      }

      return newUser;
    }

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  };

  // 소셜 로그인 프로필 사진 자동 저장
  const syncSocialAvatar = async (authUser: User, profile: Tables<'users'> | null) => {
    // 소셜 로그인에서 제공하는 프로필 사진 URL
    const socialAvatarUrl = authUser.user_metadata?.avatar_url;

    // 이미 avatar_url이 있으면 패스
    if (profile?.avatar_url || !socialAvatarUrl) {
      return;
    }

    // users 테이블에 소셜 프로필 사진 저장
    await supabase
      .from('users')
      .update({ avatar_url: socialAvatarUrl })
      .eq('id', authUser.id);
  };

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      // users 테이블에서 프로필 정보 가져오기
      if (session?.user) {
        const profile = await fetchUserProfile(session.user);

        // 소셜 로그인 프로필 사진 자동 저장
        await syncSocialAvatar(session.user, profile);

        // 프로필 사진 동기화 후 다시 가져오기
        const updatedProfile = await fetchUserProfile(session.user);

        setUserProfile({
          ...session.user,
          profile: updatedProfile,
        });
      } else {
        setUserProfile(null);
      }

      setIsLoading(false);

      // 세션이 없으면 로그인 모달 표시
      if (!session) {
        setShowLoginModal(true);
      }
    });

    // 인증 상태 변경 리스너 등록
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // users 테이블에서 프로필 정보 가져오기
      if (session?.user) {
        const profile = await fetchUserProfile(session.user);

        // 소셜 로그인 프로필 사진 자동 저장
        await syncSocialAvatar(session.user, profile);

        // 프로필 사진 동기화 후 다시 가져오기
        const updatedProfile = await fetchUserProfile(session.user);

        setUserProfile({
          ...session.user,
          profile: updatedProfile,
        });
      } else {
        setUserProfile(null);
      }

      setIsLoading(false);

      // 로그인 성공 시 모달 닫기
      if (session) {
        setShowLoginModal(false);
      } else {
        // 로그아웃 시 모달 열기
        setShowLoginModal(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw error;
    }
  };

  const signInWithGithub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    // Server Action으로 서버 쿠키 삭제 + 캐시 무효화
    const result = await signOutAction();
    
    if (result.error) {
      throw new Error(result.error);
    }

    // 클라이언트 signOut으로 onAuthStateChange 트리거 (UI 상태 업데이트)
    await supabase.auth.signOut();

    // 홈으로 이동 (revalidatePath로 캐시가 무효화되어 최신 서버 데이터 자동 fetch)
    router.push('/');
  };

  const value = {
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
