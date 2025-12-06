'use client'

import { useAuth } from '@/app/providers/AuthProvider'
import { useTheme } from '@/app/providers/ThemeProvider'
import Header from '@/app/components/common/Header'
import ImportPage from '@/app/components/import/ImportPage'

export default function ImportRoute() {
  const { userProfile, isLoading } = useAuth()
  const { theme } = useTheme()

  // 로딩 중
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen" style={{ backgroundColor: theme.ui.primaryBg }}>
        <Header />
        <div className="flex items-center justify-center flex-1">
          <div style={{ color: theme.ui.textPrimary }}>Loading...</div>
        </div>
      </div>
    )
  }

  // 비로그인
  if (!userProfile) {
    return (
      <div className="flex flex-col h-screen" style={{ backgroundColor: theme.ui.primaryBg }}>
        <Header />
        <div className="flex items-center justify-center flex-1">
          <div style={{ color: theme.ui.textMuted }}>Please log in to import memos.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: theme.ui.primaryBg }}>
      <Header />

      {/* Page Title */}
      <div
        className="border-b px-6 py-3"
        style={{
          borderColor: theme.ui.border,
          backgroundColor: theme.ui.secondaryBg,
        }}
      >
        <h1 className="text-xl font-light" style={{ color: theme.ui.textPrimary }}>
          메모 일괄 업로드
        </h1>
        <p className="text-sm mt-1" style={{ color: theme.ui.textMuted }}>
          대량의 메모를 한 번에 업로드하고 AI가 자동으로 분석합니다
        </p>
      </div>

      {/* Import Content */}
      <div className="flex-1 overflow-auto">
        <ImportPage userId={userProfile.id} />
      </div>
    </div>
  )
}
