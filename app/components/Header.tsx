'use client'

import { useState } from 'react'
import * as Avatar from '@radix-ui/react-avatar'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Settings, LogOut, UserCircle, User, Keyboard, HelpCircle } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'

export default function Header() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { userProfile, signOut, isLoading } = useAuth()

  // 사용자 이름 첫 글자 (아바타용)
  const getInitials = () => {
    if (userProfile?.profile?.username) {
      return userProfile.profile.username.charAt(0).toUpperCase()
    }
    if (userProfile?.email) {
      return userProfile.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  // 표시할 사용자 이름
  const getDisplayName = () => {
    if (userProfile?.profile?.username) {
      return userProfile.profile.username
    }
    if (userProfile?.email) {
      return userProfile.email.split('@')[0]
    }
    return 'User'
  }

  const handleLogout = async () => {
    if (isLoggingOut) return // 중복 클릭 방지

    setIsLoggingOut(true)
    try {
      await signOut()
      // signOut 성공 시 router.push('/') 로 홈으로 이동하고 router.refresh()로 서버 컴포넌트 새로고침
    } catch (error) {
      console.error('Logout error:', error)
      alert('로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.')
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl text-gray-900 font-light" style={{ fontFamily: 'var(--font-sweet)' }}>
          Unlooped
        </h1>

        {/* 우측 유저 메뉴 또는 로그인 버튼 */}
        {userProfile ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="focus:outline-none">
                {isLoading ? (
                  <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
                ) : (
                  <Avatar.Root className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center overflow-hidden transition-colors">
                    <Avatar.Image
                      src={userProfile?.profile?.avatar_url || undefined}
                      alt={getDisplayName()}
                      className="w-full h-full object-cover"
                    />
                    <Avatar.Fallback className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-600">
                      <User className="w-6 h-6" />
                    </Avatar.Fallback>
                  </Avatar.Root>
                )}
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="bg-white border border-gray-200 rounded-lg shadow-xl p-1 w-56 z-50"
                sideOffset={5}
              >
                <div className="px-3 py-2 mb-1">
                  <p className="text-sm font-medium text-gray-900">{getDisplayName()}</p>
                  <p className="text-xs text-gray-500 truncate">{userProfile?.email}</p>
                </div>

                <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />

                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer outline-none">
                  <UserCircle className="w-4 h-4" />
                  <span>My Profile</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer outline-none">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer outline-none">
                  <Keyboard className="w-4 h-4" />
                  <span>Keyboard Shortcuts</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer outline-none">
                  <HelpCircle className="w-4 h-4" />
                  <span>Help</span>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-100 rounded cursor-pointer outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  onSelect={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        ) : (
          <button
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="로그인"
          >
            <User className="w-6 h-6 text-gray-600" />
          </button>
        )}
      </div>
    </header>
  )
}
