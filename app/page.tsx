'use client'

import { Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers/AuthProvider'
import { useTheme } from '@/app/providers/ThemeProvider'
import Header from './components/common/Header'
import MainContainer from './components/home/MainContainer'
import RightSidebar from './components/home/RightSidebar'
import InputArea from './components/home/InputArea'
import SearchParamsHandler from './components/home/SearchParamsHandler'

export default function Home() {
  const { session, isLoading } = useAuth()
  const { theme } = useTheme()
  const router = useRouter()

  // 비로그인 사용자는 Landing Page로 리다이렉트 (로딩 완료 후)
  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/landing')
    }
  }, [session, isLoading, router])

  // 로딩 중이거나 비로그인이면 아무것도 렌더링하지 않음
  if (isLoading || !session) {
    return null
  }

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: theme.ui.primaryBg }}>
      {/* URL 파라미터 처리 (Suspense로 감싸기) */}
      <Suspense fallback={null}>
        <SearchParamsHandler />
      </Suspense>

      {/* Header */}
      <Header />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Main container with records */}
        <div className="flex-1 flex flex-col min-w-0">
          <MainContainer />
          <InputArea />
        </div>

        {/* Right: Timeline sidebar */}
        <RightSidebar />
      </div>
    </div>
  )
}
