'use client'

import { Group, Rect, Text } from 'react-konva'
import type { Database } from '@/types/supabase'
import { defaultTheme } from '@/app/lib/theme'

type Memo = Database['public']['Tables']['memo']['Row']

interface MemoTooltipProps {
  memo: Memo
  x: number
  y: number
  canvasWidth: number
}

export default function MemoTooltip({ memo, x, y, canvasWidth }: MemoTooltipProps) {
  const maxWidth = 320
  const padding = 16
  const maxContentLength = 200

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

  // 텍스트 높이 계산 (더 정확하게)
  const contentWidth = maxWidth - padding * 2
  const fontSize = 13
  const lineHeight = 1.5
  const avgCharWidth = fontSize * 0.6 // 평균 글자 너비
  const charsPerLine = Math.floor(contentWidth / avgCharWidth)
  const contentLines = Math.ceil(previewContent.length / charsPerLine)
  const contentHeight = contentLines * fontSize * lineHeight

  // 각 섹션 높이
  const dateHeight = 14
  const dividerHeight = 1
  const dividerMargin = 10
  const hintHeight = 12
  const spacing = 8

  const totalHeight =
    padding + // top padding
    dateHeight +
    dividerMargin +
    dividerHeight +
    dividerMargin +
    contentHeight +
    spacing +
    hintHeight +
    padding // bottom padding

  // 최대 높이 제한
  const maxHeight = 250
  const finalHeight = Math.min(totalHeight, maxHeight)

  // 툴팁이 화면 밖으로 나가지 않도록 조정
  let tooltipX = x + 20
  if (tooltipX + maxWidth > canvasWidth) {
    tooltipX = x - maxWidth - 20
  }

  const tooltipY = y - finalHeight / 2

  return (
    <Group x={tooltipX} y={tooltipY}>
      {/* 배경 */}
      <Rect
        width={maxWidth}
        height={finalHeight}
        fill={defaultTheme.tooltip.background}
        cornerRadius={10}
        shadowBlur={16}
        shadowColor={defaultTheme.tooltip.shadow}
        shadowOpacity={0.5}
        shadowOffsetY={4}
        stroke={defaultTheme.tooltip.border}
        strokeWidth={1}
      />

      {/* 날짜 */}
      <Text
        x={padding}
        y={padding}
        text={dateStr}
        fontSize={11}
        fill={defaultTheme.tooltip.title}
        fontStyle="500"
        width={contentWidth}
      />

      {/* 구분선 */}
      <Rect
        x={padding}
        y={padding + dateHeight + dividerMargin}
        width={contentWidth}
        height={dividerHeight}
        fill={defaultTheme.tooltip.divider}
        opacity={0.8}
      />

      {/* 내용 */}
      <Text
        x={padding}
        y={padding + dateHeight + dividerMargin * 2 + dividerHeight}
        text={previewContent}
        fontSize={fontSize}
        fill={defaultTheme.tooltip.text}
        width={contentWidth}
        lineHeight={lineHeight}
        wrap="word"
      />

      {/* 클릭 힌트 */}
      <Text
        x={padding}
        y={finalHeight - padding - hintHeight}
        text="Click to see full details →"
        fontSize={10}
        fill={defaultTheme.tooltip.hint}
        fontStyle="italic"
        width={contentWidth}
      />
    </Group>
  )
}
