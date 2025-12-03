'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { ReactNode } from 'react'

interface BaseDrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  width?: string // 예: 'w-[600px]', 'w-[800px]'
}

export default function BaseDrawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
  width = 'w-[600px]',
}: BaseDrawerProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

        {/* Drawer Content */}
        <Dialog.Content
          className={`drawer-content fixed right-0 top-0 h-full ${width} z-50 bg-bg-primary border-l border-border-main shadow-xl flex flex-col`}
          onEscapeKeyDown={onClose}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-main">
            <Dialog.Title className="text-lg font-semibold text-white">
              {title}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-1.5 text-text-muted hover:text-white transition-colors rounded-md hover:bg-bg-secondary"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>

          {/* Footer (optional) */}
          {footer && (
            <div className="border-t border-border-main">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
