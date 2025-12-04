'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEntityFilter } from './providers/EntityFilterProvider'
import Header from './components/common/Header'
import MainContainer from './components/home/MainContainer'
import RightSidebar from './components/home/RightSidebar'
import InputArea from './components/home/InputArea'

export default function Home() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { setFilteredEntityIds, setHighlightedMemoId } = useEntityFilter()

  // URL 파라미터로부터 검색 결과 처리
  useEffect(() => {
    const entityId = searchParams.get('entity')
    const memoId = searchParams.get('memo')

    if (entityId) {
      // Entity 검색 결과: MainContainer에 표시
      setFilteredEntityIds(prev => {
        const filtered = prev.filter(id => id !== entityId)
        return [...filtered, entityId]
      })
      // URL 파라미터 제거
      router.replace('/')
    }

    if (memoId) {
      // Memo 검색 결과: RightSidebar에서 하이라이트
      setHighlightedMemoId(memoId)
      // 3초 후 하이라이트 해제
      setTimeout(() => {
        setHighlightedMemoId(null)
      }, 3000)
      // URL 파라미터 제거
      router.replace('/')
    }
  }, [searchParams, router, setFilteredEntityIds, setHighlightedMemoId])

  return (
    <div className="h-screen flex flex-col bg-bg-primary">
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
