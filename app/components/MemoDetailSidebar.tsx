'use client'

import type { Database } from '@/types/supabase'
import BaseDrawer from './BaseDrawer'
import { defaultTheme } from '@/app/lib/theme'
import { useState } from 'react'

type Memo = Database['public']['Tables']['memo']['Row']
type Entity = Database['public']['Tables']['entity']['Row']

interface MemoDetailSidebarProps {
  isOpen: boolean
  memo: Memo | null
  entities: Entity[]
  onClose: () => void
}

export default function MemoDetailSidebar({
  isOpen,
  memo,
  entities,
  onClose,
}: MemoDetailSidebarProps) {
  const [isButtonHovered, setIsButtonHovered] = useState(false)

  if (!memo) return null

  const dateStr = memo.created_at
    ? new Date(memo.created_at).toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Unknown date'

  const updatedStr = memo.updated_at
    ? new Date(memo.updated_at).toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <BaseDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Memo Details"
      width="w-[500px]"
      footer={
        <div className="px-6 py-4">
          <button
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            className="w-full px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: isButtonHovered
                ? defaultTheme.drawer.button.secondary.bgHover
                : defaultTheme.drawer.button.secondary.bg,
              color: defaultTheme.drawer.button.secondary.text,
            }}
          >
            Edit Memo
          </button>
        </div>
      }
    >
      <div className="px-6 py-4 space-y-6">
        {/* Date */}
        <div>
          <h3
            className="text-xs uppercase tracking-wide mb-2"
            style={{ color: defaultTheme.drawer.section.title }}
          >
            Created
          </h3>
          <p style={{ color: defaultTheme.drawer.section.text }}>{dateStr}</p>
          {updatedStr && updatedStr !== dateStr && (
            <>
              <h3
                className="text-xs uppercase tracking-wide mb-2 mt-3"
                style={{ color: defaultTheme.drawer.section.title }}
              >
                Last Updated
              </h3>
              <p style={{ color: defaultTheme.drawer.section.text }}>{updatedStr}</p>
            </>
          )}
        </div>

        {/* Entities */}
        <div>
          <h3
            className="text-xs uppercase tracking-wide mb-3"
            style={{ color: defaultTheme.drawer.section.title }}
          >
            Connected Entities ({entities.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {entities.map((entity) => (
              <span
                key={entity.id}
                className="px-3 py-1.5 text-sm rounded-full"
                style={{
                  backgroundColor: defaultTheme.drawer.card.background,
                  color: defaultTheme.drawer.section.text,
                  border: `1px solid ${defaultTheme.drawer.card.border}`,
                }}
              >
                {entity.name}
                {entity.type && (
                  <span className="ml-2 text-xs" style={{ color: defaultTheme.drawer.section.textMuted }}>
                    ({entity.type})
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <h3
            className="text-xs uppercase tracking-wide mb-3"
            style={{ color: defaultTheme.drawer.section.title }}
          >
            Content
          </h3>
          <div
            className="rounded-lg p-4"
            style={{
              backgroundColor: defaultTheme.drawer.card.background,
              border: `1px solid ${defaultTheme.drawer.card.border}`,
            }}
          >
            <p
              className="whitespace-pre-wrap leading-relaxed"
              style={{ color: defaultTheme.drawer.section.text }}
            >
              {memo.content}
            </p>
          </div>
        </div>
      </div>
    </BaseDrawer>
  )
}
