'use client'

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import type { Database } from '@/types/supabase'

type Entity = Database['public']['Tables']['entity']['Row']

interface MentionListProps {
  items: Entity[]
  command: (item: { id: string; label: string; type?: string }) => void
}

export const MentionList = forwardRef<any, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  // 🔧 FIX: items 변경 시에만 selectedIndex 초기화 (무한 렌더링 방지)
  useEffect(() => {
    console.log('🔍 [MentionList] items:', props.items.length)
    setSelectedIndex(0)
  }, [props.items.length]) // items 자체가 아니라 length만 dependency로

  const selectItem = (index: number) => {
    const item = props.items[index]

    if (item) {
      props.command({
        id: item.name, // entity name을 id로 사용
        label: item.name,
        type: item.type || undefined,
      })
    }
  }

  const upHandler = () => {
    setSelectedIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : props.items.length - 1
    )
  }

  const downHandler = () => {
    setSelectedIndex((prevIndex) =>
      prevIndex < props.items.length - 1 ? prevIndex + 1 : 0
    )
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      console.log('⌨️ [MentionList] Key pressed:', event.key)

      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter' || event.key === 'Tab' || event.key === ' ') {
        console.log('✅ [MentionList] Confirming selection at index:', selectedIndex)
        event.preventDefault()
        enterHandler()
        return true
      }

      return false
    },
  }))

  if (props.items.length === 0) {
    return (
      <div className="bg-bg-card border border-border-main rounded-lg shadow-lg p-2 min-w-[200px]">
        <div className="text-text-muted text-sm px-3 py-2">결과 없음</div>
      </div>
    )
  }

  return (
    <div className="bg-bg-card border border-border-main rounded-lg shadow-lg overflow-hidden min-w-[200px]">
      {props.items.map((item, index) => {
        // 새 entity인지 확인
        const isNewEntity = item.id.startsWith('new-')

        // Entity type별 색상
        const typeColorMap: Record<string, string> = {
          project: 'text-color-mention-project',
          person: 'text-color-mention-person',
          event: 'text-color-mention-event',
        }
        const colorClass = item.type ? typeColorMap[item.type] || 'text-blue-500' : 'text-blue-500'

        return (
          <button
            key={item.id}
            className={`
              w-full px-3 py-2 text-left text-sm transition-colors
              ${
                index === selectedIndex
                  ? 'bg-blue-500/20 text-white'
                  : 'text-text-secondary hover:bg-bg-secondary'
              }
            `}
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <span className={colorClass}>@{item.name}</span>
            {isNewEntity ? (
              <span className="text-text-muted text-xs ml-2">(새로 생성)</span>
            ) : item.type ? (
              <span className="text-text-muted text-xs ml-2">({item.type})</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
})

MentionList.displayName = 'MentionList'
