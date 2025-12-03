'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { ReactNode, useState } from 'react'
import { defaultTheme } from '@/app/lib/theme'

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
  const [isCloseHovered, setIsCloseHovered] = useState(false)

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay
          className="fixed inset-0 backdrop-blur-sm z-40"
          style={{ backgroundColor: defaultTheme.drawer.overlay }}
        />

        {/* Drawer Content */}
        <Dialog.Content
          className={`drawer-content fixed right-0 top-0 h-full ${width} z-50 shadow-xl flex flex-col`}
          style={{
            backgroundColor: defaultTheme.drawer.background,
            borderLeft: `1px solid ${defaultTheme.drawer.border}`,
          }}
          onEscapeKeyDown={onClose}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4"
            style={{ borderBottom: `1px solid ${defaultTheme.drawer.border}` }}
          >
            <Dialog.Title
              className="text-lg font-semibold"
              style={{ color: defaultTheme.drawer.header.title }}
            >
              {title}
            </Dialog.Title>
            <button
              onClick={onClose}
              onMouseEnter={() => setIsCloseHovered(true)}
              onMouseLeave={() => setIsCloseHovered(false)}
              className="p-1.5 transition-colors rounded-md"
              style={{
                color: isCloseHovered
                  ? defaultTheme.drawer.header.closeButtonHover
                  : defaultTheme.drawer.header.closeButton,
                backgroundColor: isCloseHovered ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              }}
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">{children}</div>

          {/* Footer (optional) */}
          {footer && (
            <div style={{ borderTop: `1px solid ${defaultTheme.drawer.border}` }}>{footer}</div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
