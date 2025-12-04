'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useEntityFilter } from '@/app/providers/EntityFilterProvider'

export default function SearchParamsHandler() {
  const searchParams = useSearchParams()
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
      // URL 파라미터 제거 (리렌더링 없이 조용히 변경)
      window.history.replaceState(null, '', '/')
    }

    if (memoId) {
      // Memo 검색 결과: RightSidebar에서 하이라이트
      setHighlightedMemoId(memoId)
      // 3초 후 하이라이트 해제
      setTimeout(() => {
        setHighlightedMemoId(null)
      }, 3000)
      // URL 파라미터 제거 (리렌더링 없이 조용히 변경)
      window.history.replaceState(null, '', '/')
    }
  }, [searchParams, setFilteredEntityIds, setHighlightedMemoId])

  return null
}
