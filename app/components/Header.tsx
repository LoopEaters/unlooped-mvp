'use client'

import { useState } from 'react'
import * as Avatar from '@radix-ui/react-avatar'
import * as Popover from '@radix-ui/react-popover'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Tooltip from '@radix-ui/react-tooltip'
import { Search, Bell, Settings, User, LogOut, UserCircle, FolderOpen } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { userProfile, signOut } = useAuth()

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
    <Tooltip.Provider delayDuration={300}>
      <header className="flex items-center justify-between px-6 py-3 bg-bg-primary border-b border-border-main">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-white">Archive</span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-secondary text-white placeholder-gray-500 rounded-lg border border-border-main focus:border-gray-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            Dashboard
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            Records
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            Entities
          </a>
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-2 ml-6">
          {/* Notification with Popover */}
          <Popover.Root>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Popover.Trigger asChild>
                  <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-bg-secondary">
                    <Bell className="w-5 h-5" />
                  </button>
                </Popover.Trigger>
              </Tooltip.Trigger>
              <Tooltip.Content
                side="bottom"
                className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg z-50"
              >
                Notifications
              </Tooltip.Content>
            </Tooltip.Root>

            <Popover.Portal>
              <Popover.Content
                className="bg-bg-secondary border border-border-main rounded-lg shadow-xl p-4 w-80 z-50"
                sideOffset={5}
              >
                <div className="space-y-3">
                  <h3 className="text-white font-semibold text-sm">Notifications</h3>
                  <div className="space-y-2">
                    <div className="p-2 bg-bg-primary rounded hover:bg-gray-700 cursor-pointer transition-colors">
                      <p className="text-white text-sm">New record added to Project Phoenix</p>
                      <p className="text-gray-400 text-xs mt-1">2 hours ago</p>
                    </div>
                    <div className="p-2 bg-bg-primary rounded hover:bg-gray-700 cursor-pointer transition-colors">
                      <p className="text-white text-sm">Entity linked to record</p>
                      <p className="text-gray-400 text-xs mt-1">5 hours ago</p>
                    </div>
                  </div>
                </div>
                <Popover.Arrow className="fill-border-main" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          {/* Settings with Tooltip */}
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-bg-secondary">
                <Settings className="w-5 h-5" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Content
              side="bottom"
              className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg z-50"
            >
              Settings
            </Tooltip.Content>
          </Tooltip.Root>

          {/* Profile with Avatar and DropdownMenu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="focus:outline-none">
                <Avatar.Root className="w-9 h-9 rounded-full bg-orange-400 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-orange-500 transition-all">
                  <Avatar.Image
                    src={userProfile?.profile?.avatar_url || undefined}
                    alt={getDisplayName()} //todo: 이거 로직 많이 수정해야함. 사용성이 별로임. 
                    className="w-full h-full object-cover"
                  />
                  <Avatar.Fallback className="w-full h-full flex items-center justify-center bg-orange-400 text-white font-medium">
                    {getInitials()}
                  </Avatar.Fallback>
                </Avatar.Root>
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="bg-bg-secondary border border-border-main rounded-lg shadow-xl p-1 w-56 z-50"
                sideOffset={5}
              >
                {/* 사용자 정보 표시 */}
                <div className="px-3 py-2 mb-1">
                  <p className="text-sm font-medium text-white">{getDisplayName()}</p>
                  <p className="text-xs text-gray-400 truncate">{userProfile?.email}</p>
                </div>

                <DropdownMenu.Separator className="h-px bg-border-main my-1" />

                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-bg-primary rounded cursor-pointer outline-none">
                  <UserCircle className="w-4 h-4" />
                  <span>Profile</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-bg-primary rounded cursor-pointer outline-none">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-border-main my-1" />
                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-bg-primary rounded cursor-pointer outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  onSelect={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>
    </Tooltip.Provider>
  )
}
