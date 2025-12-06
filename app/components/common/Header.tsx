'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import * as Avatar from '@radix-ui/react-avatar'
import * as Popover from '@radix-ui/react-popover'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Tooltip from '@radix-ui/react-tooltip'
import { Search, Bell, Settings, LogOut, UserCircle, User, Keyboard, HelpCircle, Palette } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { useEntityFilter } from '@/app/providers/EntityFilterProvider'
import { useSearchEntities, useSearchMemos } from '@/app/lib/queries'
import { useTheme } from '@/app/providers/ThemeProvider'
import SearchResults from './SearchResults'
import SettingsDrawer from './SettingsDrawer'
import ProfileDrawer from './ProfileDrawer'
import type { Database } from '@/types/supabase'

type Entity = Database['public']['Tables']['entity']['Row']
type Memo = Database['public']['Tables']['memo']['Row']

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { userProfile, signOut, isLoading, setShowOnboarding } = useAuth()
  const { setFilteredEntityIds, setHighlightedMemoId } = useEntityFilter()
  const { theme, themeName, toggleTheme } = useTheme()

  // 디바운싱: 300ms 후에 debouncedQuery 업데이트
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)

    return () => clearTimeout(handler)
  }, [searchQuery])

  // Popover 열림 상태 관리
  useEffect(() => {
    setIsSearchOpen(debouncedQuery.length >= 2)
  }, [debouncedQuery])

  // 검색 훅
  const userId = userProfile?.id || ''
  const { data: entities = [], isLoading: entitiesLoading } = useSearchEntities(debouncedQuery, userId)
  const { data: memos = [], isLoading: memosLoading } = useSearchMemos(debouncedQuery, userId)

  const isSearchLoading = entitiesLoading || memosLoading

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

  // 검색 결과 선택 핸들러
  const handleSelectEntity = (entity: Entity) => {
    // Entity 검색: URL 파라미터로 홈페이지로 이동
    router.push(`/?entity=${entity.id}`)
    setIsSearchOpen(false)
    setSearchQuery('') // 검색어 초기화
  }

  const handleSelectMemo = (memo: Memo) => {
    // Memo 검색: URL 파라미터로 홈페이지로 이동
    router.push(`/?memo=${memo.id}`)
    setIsSearchOpen(false)
    setSearchQuery('') // 검색어 초기화
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
      <header
        className="flex items-center justify-between pr-6 pl-3 py-3 border-b"
        style={{
          backgroundColor: theme.ui.primaryBg,
          borderColor: theme.ui.border,
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <Image
            src="/logo.png"
            alt="Unlooped Logo"
            width={64}
            height={64}
            className="rounded -my-3"
          />
          <h1 className="text-xl text-white font-light" style={{ fontFamily: 'var(--font-sweet)' }}>
            Unlooped
          </h1>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-md mx-8">
          <Popover.Root open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <Popover.Trigger asChild>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: theme.ui.gray[400] }} />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none transition-colors"
                  style={{
                    backgroundColor: theme.ui.secondaryBg,
                    color: '#ffffff',
                    borderColor: theme.ui.border,
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = theme.ui.gray[500])}
                  onBlur={(e) => (e.currentTarget.style.borderColor = theme.ui.border)}
                />
              </div>
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Content
                className="rounded-lg shadow-xl w-[var(--radix-popover-trigger-width)] z-50 border"
                style={{
                  backgroundColor: theme.ui.secondaryBg,
                  borderColor: theme.ui.border,
                }}
                sideOffset={5}
                onOpenAutoFocus={(e) => e.preventDefault()} // 포커스를 Popover로 이동하지 않음
              >
                <SearchResults
                  entities={entities}
                  memos={memos}
                  isLoading={isSearchLoading}
                  query={debouncedQuery}
                  onSelectEntity={handleSelectEntity}
                  onSelectMemo={handleSelectMemo}
                  onClose={() => setIsSearchOpen(false)}
                />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-6 ml-auto">
          <a
            href="/"
            className={`transition-colors ${
              pathname === '/' ? 'cursor-default pointer-events-none' : ''
            }`}
            style={{
              color: pathname === '/' ? '#ffffff' : theme.ui.textMuted,
            }}
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault()
              }
            }}
            onMouseEnter={(e) => {
              if (pathname !== '/') e.currentTarget.style.color = '#ffffff'
            }}
            onMouseLeave={(e) => {
              if (pathname !== '/') e.currentTarget.style.color = theme.ui.textMuted
            }}
          >
            Records
          </a>
          <a
            href="/entities"
            className={`transition-colors ${
              pathname === '/entities' ? 'cursor-default pointer-events-none' : ''
            }`}
            style={{
              color: pathname === '/entities' ? '#ffffff' : theme.ui.textMuted,
            }}
            onClick={(e) => {
              if (pathname === '/entities') {
                e.preventDefault()
              }
            }}
            onMouseEnter={(e) => {
              if (pathname !== '/entities') e.currentTarget.style.color = '#ffffff'
            }}
            onMouseLeave={(e) => {
              if (pathname !== '/entities') e.currentTarget.style.color = theme.ui.textMuted
            }}
          >
            Entities
          </a>
          <a
            href="/import"
            className={`transition-colors ${
              pathname === '/import' ? 'cursor-default pointer-events-none' : ''
            }`}
            style={{
              color: pathname === '/import' ? '#ffffff' : theme.ui.textMuted,
            }}
            onClick={(e) => {
              if (pathname === '/import') {
                e.preventDefault()
              }
            }}
            onMouseEnter={(e) => {
              if (pathname !== '/import') e.currentTarget.style.color = '#ffffff'
            }}
            onMouseLeave={(e) => {
              if (pathname !== '/import') e.currentTarget.style.color = theme.ui.textMuted
            }}
          >
            Import
          </a>
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-2 ml-6">
          {/* Notification with Popover - Temporarily disabled */}
          {/* <Popover.Root>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Popover.Trigger asChild>
                  <button className={`p-2 ${theme.ui.textMuted} hover:text-white transition-colors rounded-lg hover:bg-bg-secondary`}>
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
                    <div className={`p-2 bg-bg-primary rounded ${theme.ui.buttonHover} cursor-pointer transition-colors`}>
                      <p className="text-white text-sm">New record added to Project Phoenix</p>
                      <p className={`${theme.ui.textMuted} text-xs mt-1`}>2 hours ago</p>
                    </div>
                    <div className={`p-2 bg-bg-primary rounded ${theme.ui.buttonHover} cursor-pointer transition-colors`}>
                      <p className="text-white text-sm">Entity linked to record</p>
                      <p className={`${theme.ui.textMuted} text-xs mt-1`}>5 hours ago</p>
                    </div>
                  </div>
                </div>
                <Popover.Arrow className="fill-border-main" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root> */}

          {/* Profile with Avatar and DropdownMenu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="focus:outline-none">
                {isLoading ? (
                  <div className="w-9 h-9 rounded-full bg-gray-600 animate-pulse" />
                ) : (
                  <Avatar.Root className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden hover:ring-2 transition-all" style={{ backgroundColor: theme.ui.iconColors.orange, '--tw-ring-color': theme.ui.iconColors.orange } as React.CSSProperties}>
                    <Avatar.Image
                      src={userProfile?.profile?.avatar_url || undefined}
                      alt={getDisplayName()}
                      className="w-full h-full object-cover"
                    />
                    <Avatar.Fallback className="w-full h-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: theme.ui.iconColors.orange }}>
                      {getInitials()}
                    </Avatar.Fallback>
                  </Avatar.Root>
                )}
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="rounded-lg shadow-xl p-1 w-56 z-50 border"
                style={{
                  backgroundColor: theme.ui.secondaryBg,
                  borderColor: theme.ui.border,
                }}
                sideOffset={5}
              >
                <div className="px-3 py-2 mb-1">
                  <p className="text-sm font-medium" style={{ color: '#ffffff' }}>{getDisplayName()}</p>
                  <p className="text-xs truncate" style={{ color: theme.ui.textMuted }}>{userProfile?.email}</p>
                </div>

                <DropdownMenu.Separator className="h-px my-1" style={{ backgroundColor: theme.ui.border }} />

                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded cursor-pointer outline-none transition-colors"
                  style={{ color: theme.ui.textSecondary }}
                  onSelect={() => setIsProfileOpen(true)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff'
                    e.currentTarget.style.backgroundColor = theme.ui.primaryBg
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme.ui.textSecondary
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <UserCircle className="w-4 h-4" />
                  <span>My Profile</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded cursor-pointer outline-none transition-colors"
                  style={{ color: theme.ui.textSecondary }}
                  onSelect={() => setShowOnboarding(true)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff'
                    e.currentTarget.style.backgroundColor = theme.ui.primaryBg
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme.ui.textSecondary
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>기능 소개</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded cursor-pointer outline-none transition-colors"
                  style={{ color: theme.ui.textSecondary }}
                  onSelect={() => setIsSettingsOpen(true)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff'
                    e.currentTarget.style.backgroundColor = theme.ui.primaryBg
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme.ui.textSecondary
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded cursor-pointer outline-none transition-colors"
                  style={{ color: theme.ui.textSecondary }}
                  onSelect={toggleTheme}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff'
                    e.currentTarget.style.backgroundColor = theme.ui.primaryBg
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme.ui.textSecondary
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <Palette className="w-4 h-4" />
                  <span>Theme: {themeName === 'default' ? 'Default' : 'Claude'}</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded cursor-pointer outline-none transition-colors"
                  style={{ color: theme.ui.textSecondary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff'
                    e.currentTarget.style.backgroundColor = theme.ui.primaryBg
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme.ui.textSecondary
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <Keyboard className="w-4 h-4" />
                  <span>Keyboard Shortcuts</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded cursor-pointer outline-none transition-colors"
                  style={{ color: theme.ui.textSecondary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff'
                    e.currentTarget.style.backgroundColor = theme.ui.primaryBg
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme.ui.textSecondary
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Help</span>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px my-1" style={{ backgroundColor: theme.ui.border }} />
                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded cursor-pointer outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ color: theme.ui.interactive.dangerText }}
                  onSelect={handleLogout}
                  disabled={isLoggingOut}
                  onMouseEnter={(e) => {
                    if (!isLoggingOut) {
                      e.currentTarget.style.color = theme.ui.interactive.dangerTextHover
                      e.currentTarget.style.backgroundColor = theme.ui.primaryBg
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoggingOut) {
                      e.currentTarget.style.color = theme.ui.interactive.dangerText
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>

      {/* Profile Drawer */}
      <ProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Settings Drawer */}
      <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </Tooltip.Provider>
  )
}
