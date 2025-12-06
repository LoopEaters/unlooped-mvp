'use client'

import { useTheme } from '@/app/providers/ThemeProvider'

export default function TimelineStep() {
  const { theme } = useTheme()

  return (
    <div>
      {/* Icon */}
      <div className="mb-6 flex justify-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
          style={{ backgroundColor: theme.ui.interactive.primaryBgLight }}
        >
          📊
        </div>
      </div>

      {/* Title */}
      <h2 className={`text-3xl font-bold text-center mb-4 ${theme.ui.textPrimary}`}>
        Timeline으로 한눈에 파악하세요
      </h2>

      {/* Description */}
      <p className={`text-center text-lg mb-8 ${theme.ui.textSecondary}`}>
        모든 메모와 활동이 Timeline에 자동으로 기록됩니다.
      </p>

      {/* Timeline Illustration */}
      <div
        className="mt-8 p-6 rounded-lg"
        style={{ backgroundColor: theme.ui.secondaryBg }}
      >
        <div className="space-y-3">
          {[
            { time: '오후 3:00', content: '프로젝트 회의 참석' },
            { time: '오후 2:30', content: '@김철수와 미팅' },
            { time: '오후 1:15', content: '@Unlooped 기능 구현 완료' },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-3 rounded-md"
              style={{ backgroundColor: theme.ui.cardBg }}
            >
              <div
                className={`text-xs font-mono ${theme.ui.textMuted} whitespace-nowrap pt-1`}
              >
                {item.time}
              </div>
              <div className={`flex-1 ${theme.ui.textSecondary}`}>
                {item.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hint */}
      <p className={`text-center text-sm mt-6 ${theme.ui.textMuted}`}>
        시간순으로 정렬되어 쉽게 찾을 수 있어요
      </p>
    </div>
  )
}
