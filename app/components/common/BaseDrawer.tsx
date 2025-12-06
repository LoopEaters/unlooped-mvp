'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { ReactNode, useState } from 'react'
import { useTheme } from '@/app/providers/ThemeProvider'

interface BaseDrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  width?: string // 예: 'w-[600px]', 'w-[800px]'
  modal?: boolean // true: 모달(오버레이, 외부 클릭 시 닫힘), false: 사이드 패널(외부 상호작용 가능)
}

export default function BaseDrawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
  width = 'w-[600px]',
  modal = true,
}: BaseDrawerProps) {
  const { theme } = useTheme()
  const [isCloseHovered, setIsCloseHovered] = useState(false)

  return (
    <Dialog.Root open={isOpen} onOpenChange={modal ? onClose : undefined} modal={modal}>
      <Dialog.Portal>
        {/* Overlay */}
        {modal && (
          <Dialog.Overlay
            className="fixed inset-0 backdrop-blur-sm z-40"
            style={{ backgroundColor: theme.drawer.overlay }}
          />
        )}

        {/* Drawer Content */}
        <Dialog.Content
          className={`drawer-content fixed right-0 top-0 h-full ${width} z-50 shadow-xl flex flex-col`}
          style={{
            backgroundColor: theme.drawer.background,
            borderLeft: `1px solid ${theme.drawer.border}`,
          }}
          onEscapeKeyDown={modal ? onClose : undefined}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4"
            style={{ borderBottom: `1px solid ${theme.drawer.border}` }}
          >
            <Dialog.Title
              className="text-lg font-semibold"
              style={{ color: theme.drawer.header.title }}
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
                  ? theme.drawer.header.closeButtonHover
                  : theme.drawer.header.closeButton,
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
            <div style={{ borderTop: `1px solid ${theme.drawer.border}` }}>{footer}</div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
