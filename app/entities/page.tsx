'use client'

import { useAuth } from '@/app/providers/AuthProvider'
import { useTimelineData } from '@/app/lib/queries'
import { useTheme } from '@/app/providers/ThemeProvider'
import Header from '@/app/components/common/Header'
import EntityTimeline from '@/app/components/entities/EntityTimeline'

export default function EntitiesPage() {
  const { userProfile } = useAuth()
  const { theme } = useTheme()
  const { data, isLoading, error, status } = useTimelineData(userProfile?.id)

  // 로딩 중
  if (status === 'pending') {
    return (
      <div className="flex flex-col h-screen" style={{ backgroundColor: theme.ui.primaryBg }}>
        <Header />
        <div className="flex items-center justify-center flex-1">
          <div style={{ color: theme.ui.textPrimary }}>Loading timeline...</div>
        </div>
      </div>
    )
  }

  // 에러 발생
  if (status === 'error') {
    return (
      <div className="flex flex-col h-screen" style={{ backgroundColor: theme.ui.primaryBg }}>
        <Header />
        <div className="flex items-center justify-center flex-1">
          <div style={{ color: theme.ui.error.text }}>
            Error loading timeline: {error?.message || 'Unknown error'}
          </div>
        </div>
      </div>
    )
  }

  // 데이터 없음
  if (!data || data.entities.length === 0) {
    return (
      <div className="flex flex-col h-screen" style={{ backgroundColor: theme.ui.primaryBg }}>
        <Header />
        <div className="flex items-center justify-center flex-1">
          <div className="text-center" style={{ color: theme.ui.textMuted }}>
            <p className="text-xl mb-4">No entities found</p>
            <p className="text-sm">Create some memos with entities to see them here.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: theme.ui.primaryBg }}>
      <Header />

      {/* Timeline Info Bar */}
      <div
        className="border-b px-6 py-3"
        style={{
          borderColor: theme.ui.border,
          backgroundColor: theme.ui.secondaryBg,
        }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-light" style={{ color: theme.ui.textPrimary }}>
            Entity Timeline
          </h1>
          <p className="text-sm" style={{ color: theme.ui.textMuted }}>
            {data?.entities.length ?? 0} entities · {data?.memos.length ?? 0} memos
          </p>
        </div>
      </div>

      {/* Timeline Canvas */}
      <div className="flex-1 overflow-hidden">
        <EntityTimeline entities={data?.entities ?? []} memos={data?.memos ?? []} />
      </div>
    </div>
  )
}
