'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { AlertTriangle } from 'lucide-react'

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
  // 메모 미리보기 (처음 50자만)
  const memoPreview = memoContent.length > 50
    ? memoContent.substring(0, 50) + '...'
    : memoContent

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

        {/* Modal Content */}
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-card rounded-lg shadow-xl p-6 w-full max-w-md z-50 border border-border-main"
          onEscapeKeyDown={onClose}
          onPointerDownOutside={onClose}
        >
          {/* Icon + Title */}
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1">
              <Dialog.Title className="text-lg font-semibold text-white mb-1">
                메모 삭제
              </Dialog.Title>
              <Dialog.Description className="text-sm text-text-muted">
                이 메모를 삭제하시겠습니까?
              </Dialog.Description>
            </div>
          </div>

          {/* Memo Preview */}
          <div className="bg-bg-secondary rounded-md p-3 mb-4">
            <p className="text-xs text-white leading-relaxed whitespace-pre-wrap break-words">
              {memoPreview}
            </p>
          </div>

          {/* Warning */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 mb-6">
            <p className="text-xs text-red-400">
              ⚠️ 이 작업은 되돌릴 수 없습니다.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-white bg-bg-secondary hover:bg-bg-primary transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
