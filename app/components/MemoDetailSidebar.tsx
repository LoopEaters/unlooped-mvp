'use client'

import { X } from 'lucide-react'
import type { Database } from '@/types/supabase'

type Memo = Database['public']['Tables']['memo']['Row']
type Entity = Database['public']['Tables']['entity']['Row']

interface MemoDetailSidebarProps {
  memo: Memo
  entities: Entity[]
  onClose: () => void
}

export default function MemoDetailSidebar({ memo, entities, onClose }: MemoDetailSidebarProps) {
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
    <div className="w-96 bg-bg-secondary border-l border-border-main flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-main">
        <h2 className="text-lg text-white font-semibold">Memo Details</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-bg-primary"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
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

      {/* Footer Actions */}
      <div className="px-6 py-4 border-t border-border-main">
        <button className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">
          Edit Memo
        </button>
      </div>
    </div>
  )
}
