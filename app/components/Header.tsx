'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import * as Avatar from '@radix-ui/react-avatar'
import * as Popover from '@radix-ui/react-popover'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Tooltip from '@radix-ui/react-tooltip'
import { Search, Bell, Settings, LogOut, UserCircle, User, Keyboard, HelpCircle } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { useEntityFilter } from '@/app/providers/EntityFilterProvider'
import { useSearchEntities, useSearchMemos } from '@/app/lib/queries'
import SearchResults from '@/app/components/SearchResults'
import SettingsDrawer from '@/app/components/SettingsDrawer'
import type { Database } from '@/types/supabase'

type Entity = Database['public']['Tables']['entity']['Row']
type Memo = Database['public']['Tables']['memo']['Row']

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { userProfile, signOut, isLoading } = useAuth()
  const { setFilteredEntityIds, setHighlightedMemoId } = useEntityFilter()

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
    // Entity 검색: MainContainer에 표시
    // 이미 있으면 맨 뒤로 이동, 없으면 추가 (항상 맨 아래로)
    setFilteredEntityIds(prev => {
      const filtered = prev.filter(id => id !== entity.id)
      return [...filtered, entity.id]
    })
    setIsSearchOpen(false)
    setSearchQuery('') // 검색어 초기화
  }

  const handleSelectMemo = (memo: Memo) => {
    // Memo 검색: RightSidebar에서 하이라이트
    setHighlightedMemoId(memo.id)

    // 3초 후 하이라이트 해제
    setTimeout(() => {
      setHighlightedMemoId(null)
    }, 3000)

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
      <header className="flex items-center justify-between px-6 py-3 bg-bg-primary border-b border-border-main">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <h1 className="text-xl text-white font-light" style={{ fontFamily: 'var(--font-sweet)' }}>
            Unlooped
          </h1>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-md mx-8">
          <Popover.Root open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <Popover.Trigger asChild>
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
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Content
                className="bg-bg-secondary border border-border-main rounded-lg shadow-xl w-[var(--radix-popover-trigger-width)] z-50"
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
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            Dashboard
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            Records
          </a>
          <a href="/entities" className="text-gray-400 hover:text-white transition-colors">
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

          {/* Profile with Avatar and DropdownMenu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="focus:outline-none">
                {isLoading ? (
                  <div className="w-9 h-9 rounded-full bg-gray-600 animate-pulse" />
                ) : (
                  <Avatar.Root className="w-9 h-9 rounded-full bg-orange-400 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-orange-500 transition-all">
                    <Avatar.Image
                      src={userProfile?.profile?.avatar_url || undefined}
                      alt={getDisplayName()}
                      className="w-full h-full object-cover"
                    />
                    <Avatar.Fallback className="w-full h-full flex items-center justify-center bg-orange-400 text-white font-medium">
                      {getInitials()}
                    </Avatar.Fallback>
                  </Avatar.Root>
                )}
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="bg-bg-secondary border border-border-main rounded-lg shadow-xl p-1 w-56 z-50"
                sideOffset={5}
              >
                <div className="px-3 py-2 mb-1">
                  <p className="text-sm font-medium text-white">{getDisplayName()}</p>
                  <p className="text-xs text-gray-400 truncate">{userProfile?.email}</p>
                </div>

                <DropdownMenu.Separator className="h-px bg-border-main my-1" />

                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-bg-primary rounded cursor-pointer outline-none">
                  <UserCircle className="w-4 h-4" />
                  <span>My Profile</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-bg-primary rounded cursor-pointer outline-none"
                  onSelect={() => setIsSettingsOpen(true)}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-bg-primary rounded cursor-pointer outline-none">
                  <Keyboard className="w-4 h-4" />
                  <span>Keyboard Shortcuts</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-bg-primary rounded cursor-pointer outline-none">
                  <HelpCircle className="w-4 h-4" />
                  <span>Help</span>
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

      {/* Settings Drawer */}
      <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </Tooltip.Provider>
  )
}
