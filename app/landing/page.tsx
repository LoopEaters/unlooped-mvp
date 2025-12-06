'use client'

import { useAuth } from '@/app/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import HeroSection from '@/app/components/landing/HeroSection'
import FeaturesSection from '@/app/components/landing/FeaturesSection'
import { useTheme } from '@/app/providers/ThemeProvider'
import { isProduction } from '../lib/util'

export default function LandingPage() {
  const { session, setShowLoginModal } = useAuth()
  const router = useRouter()
  const { theme } = useTheme()

  // 이미 로그인한 사용자는 메인 앱으로 리다이렉트
  useEffect(() => {
    if (session && isProduction()) {
      router.push('/')
    }
  }, [session, router])

  const handleGetStarted = () => {
    setShowLoginModal(true)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.ui.primaryBg }}>
      <HeroSection onGetStarted={handleGetStarted} />
      <FeaturesSection />

      {/* Footer */}
      <footer className="py-8 border-t" style={{ borderColor: theme.ui.border }}>
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className={theme.ui.textMuted}>
            © 2025 Unlooped. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
