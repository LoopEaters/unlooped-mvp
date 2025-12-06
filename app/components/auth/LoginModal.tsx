'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from '@/app/providers/AuthProvider';
import { useTheme } from '@/app/providers/ThemeProvider';
import { isProduction } from '@/app/lib/util';

export default function LoginModal() {
  const {
    showLoginModal,
    setShowLoginModal,
    signIn,
    signUp,
    signInWithGoogle,
    session,
  } = useAuth();
  const { theme } = useTheme();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        alert('회원가입 성공! 이메일을 확인해주세요.');
      } else {
        await signIn(email, password);
      }
      // 성공 시 폼 초기화
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || '소셜 로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  return (
    <Dialog.Root
      open={showLoginModal}
      onOpenChange={(open) => {
        // 로그인 안 되어 있으면 모달을 닫을 수 없음
        if (!session) {
          return;
        };
        setShowLoginModal(open);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-50"
          onEscapeKeyDown={(e) => {
            // 로그인 안 되어 있으면 ESC로 닫기 방지
            if (!session && isProduction()) {
              e.preventDefault();
            }
          }}
          onPointerDownOutside={(e) => {
            // 로그인 안 되어 있으면 외부 클릭으로 닫기 방지
            if (!session && isProduction()) {
              e.preventDefault();
            }
          }}
        >
          <Dialog.Title className="text-2xl font-bold mb-2">
            {isSignUp ? '회원가입' : '로그인'}
          </Dialog.Title>
          <Dialog.Description className="text-gray-600 mb-6">
            {isSignUp
              ? 'Unlooped에 가입하고 시작하세요.'
              : 'Unlooped에 로그인하세요.'}
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className="p-3 rounded-md text-sm"
                style={{
                  backgroundColor: theme.ui.error.bg,
                  color: theme.ui.error.text,
                }}
              >
                {error}
              </div>
            )}

            {/* 소셜 로그인 버튼 */}
            <div>
              <button
                type="button"
                onClick={handleSocialLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google로 계속하기
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  또는 이메일로 계속하기
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
              {isSignUp && (
                <p className="text-xs text-gray-500 mt-1">
                  최소 6자 이상 입력해주세요.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 rounded-md disabled:cursor-not-allowed transition-colors"
              style={{
                backgroundColor: isLoading ? '#9CA3AF' : theme.ui.interactive.primaryBg,
                color: '#ffffff',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = theme.ui.interactive.primaryBgHover
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = theme.ui.interactive.primaryBg
                }
              }}
            >
              {isLoading
                ? '처리 중...'
                : isSignUp
                  ? '회원가입'
                  : '로그인'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="text-sm hover:underline"
                style={{ color: theme.ui.interactive.primaryText }}
              >
                {isSignUp
                  ? '이미 계정이 있으신가요? 로그인'
                  : '계정이 없으신가요? 회원가입'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
