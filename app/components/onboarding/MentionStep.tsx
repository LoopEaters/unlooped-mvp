'use client'

import { useTheme } from '@/app/providers/ThemeProvider'
import { getMentionHighlightClass, getEntityTypeColor } from '@/app/lib/theme'

export default function MentionStep() {
  const { theme } = useTheme()
  const personColor = getEntityTypeColor('person', theme)
  const projectColor = getEntityTypeColor('project', theme)

  return (
    <div>
      {/* Icon */}
      <div className="mb-6 flex justify-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
          style={{ backgroundColor: theme.ui.interactive.primaryBgLight }}
        >
          @
        </div>
      </div>

      {/* Title */}
      <h2 className={`text-3xl font-bold text-center mb-4 ${theme.ui.textPrimary}`}>
        @ Mention으로 연결하세요
      </h2>

      {/* Description */}
      <p className={`text-center text-lg mb-8 ${theme.ui.textSecondary}`}>
        @ 입력하면 Entity를 자동완성으로 멘션할 수 있어요.
      </p>

      {/* Mention Example */}
      <div
        className="mt-8 p-6 rounded-lg"
        style={{ backgroundColor: theme.ui.secondaryBg }}
      >
        <div
          className="p-4 rounded-md leading-relaxed"
          style={{ backgroundColor: theme.ui.cardBg }}
        >
          <p className={theme.ui.textPrimary}>
            오늘{' '}
            <span
              className="px-2 py-1 rounded font-medium"
              style={{
                backgroundColor: `${personColor.hex}20`,
                color: personColor.hex,
              }}
            >
              @김철수
            </span>
            와{' '}
            <span
              className="px-2 py-1 rounded font-medium"
              style={{
                backgroundColor: `${projectColor.hex}20`,
                color: projectColor.hex,
              }}
            >
              @Unlooped
            </span>{' '}
            프로젝트 논의
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 space-y-3">
        <div className="flex items-start gap-3">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
            style={{
              backgroundColor: theme.ui.interactive.primaryBgLight,
              color: theme.ui.interactive.primary,
            }}
          >
            1
          </div>
          <div>
            <p className={`text-sm ${theme.ui.textSecondary}`}>
              메모 작성 시 <span className={theme.ui.textPrimary}>@</span> 입력
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
            style={{
              backgroundColor: theme.ui.interactive.primaryBgLight,
              color: theme.ui.interactive.primary,
            }}
          >
            2
          </div>
          <div>
            <p className={`text-sm ${theme.ui.textSecondary}`}>
              자동완성 목록에서 Entity 선택
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
            style={{
              backgroundColor: theme.ui.interactive.primaryBgLight,
              color: theme.ui.interactive.primary,
            }}
          >
            3
          </div>
          <div>
            <p className={`text-sm ${theme.ui.textSecondary}`}>
              Entity를 클릭하면 관련 메모를 모두 볼 수 있어요
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
