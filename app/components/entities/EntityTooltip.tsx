'use client'

import { Group, Rect, Text } from 'react-konva'
import type { Database } from '@/types/supabase'
import { defaultTheme, getEntityTypeHexColor } from '@/app/lib/theme'

type Entity = Database['public']['Tables']['entity']['Row']

interface EntityTooltipProps {
  entity: Entity
  x: number
  y: number
  canvasWidth: number
  canvasHeight?: number
  scale?: number
}

export default function EntityTooltip({ entity, x, y, canvasWidth, canvasHeight = 1000, scale = 1 }: EntityTooltipProps) {
  const maxWidth = 280
  const padding = 16

  // Type 색상
  const typeColor = getEntityTypeHexColor(entity.type)

  // Description 텍스트 (없으면 기본 메시지)
  const description = entity.description || 'No description available'
  const maxDescriptionLength = 150
  const previewDescription =
    description.length > maxDescriptionLength
      ? description.slice(0, maxDescriptionLength) + '...'
      : description

  // 텍스트 높이 계산 (더 정확하게)
  const contentWidth = maxWidth - padding * 2
  const descFontSize = 12
  const lineHeight = 1.5

  // Description 높이 계산
  let totalCharWidth = 0
  for (const char of previewDescription) {
    totalCharWidth += char.charCodeAt(0) > 127 ? descFontSize * 0.9 : descFontSize * 0.6
  }
  const descLines = Math.ceil(totalCharWidth / contentWidth)
  const descHeight = descLines * descFontSize * lineHeight + 10

  // 각 섹션 높이
  const labelHeight = 10
  const labelMargin = 8
  const nameHeight = 16
  const typeHeight = 14
  const spacing = 8
  const hintHeight = 12

  const totalHeight =
    padding + // top padding
    labelHeight +
    labelMargin +
    nameHeight +
    spacing +
    typeHeight +
    spacing +
    descHeight +
    spacing +
    hintHeight +
    padding // bottom padding

  // 최대 높이 제한
  const maxHeight = 350
  const finalHeight = Math.min(totalHeight, maxHeight)

  // 툴팁이 화면 밖으로 나가지 않도록 조정
  let tooltipX = x + 20
  if (tooltipX + maxWidth > canvasWidth) {
    tooltipX = x - maxWidth - 20
  }
  if (tooltipX < 0) {
    tooltipX = 10
  }

  let tooltipY = y - finalHeight / 2
  if (tooltipY < 0) {
    tooltipY = 10
  }
  if (tooltipY + finalHeight > canvasHeight) {
    tooltipY = canvasHeight - finalHeight - 10
  }

  return (
    <Group x={tooltipX} y={tooltipY} scaleX={1 / scale} scaleY={1 / scale} listening={false}>
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

      {/* "entity" 레이블 */}
      <Text
        x={padding}
        y={padding}
        text="ENTITY"
        fontSize={9}
        fill={defaultTheme.tooltip.hint}
        fontStyle="600"
        letterSpacing={1}
      />

      {/* Entity 이름 */}
      <Text
        x={padding}
        y={padding + labelHeight + labelMargin}
        text={entity.name}
        fontSize={14}
        fill="#FFFFFF"
        fontStyle="600"
        width={contentWidth}
      />

      {/* Type Badge */}
      <Group y={padding + labelHeight + labelMargin + nameHeight + spacing}>
        <Rect
          x={padding}
          y={0}
          width={entity.type ? entity.type.length * 7 + 12 : 60}
          height={typeHeight}
          fill={typeColor}
          opacity={0.25}
          cornerRadius={4}
        />
        <Text
          x={padding + 6}
          y={2}
          text={entity.type || 'unknown'}
          fontSize={9}
          fill={typeColor}
          fontStyle="600"
        />
      </Group>

      {/* Description */}
      <Text
        x={padding}
        y={padding + labelHeight + labelMargin + nameHeight + spacing + typeHeight + spacing}
        text={previewDescription}
        fontSize={descFontSize}
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
