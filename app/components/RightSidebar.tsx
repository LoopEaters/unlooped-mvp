'use client'

import { useEffect, useRef } from 'react'

export default function RightSidebar() {
  const sidebarRef = useRef<HTMLDivElement>(null)

  // 기본적으로 가장 아래로 스크롤
  useEffect(() => {
    if (sidebarRef.current) {
      sidebarRef.current.scrollTop = sidebarRef.current.scrollHeight
    }
  }, [])

  return (
    <div
      ref={sidebarRef}
      className="w-80 border-l border-border-main overflow-y-auto p-6 bg-bg-primary"
    >
      {/* Timeline dates will be rendered here */}
      <div className="space-y-4">
        {/* Placeholder for timeline */}
        <div className="text-gray-400 text-sm">Timeline will appear here</div>
      </div>
    </div>
  )
}
