'use client'

import { useTheme } from '@/app/providers/ThemeProvider'
import { Calendar, Hash, CheckCircle } from 'lucide-react'
import type { BulkImportParseResult } from '@/types/import'

interface ParsePreviewProps {
  result: BulkImportParseResult
  onBack: () => void
  onExecute: () => void
  isLoading: boolean
  error: string | null
}

export default function ParsePreview({ result, onBack, onExecute, isLoading, error }: ParsePreviewProps) {
  const { theme } = useTheme()

  return (
    <div className="space-y-4">
      {/* 통계 요약 */}
      <div className="grid grid-cols-3 gap-4">
        <div
          className="rounded-lg p-4 border"
          style={{
            backgroundColor: theme.ui.cardBg,
            borderColor: theme.ui.border,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4" style={{ color: theme.ui.textMuted }} />
            <span className="text-sm" style={{ color: theme.ui.textMuted }}>
              메모 개수
            </span>
          </div>
          <p className="text-2xl font-semibold" style={{ color: theme.ui.textPrimary }}>
            {result.stats.totalMemos}개
          </p>
        </div>

        <div
          className="rounded-lg p-4 border"
          style={{
            backgroundColor: theme.ui.cardBg,
            borderColor: theme.ui.border,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4" style={{ color: theme.ui.textMuted }} />
            <span className="text-sm" style={{ color: theme.ui.textMuted }}>
              Entity 개수
            </span>
          </div>
          <p className="text-2xl font-semibold" style={{ color: theme.ui.textPrimary }}>
            {result.stats.uniqueEntities}개
          </p>
        </div>

        <div
          className="rounded-lg p-4 border"
          style={{
            backgroundColor: theme.ui.cardBg,
            borderColor: theme.ui.border,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4" style={{ color: theme.ui.textMuted }} />
            <span className="text-sm" style={{ color: theme.ui.textMuted }}>
              날짜 범위
            </span>
          </div>
          <p className="text-sm font-medium" style={{ color: theme.ui.textPrimary }}>
            {result.stats.dateRange[0]} ~ {result.stats.dateRange[1]}
          </p>
        </div>
      </div>

      {/* 메모 미리보기 */}
      <div
        className="rounded-lg p-4 border"
        style={{
          backgroundColor: theme.ui.cardBg,
          borderColor: theme.ui.border,
        }}
      >
        <h3 className="font-medium mb-3" style={{ color: theme.ui.textPrimary }}>
          파싱 결과 미리보기
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {result.memos.map((memo, idx) => (
            <div
              key={idx}
              className="rounded-lg p-3 border"
              style={{
                backgroundColor: theme.ui.secondaryBg,
                borderColor: theme.ui.borderSubtle,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs" style={{ color: theme.ui.textMuted }}>
                  {memo.date}
                </span>
                <span className="text-xs" style={{ color: theme.ui.textMuted }}>
                  {memo.entities.length}개 Entity
                </span>
              </div>
              <p
                className="text-sm line-clamp-2"
                style={{ color: theme.ui.textSecondary }}
              >
                {memo.content}
              </p>
              {memo.entities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {memo.entities.map((entity, eidx) => (
                    <span
                      key={eidx}
                      className="px-2 py-0.5 rounded text-xs"
                      style={{
                        backgroundColor: theme.ui.interactive.primaryBgLight,
                        color: theme.ui.interactive.primaryText,
                      }}
                    >
                      @{entity}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div
          className="rounded-lg p-3 border"
          style={{
            backgroundColor: theme.ui.error.bg,
            borderColor: `${theme.ui.error.text}33`,
          }}
        >
          <p style={{ color: theme.ui.error.text }}>{error}</p>
        </div>
      )}

      {/* 버튼 */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          style={{
            backgroundColor: theme.ui.secondaryBg,
            color: theme.ui.textSecondary,
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.opacity = '0.8'
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.opacity = '1'
            }
          }}
        >
          뒤로
        </button>
        <button
          onClick={onExecute}
          disabled={isLoading}
          className="px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          style={{
            backgroundColor: theme.ui.interactive.primaryBg,
            color: '#ffffff',
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = theme.ui.interactive.primaryBgHover
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = theme.ui.interactive.primaryBg
            }
          }}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              저장 중...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Import 시작
            </>
          )}
        </button>
      </div>
    </div>
  )
}
