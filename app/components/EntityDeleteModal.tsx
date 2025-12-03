'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { AlertTriangle } from 'lucide-react'

interface EntityDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  entityName: string
  memoCount?: number
  isDeleting: boolean
}

export default function EntityDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  entityName,
  memoCount = 0,
  isDeleting,
}: EntityDeleteModalProps) {
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
                엔티티 삭제
              </Dialog.Title>
              <Dialog.Description className="text-sm text-text-muted">
                이 엔티티를 삭제하시겠습니까?
              </Dialog.Description>
            </div>
          </div>

          {/* Entity Name Preview */}
          <div className="bg-bg-secondary rounded-md p-3 mb-4">
            <p className="text-sm text-white font-medium">
              @{entityName}
            </p>
            {memoCount > 0 && (
              <p className="text-xs text-text-muted mt-1">
                {memoCount}개의 메모와 연결되어 있습니다
              </p>
            )}
          </div>

          {/* Warning */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 mb-6">
            <p className="text-xs text-red-400 mb-1">
              ⚠️ 이 작업은 되돌릴 수 없습니다.
            </p>
            {memoCount > 0 && (
              <p className="text-xs text-red-400">
                • 연결된 모든 메모에서 @ 멘션이 제거됩니다
              </p>
            )}
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
