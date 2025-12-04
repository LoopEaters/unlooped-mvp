'use client'

import type { Database } from '@/types/supabase'
import BaseDrawer from '@/app/components/common/BaseDrawer'
import { getEntityTypeColor, defaultTheme } from '@/app/lib/theme'
import { getRelativeTime } from '@/app/lib/util'
import { highlightEntities } from '@/app/lib/utils/highlightEntities'
import { useState } from 'react'

type Entity = Database['public']['Tables']['entity']['Row']
type Memo = Database['public']['Tables']['memo']['Row'] & {
  entityIds: string[]
}

interface EntityDetailDrawerProps {
  isOpen: boolean
  entity: Entity | null
  memos: Memo[]
  entities?: Entity[]
  onClose: () => void
  onMemoClick?: (memoId: string) => void
}

export default function EntityDetailDrawer({
  isOpen,
  entity,
  memos,
  entities = [],
  onClose,
  onMemoClick,
}: EntityDetailDrawerProps) {
  const [isButtonHovered, setIsButtonHovered] = useState(false)
  const [hoveredMemoId, setHoveredMemoId] = useState<string | null>(null)

  if (!entity) return null

  const typeColor = getEntityTypeColor(entity.type)
  const relatedMemos = memos
    .filter((m) => m.entityIds.includes(entity.id))
    .sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
      return timeB - timeA // 최신순
    })

  return (
    <BaseDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={entity.name}
      width="w-[500px]"
      modal={false}
      footer={
        <div className="px-6 py-4">
          <button
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            className="w-full px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: isButtonHovered
                ? defaultTheme.drawer.button.primary.bgHover
                : defaultTheme.drawer.button.primary.bg,
              color: defaultTheme.drawer.button.primary.text,
            }}
          >
            Edit Entity
          </button>
        </div>
      }
    >
      <div className="px-6 py-4 space-y-6">
        {/* Entity Type */}
        <div>
          <h3
            className="text-xs uppercase tracking-wide mb-2"
            style={{ color: defaultTheme.drawer.section.title }}
          >
            Type
          </h3>
          <div
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: defaultTheme.drawer.card.background,
              border: `1px solid ${defaultTheme.drawer.card.border}`,
              color: typeColor.hex,
            }}
          >
            {entity.type || 'unknown'}
          </div>
        </div>

        {/* Description */}
        {entity.description && (
          <div>
            <h3
              className="text-xs uppercase tracking-wide mb-2"
              style={{ color: defaultTheme.drawer.section.title }}
            >
              Description
            </h3>
            <div
              className="rounded-lg p-4"
              style={{
                backgroundColor: defaultTheme.drawer.card.background,
                border: `1px solid ${defaultTheme.drawer.card.border}`,
              }}
            >
              <p
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: defaultTheme.drawer.section.text }}
              >
                {entity.description}
              </p>
            </div>
          </div>
        )}

        {/* Connected Memos */}
        <div>
          <h3
            className="text-xs uppercase tracking-wide mb-3"
            style={{ color: defaultTheme.drawer.section.title }}
          >
            Connected Memos ({relatedMemos.length})
          </h3>
          <div className="space-y-2">
            {relatedMemos.length === 0 ? (
              <p className="text-sm" style={{ color: defaultTheme.drawer.section.textMuted }}>
                No memos connected to this entity.
              </p>
            ) : (
              relatedMemos.map((memo) => (
                <div
                  key={memo.id}
                  onClick={() => onMemoClick?.(memo.id)}
                  onMouseEnter={() => setHoveredMemoId(memo.id)}
                  onMouseLeave={() => setHoveredMemoId(null)}
                  className="rounded-lg p-3 cursor-pointer transition-colors"
                  style={{
                    backgroundColor: defaultTheme.drawer.card.background,
                    border: `1px solid ${hoveredMemoId === memo.id ? defaultTheme.drawer.card.borderHover : defaultTheme.drawer.card.border}`,
                  }}
                >
                  <div
                    className="text-sm line-clamp-2 mb-2"
                    style={{ color: defaultTheme.drawer.section.text }}
                  >
                    {highlightEntities(memo.content, entities, entity?.id)}
                  </div>
                  <span className="text-xs" style={{ color: defaultTheme.drawer.section.textMuted }}>
                    {memo.created_at ? getRelativeTime(memo.created_at) : 'Unknown date'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </BaseDrawer>
  )
}
