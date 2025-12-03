'use client'

import { useAuth } from '@/app/providers/AuthProvider'
import { useTimelineData } from '@/app/lib/queries'
import Header from '@/app/components/common/Header'
import EntityTimeline from '@/app/components/entities/EntityTimeline'

export default function EntitiesPage() {
  const { userProfile } = useAuth()
  const { data, isLoading, error, status } = useTimelineData(userProfile?.id)

  // 로딩 중: 이전 에러 상태 무시
  if (isLoading && status === 'pending') {
    return (
      <div className="flex flex-col h-screen bg-bg-primary">
        <Header />
        <div className="flex items-center justify-center flex-1">
          <div className="text-white">Loading timeline...</div>
        </div>
      </div>
    )
  }

  // 로딩 완료 후 에러만 체크
  if (error && !isLoading) {
    return (
      <div className="flex flex-col h-screen bg-bg-primary">
        <Header />
        <div className="flex items-center justify-center flex-1">
          <div className="text-red-400">Error loading timeline: {error.message}</div>
        </div>
      </div>
    )
  }

  if (!data || data.entities.length === 0) {
    return (
      <div className="flex flex-col h-screen bg-bg-primary">
        <Header />
        <div className="flex items-center justify-center flex-1">
          <div className="text-gray-400 text-center">
            <p className="text-xl mb-4">No entities found</p>
            <p className="text-sm">Create some memos with entities to see them here.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-bg-primary flex flex-col">
      <Header />

      {/* Timeline Info Bar */}
      <div className="border-b border-border-main px-6 py-3 bg-bg-secondary">
        <div className="flex items-center justify-between">
          <h1 className="text-xl text-white font-light">Entity Timeline</h1>
          <p className="text-gray-400 text-sm">
            {data.entities.length} entities · {data.memos.length} memos
          </p>
        </div>
      </div>

      {/* Timeline Canvas */}
      <div className="flex-1 overflow-hidden">
        <EntityTimeline entities={data.entities} memos={data.memos} />
      </div>
    </div>
  )
}
