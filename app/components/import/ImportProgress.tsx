'use client'

import { defaultTheme } from '@/app/lib/theme'

export default function ImportProgress() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className={`${defaultTheme.ui.cardBg} border ${defaultTheme.ui.border} rounded-lg p-8 max-w-md w-full`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className={`${defaultTheme.ui.textPrimary} text-lg font-medium mb-2`}>
            Import 진행 중...
          </h3>
          <p className={`${defaultTheme.ui.textMuted} text-sm`}>
            메모와 Entity를 데이터베이스에 저장하고 있습니다
          </p>
        </div>
      </div>
    </div>
  )
}
