'use client'

import { Toaster } from 'sonner'
import { useTheme } from '@/app/providers/ThemeProvider'

/**
 * 전역 Toast Provider
 * Sonner 라이브러리를 사용하여 애플리케이션 전체에서 토스트 메시지를 표시합니다.
 */
export function ToastProvider() {
  const { theme } = useTheme()

  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      duration={3000}
      toastOptions={{
        style: {
          background: theme.ui.secondaryBg,
          color: theme.ui.textPrimary,
          border: `1px solid ${theme.ui.border}`,
        },
        className: 'font-sans',
      }}
    />
  )
}
