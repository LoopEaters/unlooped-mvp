'use client'

import { Group, Rect, Text } from 'react-konva'
import type { Database } from '@/types/supabase'
import { getEntityTypeHexColor } from '@/app/lib/theme'
import { useTheme } from '@/app/providers/ThemeProvider'
import { useMemo } from 'react'

type Memo = Database['public']['Tables']['memo']['Row']
type Entity = Database['public']['Tables']['entity']['Row']

interface MemoTooltipProps {
  memo: Memo
  x: number
  y: number
  canvasWidth: number
  canvasHeight?: number
  entities?: Entity[] // 멘션 하이라이트용
  scale?: number // 확대/축소 비율
}

export default function MemoTooltip({ memo, x, y, canvasWidth, canvasHeight = 1000, entities = [], scale = 1 }: MemoTooltipProps) {
  const { theme } = useTheme()
  const maxWidth = 320
  const padding = 16
  const maxContentLength = 200

  // 내용 미리보기 (길면 자르기)
  const previewContent =
    memo.content.length > maxContentLength
      ? memo.content.slice(0, maxContentLength) + '...'
      : memo.content

  // Entity 맵 생성
  const entityMap = new Map<string, Entity>()
  entities.forEach(entity => {
    entityMap.set(entity.name, entity)
  })

  // 텍스트 파싱: @entity_name을 찾아서 분할
  const parseContent = (text: string): Array<{ text: string; entityType?: string }> => {
    const entityPattern = /@(\S+)/g
    const parts: Array<{ text: string; entityType?: string }> = []
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = entityPattern.exec(text)) !== null) {
      const matchStart = match.index
      const matchEnd = entityPattern.lastIndex
      const entityName = match[1]

      // 이전 일반 텍스트 추가
      if (matchStart > lastIndex) {
        parts.push({ text: text.substring(lastIndex, matchStart) })
      }

      // Entity 멘션 추가
      const entity = entityMap.get(entityName)
      parts.push({
        text: `@${entityName}`,
        entityType: entity?.type || 'unknown'
      })

      lastIndex = matchEnd
    }

    // 마지막 일반 텍스트 추가
    if (lastIndex < text.length) {
      parts.push({ text: text.substring(lastIndex) })
    }

    return parts.length > 0 ? parts : [{ text }]
  }

  const contentParts = parseContent(previewContent)

  // 멘션된 entities 추출 및 너비 계산
  const mentionedEntitiesWithWidth = useMemo(() => {
    const mentioned = contentParts
      .filter(part => part.entityType)
      .map(part => ({
        text: part.text,
        type: part.entityType!
      }))

    // Canvas measureText로 정확한 너비 계산
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.font = '600 9px sans-serif'
        return mentioned.map(mention => ({
          ...mention,
          width: ctx.measureText(mention.text).width + 12 // 좌우 padding
        }))
      }
    }

    // Fallback: 대략적인 계산
    return mentioned.map(mention => ({
      ...mention,
      width: mention.text.length * 7 + 12
    }))
  }, [contentParts])

  // 날짜 포맷
  const dateStr = memo.created_at
    ? new Date(memo.created_at).toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Unknown date'

  // 텍스트 높이 계산 (Canvas measureText 사용)
  const contentWidth = maxWidth - padding * 2
  const fontSize = 13
  const lineHeight = 1.5

  // Canvas measureText로 정확한 너비 계산
  let contentActualWidth = contentWidth // fallback
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.font = '13px sans-serif' // fontSize와 동일하게
      contentActualWidth = ctx.measureText(previewContent).width
    }
  }
  const contentLines = Math.ceil(contentActualWidth / contentWidth)
  const contentHeight = contentLines * fontSize * lineHeight + 10 // 여유 공간 추가

  // 각 섹션 높이
  const dateHeight = 14
  const dividerHeight = 1
  const dividerMargin = 10
  const hintHeight = 12
  const spacing = 8
  const mentionHeight = mentionedEntitiesWithWidth.length > 0 ? (mentionedEntitiesWithWidth.length * 20 + spacing + 14) : 0

  const totalHeight =
    padding + // top padding
    dateHeight +
    dividerMargin +
    dividerHeight +
    dividerMargin +
    contentHeight +
    spacing +
    mentionHeight + // 멘션 섹션
    (mentionHeight > 0 ? spacing : 0) +
    hintHeight +
    padding // bottom padding

  // 최대 높이 제한 (더 넉넉하게)
  const maxHeight = 400
  const finalHeight = Math.min(totalHeight, maxHeight)

  // 툴팁이 화면 밖으로 나가지 않도록 조정
  let tooltipX = x + 20
  if (tooltipX + maxWidth > canvasWidth) {
    tooltipX = x - maxWidth - 20
  }
  // 왼쪽도 벗어나지 않도록
  if (tooltipX < 0) {
    tooltipX = 10
  }

  let tooltipY = y - finalHeight / 2
  // 위쪽 벗어남 방지
  if (tooltipY < 0) {
    tooltipY = 10
  }
  // 아래쪽 벗어남 방지
  if (tooltipY + finalHeight > canvasHeight) {
    tooltipY = canvasHeight - finalHeight - 10
  }

  return (
    <Group x={tooltipX} y={tooltipY} scaleX={1 / scale} scaleY={1 / scale} listening={false}>
      {/* 배경 */}
      <Rect
        width={maxWidth}
        height={finalHeight}
        fill={theme.tooltip.background}
        cornerRadius={10}
        shadowBlur={16}
        shadowColor={theme.tooltip.shadow}
        shadowOpacity={0.5}
        shadowOffsetY={4}
        stroke={theme.tooltip.border}
        strokeWidth={1}
      />

      {/* 날짜 */}
      <Text
        x={padding}
        y={padding}
        text={dateStr}
        fontSize={11}
        fill={theme.tooltip.title}
        fontStyle="500"
        width={contentWidth}
      />

      {/* 구분선 */}
      <Rect
        x={padding}
        y={padding + dateHeight + dividerMargin}
        width={contentWidth}
        height={dividerHeight}
        fill={theme.tooltip.divider}
        opacity={0.8}
      />

      {/* 내용 */}
      <Text
        x={padding}
        y={padding + dateHeight + dividerMargin * 2 + dividerHeight}
        text={previewContent}
        fontSize={fontSize}
        fill={theme.tooltip.text}
        width={contentWidth}
        lineHeight={lineHeight}
        wrap="word"
      />

      {/* 멘션된 Entities */}
      {mentionedEntitiesWithWidth.length > 0 && (
        <>
          <Text
            x={padding}
            y={padding + dateHeight + dividerMargin * 2 + dividerHeight + contentHeight + spacing}
            text="Mentions:"
            fontSize={10}
            fill={theme.tooltip.hint}
            fontStyle="600"
          />
          {mentionedEntitiesWithWidth.map((mention, i) => {
            const color = getEntityTypeHexColor(mention.type, theme)
            const yPos = padding + dateHeight + dividerMargin * 2 + dividerHeight + contentHeight + spacing + 14 + i * 20

            return (
              <Group key={`mention-${i}`}>
                {/* 배경 박스 */}
                <Rect
                  x={padding}
                  y={yPos}
                  width={mention.width}
                  height={18}
                  fill={color}
                  opacity={0.15}
                  cornerRadius={4}
                />
                {/* 텍스트 */}
                <Text
                  x={padding + 6}
                  y={yPos + 4}
                  text={mention.text}
                  fontSize={9}
                  fill={color}
                  fontStyle="600"
                  align="left"
                  verticalAlign="middle"
                />
              </Group>
            )
          })}
        </>
      )}

      {/* 클릭 힌트 */}
      <Text
        x={padding}
        y={finalHeight - padding - hintHeight}
        text="Click to see full details →"
        fontSize={10}
        fill={theme.tooltip.hint}
        fontStyle="italic"
        width={contentWidth}
      />
    </Group>
  )
}
