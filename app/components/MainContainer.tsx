'use client'

import { useEffect, useRef } from 'react'

export default function MainContainer() {
  const containerRef = useRef<HTMLDivElement>(null)

  // 기본적으로 가장 아래로 스크롤
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-6"
    >
      {/* Record cards will be rendered here via React Query */}
      <div className="space-y-4">
        {/* Placeholder for records */}
      </div>
    </div>
  )
}
