'use client'

import { useTheme } from '@/app/providers/ThemeProvider'

interface HeroSectionProps {
  onGetStarted: () => void
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  const { theme } = useTheme()

  return (
    <section className="flex flex-col items-center justify-center min-h-screen px-6 py-20">
      {/* Logo/Icon */}
      <div className="mb-8">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
          style={{ backgroundColor: theme.ui.interactive.primary }}
        >
          🎯
        </div>
      </div>

      {/* Headline */}
      <h1
        className={`text-5xl md:text-6xl font-bold text-center mb-6 ${theme.ui.textPrimary}`}
      >
        Unlooped
      </h1>

      {/* Subtext */}
      <p
        className={`text-xl md:text-2xl text-center mb-4 max-w-2xl ${theme.ui.textSecondary}`}
      >
        모든 생각을 하나로 연결하세요
      </p>
      <p
        className={`text-base md:text-lg text-center mb-12 max-w-xl ${theme.ui.textMuted}`}
      >
        Entity, Timeline, Mention으로 당신의 아이디어를 체계화하세요
      </p>

      {/* CTA Button */}
      <button
        onClick={onGetStarted}
        className="group relative px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105"
        style={{
          backgroundColor: theme.ui.interactive.primary,
          color: '#FFFFFF',
        }}
      >
        <span className="relative z-10">Get Started →</span>
        <div
          className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background: theme.claude?.gradient.glow || 'rgba(59, 130, 246, 0.2)',
            filter: 'blur(8px)',
          }}
        />
      </button>

      {/* Hint */}
      <p className={`mt-6 text-sm ${theme.ui.textMuted}`}>
        무료로 시작하세요 • 설치 불필요
      </p>
    </section>
  )
}
