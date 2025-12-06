'use client'

import { useTheme } from '@/app/providers/ThemeProvider'

export default function NotFound() {
  const { theme } = useTheme()

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: theme.ui.primaryBg }}
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4" style={{ color: theme.ui.textPrimary }}>
          404
        </h1>
        <p style={{ color: theme.ui.textMuted }}>Page not found</p>
      </div>
    </div>
  )
}
