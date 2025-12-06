'use client'

import { useTheme } from '@/app/providers/ThemeProvider'
import { getEntityTypeColor } from '@/app/lib/theme'

export default function FeaturesSection() {
  const { theme } = useTheme()

  const personColor = getEntityTypeColor('person', theme)
  const projectColor = getEntityTypeColor('project', theme)
  const eventColor = getEntityTypeColor('event', theme)

  const features = [
    {
      icon: '👤',
      title: 'Entity',
      description: 'Person, Project, Event를 구분하여 관리',
      color: personColor.hex,
      bgColor: `${personColor.hex}33`, // 20% opacity = 33 in hex
    },
    {
      icon: '📊',
      title: 'Timeline',
      description: '모든 활동을 시간순으로 시각화',
      color: theme.ui.interactive.primary,
      bgColor: theme.ui.interactive.primaryBgLight,
    },
    {
      icon: '@',
      title: 'Mention',
      description: '@로 Entity를 연결하고 추적',
      color: projectColor.hex,
      bgColor: `${projectColor.hex}33`, // 20% opacity = 33 in hex
    },
  ]

  return (
    <section className="px-6 py-20">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <h2
          className="text-3xl md:text-4xl font-bold text-center mb-4"
          style={{ color: theme.ui.textPrimary }}
        >
          주요 기능
        </h2>
        <p
          className="text-center mb-16 max-w-2xl mx-auto"
          style={{ color: theme.ui.textSecondary }}
        >
          Unlooped는 세 가지 핵심 기능으로 당신의 생각을 정리합니다
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl transition-all hover:scale-105 border"
              style={{
                backgroundColor: theme.ui.cardBg,
                borderColor: theme.ui.border,
              }}
            >
              {/* Icon */}
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-6"
                style={{
                  backgroundColor: feature.bgColor,
                  color: feature.color,
                }}
              >
                {feature.icon}
              </div>

              {/* Title */}
              <h3
                className="text-xl font-semibold mb-3"
                style={{ color: theme.ui.textPrimary }}
              >
                {feature.title}
              </h3>

              {/* Description */}
              <p style={{ color: theme.ui.textSecondary }}>{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Entity Types Preview */}
        <div className="mt-16 flex flex-wrap justify-center gap-6">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: personColor.hex }}
            />
            <span style={{ color: theme.ui.textSecondary }}>Person</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: projectColor.hex }}
            />
            <span style={{ color: theme.ui.textSecondary }}>Project</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: eventColor.hex }}
            />
            <span style={{ color: theme.ui.textSecondary }}>Event</span>
          </div>
        </div>
      </div>
    </section>
  )
}
