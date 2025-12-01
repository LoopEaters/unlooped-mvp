'use client'

import { Toaster } from 'sonner'

/**
 * 전역 Toast Provider
 * Sonner 라이브러리를 사용하여 애플리케이션 전체에서 토스트 메시지를 표시합니다.
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      duration={3000}
      toastOptions={{
        style: {
          background: 'var(--color-bg-secondary)',
          color: '#fff',
          border: '1px solid var(--color-border-main)',
        },
        className: 'font-sans',
      }}
    />
  )
}
