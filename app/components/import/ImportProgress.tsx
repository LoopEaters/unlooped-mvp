'use client'

import { useTheme } from '@/app/providers/ThemeProvider'

export default function ImportProgress() {
  const { theme } = useTheme()

  return (
    <div className="flex items-center justify-center py-12">
      <div
        className="rounded-lg p-8 max-w-md w-full border"
        style={{
          backgroundColor: theme.ui.cardBg,
          borderColor: theme.ui.border,
        }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: theme.ui.interactive.primary }}
          />
          <h3
            className="text-lg font-medium mb-2"
            style={{ color: theme.ui.textPrimary }}
          >
            Import 진행 중...
          </h3>
          <p className="text-sm" style={{ color: theme.ui.textMuted }}>
            메모와 Entity를 데이터베이스에 저장하고 있습니다
          </p>
        </div>
      </div>
    </div>
  )
}
