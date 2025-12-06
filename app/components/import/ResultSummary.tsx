'use client'

import { defaultTheme } from '@/app/lib/theme'
import { CheckCircle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import type { ImportExecuteResult } from '@/types/import'

interface ResultSummaryProps {
  result: ImportExecuteResult
  onReset: () => void
}

export default function ResultSummary({ result, onReset }: ResultSummaryProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className={`${defaultTheme.ui.cardBg} border ${defaultTheme.ui.border} rounded-lg p-8 max-w-md w-full`}>
        <div className="text-center mb-6">
          <CheckCircle className={`w-16 h-16 ${defaultTheme.ui.interactive.successText} mx-auto mb-4`} />
          <h3 className={`${defaultTheme.ui.textPrimary} text-xl font-semibold mb-2`}>
            Import 완료!
          </h3>
          <p className={`${defaultTheme.ui.textMuted} text-sm`}>
            메모와 Entity가 성공적으로 저장되었습니다
          </p>
        </div>

        {/* 통계 */}
        <div className={`${defaultTheme.ui.secondaryBg} rounded-lg p-4 space-y-2 mb-6`}>
          <div className="flex justify-between">
            <span className={defaultTheme.ui.textMuted}>생성된 메모</span>
            <span className={defaultTheme.ui.textPrimary}>{result.stats.memosCreated}개</span>
          </div>
          <div className="flex justify-between">
            <span className={defaultTheme.ui.textMuted}>새 Entity</span>
            <span className={defaultTheme.ui.textPrimary}>{result.stats.entitiesCreated}개</span>
          </div>
          <div className="flex justify-between">
            <span className={defaultTheme.ui.textMuted}>기존 Entity 재사용</span>
            <span className={defaultTheme.ui.textPrimary}>{result.stats.entitiesReused}개</span>
          </div>
        </div>

        {/* 버튼 */}
        <div className="space-y-2">
          <Link
            href="/"
            className={`w-full px-6 py-2 ${defaultTheme.ui.interactive.primaryBg} ${defaultTheme.ui.interactive.primaryBgHover} text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}
          >
            <Home className="w-4 h-4" />
            홈으로 이동
          </Link>
          <button
            onClick={onReset}
            className={`w-full px-6 py-2 ${defaultTheme.ui.secondaryBg} ${defaultTheme.ui.buttonHover} ${defaultTheme.ui.textSecondary} rounded-lg transition-colors flex items-center justify-center gap-2`}
          >
            <RefreshCw className="w-4 h-4" />
            다시 Import 하기
          </button>
        </div>
      </div>
    </div>
  )
}
