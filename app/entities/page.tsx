'use client'

import { useAuth } from '@/app/providers/AuthProvider'
import { useTimelineData } from '@/app/lib/queries'
import EntityTimeline from '@/app/components/EntityTimeline'

export default function EntitiesPage() {
  const { userProfile } = useAuth()
  const { data, isLoading, error } = useTimelineData(userProfile?.id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-primary">
        <div className="text-white">Loading timeline...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-primary">
        <div className="text-red-400">Error loading timeline: {error.message}</div>
      </div>
    )
  }

  if (!data || data.entities.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-primary">
        <div className="text-gray-400">
          <p className="text-xl mb-4">No entities found</p>
          <p className="text-sm">Create some memos with entities to see them here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-bg-primary flex flex-col">
      {/* Header */}
      <div className="border-b border-border-main px-6 py-4">
        <h1 className="text-2xl text-white font-light">Entity Timeline</h1>
        <p className="text-gray-400 text-sm mt-1">
          {data.entities.length} entities, {data.memos.length} memos
        </p>
      </div>

      {/* Timeline Canvas */}
      <div className="flex-1 overflow-hidden">
        <EntityTimeline entities={data.entities} memos={data.memos} />
      </div>
    </div>
  )
}
