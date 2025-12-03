'use client'

import type { Database } from '@/types/supabase'
import BaseDrawer from './BaseDrawer'
import { getEntityTypeColor } from '@/app/lib/theme'
import { getRelativeTime } from '@/app/lib/util'

type Entity = Database['public']['Tables']['entity']['Row']
type Memo = Database['public']['Tables']['memo']['Row'] & {
  entityIds: string[]
}

interface EntityDetailDrawerProps {
  isOpen: boolean
  entity: Entity | null
  memos: Memo[]
  onClose: () => void
  onMemoClick?: (memoId: string) => void
}

export default function EntityDetailDrawer({
  isOpen,
  entity,
  memos,
  onClose,
  onMemoClick,
}: EntityDetailDrawerProps) {
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
      footer={
        <div className="px-6 py-4">
          <button className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            Edit Entity
          </button>
        </div>
      }
    >
      <div className="px-6 py-4 space-y-6">
        {/* Entity Type */}
        <div>
          <h3 className="text-xs text-gray-400 uppercase tracking-wide mb-2">Type</h3>
          <span className={`inline-block px-3 py-1.5 ${typeColor.bg} ${typeColor.text} rounded-full text-sm font-medium`}>
            {entity.type || 'unknown'}
          </span>
        </div>

        {/* Connected Memos */}
        <div>
          <h3 className="text-xs text-gray-400 uppercase tracking-wide mb-3">
            Connected Memos ({relatedMemos.length})
          </h3>
          <div className="space-y-2">
            {relatedMemos.length === 0 ? (
              <p className="text-gray-400 text-sm">No memos connected to this entity.</p>
            ) : (
              relatedMemos.map((memo) => (
                <div
                  key={memo.id}
                  onClick={() => onMemoClick?.(memo.id)}
                  className="bg-bg-primary rounded-lg p-3 border border-border-main hover:border-gray-500 cursor-pointer transition-colors"
                >
                  <p className="text-white text-sm line-clamp-2 mb-2">{memo.content}</p>
                  <span className="text-xs text-gray-400">
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
