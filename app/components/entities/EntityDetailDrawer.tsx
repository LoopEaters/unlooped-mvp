'use client'

import type { Database } from '@/types/supabase'
import BaseDrawer from '@/app/components/common/BaseDrawer'
import { getEntityTypeColor } from '@/app/lib/theme'
import { useTheme } from '@/app/providers/ThemeProvider'
import { getRelativeTime } from '@/app/lib/util'
import { highlightEntities } from '@/app/lib/utils/highlightEntities'
import { useState } from 'react'
import { useUpdateEntityType } from '@/app/lib/queries'
import { useAuth } from '@/app/providers/AuthProvider'

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
  const { theme } = useTheme()
  const { user } = useAuth()
  const [hoveredMemoId, setHoveredMemoId] = useState<string | null>(null)
  const updateEntityType = useUpdateEntityType()

  if (!entity) return null

  const typeColor = getEntityTypeColor(entity.type)

  // Type 변경 핸들러
  const handleTypeChange = (newType: 'person' | 'project' | 'event' | 'unknown') => {
    if (!user?.id || newType === entity.type) return

    updateEntityType.mutate({
      entityId: entity.id,
      type: newType,
      userId: user.id,
    })
  }
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
    >
      <div className="px-6 py-4 space-y-6">
        {/* Entity Type */}
        <div>
          <h3
            className="text-xs uppercase tracking-wide mb-2"
            style={{ color: theme.drawer.section.title }}
          >
            Type
          </h3>
          <select
            value={entity.type || 'unknown'}
            onChange={(e) => handleTypeChange(e.target.value as 'person' | 'project' | 'event' | 'unknown')}
            disabled={updateEntityType.isPending}
            className="w-full px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: theme.drawer.card.background,
              border: `1px solid ${theme.drawer.card.border}`,
              color: typeColor.hex,
            }}
          >
            <option value="person" style={{ backgroundColor: theme.drawer.background, color: theme.entityTypes.person.hex }}>
              person
            </option>
            <option value="project" style={{ backgroundColor: theme.drawer.background, color: theme.entityTypes.project.hex }}>
              project
            </option>
            <option value="event" style={{ backgroundColor: theme.drawer.background, color: theme.entityTypes.event.hex }}>
              event
            </option>
            <option value="unknown" style={{ backgroundColor: theme.drawer.background, color: theme.entityTypes.unknown.hex }}>
              unknown
            </option>
          </select>
        </div>

        {/* Description */}
        {entity.description && (
          <div>
            <h3
              className="text-xs uppercase tracking-wide mb-2"
              style={{ color: theme.drawer.section.title }}
            >
              Description
            </h3>
            <div
              className="rounded-lg p-4"
              style={{
                backgroundColor: theme.drawer.card.background,
                border: `1px solid ${theme.drawer.card.border}`,
              }}
            >
              <p
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: theme.drawer.section.text }}
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
            style={{ color: theme.drawer.section.title }}
          >
            Connected Memos ({relatedMemos.length})
          </h3>
          <div className="space-y-2">
            {relatedMemos.length === 0 ? (
              <p className="text-sm" style={{ color: theme.drawer.section.textMuted }}>
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
                    backgroundColor: theme.drawer.card.background,
                    border: `1px solid ${hoveredMemoId === memo.id ? theme.drawer.card.borderHover : theme.drawer.card.border}`,
                  }}
                >
                  <div
                    className="text-sm line-clamp-2 mb-2"
                    style={{ color: theme.drawer.section.text }}
                  >
                    {highlightEntities(memo.content, entities, entity?.id)}
                  </div>
                  <span className="text-xs" style={{ color: theme.drawer.section.textMuted }}>
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
