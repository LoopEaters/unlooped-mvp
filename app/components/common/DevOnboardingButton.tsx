'use client'

import { useAuth } from '@/app/providers/AuthProvider'
import { useTheme } from '@/app/providers/ThemeProvider'
import { isProduction } from '@/app/lib/util'
import { HelpCircle } from 'lucide-react'

export default function DevOnboardingButton() {
  const { setShowOnboarding } = useAuth()
  const { theme } = useTheme()

  // Production 환경에서는 렌더링하지 않음
  if (isProduction()) {
    return null
  }

  return (
    <button
      onClick={() => setShowOnboarding(true)}
      className="fixed bottom-4 left-4 px-4 py-2 rounded-lg font-medium text-white shadow-lg hover:opacity-90 transition-all flex items-center gap-2"
      style={{
        backgroundColor: theme.ui.interactive.primary,
        zIndex: 9999,
      }}
      title="온보딩 다시 보기 (개발 전용)"
    >
      <HelpCircle className="w-4 h-4" />
      <span className="text-sm">온보딩 다시하기</span>
    </button>
  )
}
