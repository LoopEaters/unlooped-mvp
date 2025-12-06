'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { AlertTriangle } from 'lucide-react'
import { useTheme } from '@/app/providers/ThemeProvider'

interface MemoDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  memoContent: string
  isDeleting: boolean
}

export default function MemoDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  memoContent,
  isDeleting,
}: MemoDeleteModalProps) {
  const { theme } = useTheme()

  // 메모 미리보기 (처음 50자만)
  const memoPreview = memoContent.length > 50
    ? memoContent.substring(0, 50) + '...'
    : memoContent

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay
          className="fixed inset-0 backdrop-blur-sm z-40"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        />

        {/* Modal Content */}
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-xl p-6 w-full max-w-md z-50 border"
          style={{
            backgroundColor: theme.ui.cardBg,
            borderColor: theme.ui.border,
          }}
          onEscapeKeyDown={onClose}
          onPointerDownOutside={onClose}
        >
          {/* Icon + Title */}
          <div className="flex items-start gap-3 mb-4">
            <div
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.ui.delete.bg }}
            >
              <AlertTriangle className="w-5 h-5" style={{ color: theme.ui.delete.text }} />
            </div>
            <div className="flex-1">
              <Dialog.Title className="text-lg font-semibold mb-1" style={{ color: '#ffffff' }}>
                메모 삭제
              </Dialog.Title>
              <Dialog.Description className="text-sm" style={{ color: theme.ui.textMuted }}>
                이 메모를 삭제하시겠습니까?
              </Dialog.Description>
            </div>
          </div>

          {/* Memo Preview */}
          <div className="rounded-md p-3 mb-4" style={{ backgroundColor: theme.ui.secondaryBg }}>
            <p className="text-xs leading-relaxed whitespace-pre-wrap break-words" style={{ color: '#ffffff' }}>
              {memoPreview}
            </p>
          </div>

          {/* Warning */}
          <div
            className="rounded-md p-3 mb-6 border"
            style={{
              backgroundColor: theme.ui.delete.bg,
              borderColor: 'rgba(239, 68, 68, 0.2)',
            }}
          >
            <p className="text-xs" style={{ color: theme.ui.delete.text }}>
              ⚠️ 이 작업은 되돌릴 수 없습니다.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                color: '#ffffff',
                backgroundColor: theme.ui.secondaryBg,
              }}
              onMouseEnter={(e) => {
                if (!isDeleting) {
                  e.currentTarget.style.backgroundColor = theme.ui.primaryBg
                }
              }}
              onMouseLeave={(e) => {
                if (!isDeleting) {
                  e.currentTarget.style.backgroundColor = theme.ui.secondaryBg
                }
              }}
            >
              취소
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 font-medium rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{
                backgroundColor: theme.ui.interactive.danger,
                color: '#ffffff',
              }}
              onMouseEnter={(e) => {
                if (!isDeleting) {
                  e.currentTarget.style.opacity = '0.9'
                }
              }}
              onMouseLeave={(e) => {
                if (!isDeleting) {
                  e.currentTarget.style.opacity = '1'
                }
              }}
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  삭제 중...
                </>
              ) : (
                '삭제'
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
