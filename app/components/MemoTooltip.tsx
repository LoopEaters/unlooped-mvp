'use client'

import { Group, Rect, Text } from 'react-konva'
import type { Database } from '@/types/supabase'

type Memo = Database['public']['Tables']['memo']['Row']

interface MemoTooltipProps {
  memo: Memo
  x: number
  y: number
  canvasWidth: number
}

export default function MemoTooltip({ memo, x, y, canvasWidth }: MemoTooltipProps) {
  const maxWidth = 300
  const padding = 12
  const maxContentLength = 150

  // 내용 미리보기 (길면 자르기)
  const previewContent =
    memo.content.length > maxContentLength
      ? memo.content.slice(0, maxContentLength) + '...'
      : memo.content

  // 날짜 포맷
  const dateStr = memo.created_at
    ? new Date(memo.created_at).toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Unknown date'

  // 텍스트 높이 계산 (대략)
  const lineHeight = 16
  const contentLines = Math.ceil(previewContent.length / 40) // 대략 40자/줄
  const contentHeight = contentLines * lineHeight

  const totalHeight = padding * 3 + 14 + contentHeight

  // 툴팁이 화면 밖으로 나가지 않도록 조정
  let tooltipX = x + 15
  if (tooltipX + maxWidth > canvasWidth) {
    tooltipX = x - maxWidth - 15
  }

  const tooltipY = y - totalHeight / 2

  return (
    <Group x={tooltipX} y={tooltipY}>
      {/* 배경 */}
      <Rect
        width={maxWidth}
        height={totalHeight}
        fill="#1F2937"
        cornerRadius={8}
        shadowBlur={10}
        shadowColor="black"
        shadowOpacity={0.3}
        stroke="#374151"
        strokeWidth={1}
      />

      {/* 날짜 */}
      <Text
        x={padding}
        y={padding}
        text={dateStr}
        fontSize={11}
        fill="#9CA3AF"
        width={maxWidth - padding * 2}
      />

      {/* 내용 */}
      <Text
        x={padding}
        y={padding * 2 + 14}
        text={previewContent}
        fontSize={13}
        fill="#FFFFFF"
        width={maxWidth - padding * 2}
        lineHeight={1.4}
      />

      {/* 클릭 힌트 */}
      <Text
        x={padding}
        y={totalHeight - padding - 12}
        text="Click to see details"
        fontSize={10}
        fill="#6B7280"
        fontStyle="italic"
        width={maxWidth - padding * 2}
      />
    </Group>
  )
}
