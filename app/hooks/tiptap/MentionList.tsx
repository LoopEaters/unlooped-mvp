'use client'

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { useTheme } from '@/app/providers/ThemeProvider'
import { getEntityTypeColor } from '@/app/lib/theme'
import type { Database } from '@/types/supabase'

type Entity = Database['public']['Tables']['entity']['Row']

interface MentionListProps {
  items: Entity[]
  command: (item: { id: string; label: string; type?: string }) => void
}

export const MentionList = forwardRef<any, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { theme } = useTheme()

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
      <div className={`${theme.ui.cardBg} ${theme.ui.border} rounded-lg shadow-lg p-2 min-w-[200px]`}>
        <div className={`${theme.ui.textMuted} text-sm px-3 py-2`}>결과 없음</div>
      </div>
    )
  }

  return (
    <div className={`${theme.ui.cardBg} ${theme.ui.border} rounded-lg shadow-lg overflow-hidden min-w-[200px]`}>
      {props.items.map((item, index) => {
        // 새 entity인지 확인
        const isNewEntity = item.id.startsWith('new-')

        // Entity type별 색상 (테마 시스템 사용)
        const entityColor = getEntityTypeColor(item.type, theme)

        return (
          <button
            key={item.id}
            className={`
              w-full px-3 py-2 text-left text-sm transition-colors
              ${
                index === selectedIndex
                  ? `${theme.ui.interactive.primaryBgLight} ${theme.ui.textPrimary}`
                  : `${theme.ui.textSecondary} ${theme.ui.buttonHover}`
              }
            `}
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <span style={{ color: entityColor.hex }}>@{item.name}</span>
            {isNewEntity ? (
              <span className={`${theme.ui.textMuted} text-xs ml-2`}>(새로 생성)</span>
            ) : item.type ? (
              <span className={`${theme.ui.textMuted} text-xs ml-2`}>({item.type})</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
})

MentionList.displayName = 'MentionList'
