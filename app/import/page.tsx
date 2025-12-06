'use client'

import { useAuth } from '@/app/providers/AuthProvider'
import Header from '@/app/components/common/Header'
import ImportPage from '@/app/components/import/ImportPage'
import { defaultTheme } from '@/app/lib/theme'

export default function ImportRoute() {
  const { userProfile, isLoading } = useAuth()

  // 로딩 중
  if (isLoading) {
    return (
      <div className={`flex flex-col h-screen ${defaultTheme.ui.primaryBg}`}>
        <Header />
        <div className="flex items-center justify-center flex-1">
          <div className={defaultTheme.ui.textPrimary}>Loading...</div>
        </div>
      </div>
    )
  }

  // 비로그인
  if (!userProfile) {
    return (
      <div className={`flex flex-col h-screen ${defaultTheme.ui.primaryBg}`}>
        <Header />
        <div className="flex items-center justify-center flex-1">
          <div className={defaultTheme.ui.textMuted}>Please log in to import memos.</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-screen ${defaultTheme.ui.primaryBg} flex flex-col`}>
      <Header />

      {/* Page Title */}
      <div className={`border-b ${defaultTheme.ui.border} px-6 py-3 ${defaultTheme.ui.secondaryBg}`}>
        <h1 className={`text-xl ${defaultTheme.ui.textPrimary} font-light`}>메모 일괄 업로드</h1>
        <p className={`${defaultTheme.ui.textMuted} text-sm mt-1`}>
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
