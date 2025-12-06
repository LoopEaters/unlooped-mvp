'use client'

import { defaultTheme } from '@/app/lib/theme'
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
  return (
    <div className="space-y-4">
      {/* 통계 요약 */}
      <div className="grid grid-cols-3 gap-4">
        <div className={`${defaultTheme.ui.cardBg} border ${defaultTheme.ui.border} rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className={`w-4 h-4 ${defaultTheme.ui.textMuted}`} />
            <span className={`${defaultTheme.ui.textMuted} text-sm`}>메모 개수</span>
          </div>
          <p className={`${defaultTheme.ui.textPrimary} text-2xl font-semibold`}>
            {result.stats.totalMemos}개
          </p>
        </div>

        <div className={`${defaultTheme.ui.cardBg} border ${defaultTheme.ui.border} rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <Hash className={`w-4 h-4 ${defaultTheme.ui.textMuted}`} />
            <span className={`${defaultTheme.ui.textMuted} text-sm`}>Entity 개수</span>
          </div>
          <p className={`${defaultTheme.ui.textPrimary} text-2xl font-semibold`}>
            {result.stats.uniqueEntities}개
          </p>
        </div>

        <div className={`${defaultTheme.ui.cardBg} border ${defaultTheme.ui.border} rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className={`w-4 h-4 ${defaultTheme.ui.textMuted}`} />
            <span className={`${defaultTheme.ui.textMuted} text-sm`}>날짜 범위</span>
          </div>
          <p className={`${defaultTheme.ui.textPrimary} text-sm font-medium`}>
            {result.stats.dateRange[0]} ~ {result.stats.dateRange[1]}
          </p>
        </div>
      </div>

      {/* 메모 미리보기 */}
      <div className={`${defaultTheme.ui.cardBg} border ${defaultTheme.ui.border} rounded-lg p-4`}>
        <h3 className={`${defaultTheme.ui.textPrimary} font-medium mb-3`}>파싱 결과 미리보기</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {result.memos.map((memo, idx) => (
            <div
              key={idx}
              className={`${defaultTheme.ui.secondaryBg} border ${defaultTheme.ui.borderSubtle} rounded-lg p-3`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`${defaultTheme.ui.textMuted} text-xs`}>{memo.date}</span>
                <span className={`${defaultTheme.ui.textMuted} text-xs`}>
                  {memo.entities.length}개 Entity
                </span>
              </div>
              <p className={`${defaultTheme.ui.textSecondary} text-sm line-clamp-2`}>
                {memo.content}
              </p>
              {memo.entities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {memo.entities.map((entity, eidx) => (
                    <span
                      key={eidx}
                      className={`${defaultTheme.ui.interactive.primaryBgLight} ${defaultTheme.ui.interactive.primaryText} px-2 py-0.5 rounded text-xs`}
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
        <div className={`${defaultTheme.ui.error.bg} border border-red-500/20 rounded-lg p-3`}>
          <p className={defaultTheme.ui.error.text}>{error}</p>
        </div>
      )}

      {/* 버튼 */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={isLoading}
          className={`px-6 py-2 ${defaultTheme.ui.secondaryBg} ${defaultTheme.ui.buttonHover} ${defaultTheme.ui.textSecondary} rounded-lg transition-colors disabled:opacity-50`}
        >
          뒤로
        </button>
        <button
          onClick={onExecute}
          disabled={isLoading}
          className={`px-6 py-2 ${defaultTheme.ui.interactive.primaryBg} ${defaultTheme.ui.interactive.primaryBgHover} text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2`}
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
