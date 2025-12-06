'use client'

import { useTheme } from '@/app/providers/ThemeProvider'
import { CheckCircle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import type { ImportExecuteResult } from '@/types/import'

interface ResultSummaryProps {
  result: ImportExecuteResult
  onReset: () => void
}

export default function ResultSummary({ result, onReset }: ResultSummaryProps) {
  const { theme } = useTheme()

  return (
    <div className="flex items-center justify-center py-12">
      <div
        className="rounded-lg p-8 max-w-md w-full border"
        style={{
          backgroundColor: theme.ui.cardBg,
          borderColor: theme.ui.border,
        }}
      >
        <div className="text-center mb-6">
          <CheckCircle
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: theme.ui.interactive.successText }}
          />
          <h3
            className="text-xl font-semibold mb-2"
            style={{ color: theme.ui.textPrimary }}
          >
            Import 완료!
          </h3>
          <p className="text-sm" style={{ color: theme.ui.textMuted }}>
            메모와 Entity가 성공적으로 저장되었습니다
          </p>
        </div>

        {/* 통계 */}
        <div
          className="rounded-lg p-4 space-y-2 mb-6"
          style={{ backgroundColor: theme.ui.secondaryBg }}
        >
          <div className="flex justify-between">
            <span style={{ color: theme.ui.textMuted }}>생성된 메모</span>
            <span style={{ color: theme.ui.textPrimary }}>
              {result.stats.memosCreated}개
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: theme.ui.textMuted }}>새 Entity</span>
            <span style={{ color: theme.ui.textPrimary }}>
              {result.stats.entitiesCreated}개
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: theme.ui.textMuted }}>기존 Entity 재사용</span>
            <span style={{ color: theme.ui.textPrimary }}>
              {result.stats.entitiesReused}개
            </span>
          </div>
        </div>

        {/* 버튼 */}
        <div className="space-y-2">
          <Link
            href="/"
            className="w-full px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            style={{
              backgroundColor: theme.ui.interactive.primaryBg,
              color: '#ffffff',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.ui.interactive.primaryBgHover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.ui.interactive.primaryBg
            }}
          >
            <Home className="w-4 h-4" />
            홈으로 이동
          </Link>
          <button
            onClick={onReset}
            className="w-full px-6 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            style={{
              backgroundColor: theme.ui.secondaryBg,
              color: theme.ui.textSecondary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            <RefreshCw className="w-4 h-4" />
            다시 Import 하기
          </button>
        </div>
      </div>
    </div>
  )
}
