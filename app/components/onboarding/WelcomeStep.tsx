'use client'

import { useTheme } from '@/app/providers/ThemeProvider'
import { getEntityTypeColor } from '@/app/lib/theme'

export default function WelcomeStep() {
  const { theme } = useTheme()
  const personColor = getEntityTypeColor('person', theme)
  const projectColor = getEntityTypeColor('project', theme)
  const eventColor = getEntityTypeColor('event', theme)

  return (
    <div className="text-center">
      {/* Welcome Icon */}
      <div className="mb-6 flex justify-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
          style={{ backgroundColor: theme.ui.interactive.primaryBgLight }}
        >
          🎉
        </div>
      </div>

      {/* Title */}
      <h2 className={`text-3xl font-bold mb-4 ${theme.ui.textPrimary}`}>
        Unlooped에 오신 것을 환영합니다!
      </h2>

      {/* Description */}
      <p className={`text-lg mb-8 ${theme.ui.textSecondary}`}>
        간단한 3단계로 핵심 기능을 소개해드릴게요.
      </p>

      {/* Entity Types Preview */}
      <div className="mt-8">
        <p className={`text-sm mb-4 ${theme.ui.textMuted}`}>
          세 가지 Entity 타입으로 정보를 구분합니다
        </p>
        <div className="flex justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{
                backgroundColor: `${personColor.hex}20`,
                color: personColor.hex,
              }}
            >
              👤
            </div>
            <span className={`text-sm ${theme.ui.textSecondary}`}>Person</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{
                backgroundColor: `${projectColor.hex}20`,
                color: projectColor.hex,
              }}
            >
              📁
            </div>
            <span className={`text-sm ${theme.ui.textSecondary}`}>Project</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{
                backgroundColor: `${eventColor.hex}20`,
                color: eventColor.hex,
              }}
            >
              📅
            </div>
            <span className={`text-sm ${theme.ui.textSecondary}`}>Event</span>
          </div>
        </div>
      </div>
    </div>
  )
}
