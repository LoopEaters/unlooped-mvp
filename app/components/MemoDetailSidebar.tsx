'use client'

import type { Database } from '@/types/supabase'
import BaseDrawer from './BaseDrawer'

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
          <button className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">
            Edit Memo
          </button>
        </div>
      }
    >
      <div className="px-6 py-4 space-y-6">
        {/* Date */}
        <div>
          <h3 className="text-xs text-gray-400 uppercase tracking-wide mb-2">Created</h3>
          <p className="text-white">{dateStr}</p>
          {updatedStr && updatedStr !== dateStr && (
            <>
              <h3 className="text-xs text-gray-400 uppercase tracking-wide mb-2 mt-3">
                Last Updated
              </h3>
              <p className="text-white">{updatedStr}</p>
            </>
          )}
        </div>

        {/* Entities */}
        <div>
          <h3 className="text-xs text-gray-400 uppercase tracking-wide mb-3">
            Connected Entities ({entities.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {entities.map((entity) => (
              <span
                key={entity.id}
                className="px-3 py-1.5 bg-bg-primary text-white text-sm rounded-full border border-border-main"
              >
                {entity.name}
                {entity.type && (
                  <span className="ml-2 text-xs text-gray-400">({entity.type})</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <h3 className="text-xs text-gray-400 uppercase tracking-wide mb-3">Content</h3>
          <div className="bg-bg-primary rounded-lg p-4 border border-border-main">
            <p className="text-white whitespace-pre-wrap leading-relaxed">{memo.content}</p>
          </div>
        </div>
      </div>
    </BaseDrawer>
  )
}
