'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useTheme } from '@/app/providers/ThemeProvider'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/app/lib/supabase/client'
import WelcomeStep from './WelcomeStep'
import TimelineStep from './TimelineStep'
import MentionStep from './MentionStep'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

export default function OnboardingModal({
  isOpen,
  onClose,
  userId,
}: OnboardingModalProps) {
  const { theme } = useTheme()
  const [currentStep, setCurrentStep] = useState(1)
  const [isCompleting, setIsCompleting] = useState(false)
  const queryClient = useQueryClient()
  const supabase = createClient()

  const totalSteps = 3

  const handleComplete = async () => {
    setIsCompleting(true)

    try {
      // Supabase 업데이트
      const { error } = await supabase
        .from('users')
        .update({
          onboarding_completed: true,
        })
        .eq('id', userId)

      if (error) throw error

      // React Query 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['user'] })

      onClose()
    } catch (error) {
      console.error('온보딩 완료 중 오류:', error)
      setIsCompleting(false)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg p-8 w-full max-w-2xl z-50"
          style={{ backgroundColor: theme.ui.cardBg }}
        >
          {/* Progress Indicator */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className="h-1 flex-1 rounded transition-all"
                style={{
                  backgroundColor:
                    step <= currentStep
                      ? theme.ui.interactive.primary
                      : theme.ui.gray[700],
                }}
              />
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[300px]">
            {currentStep === 1 && <WelcomeStep />}
            {currentStep === 2 && <TimelineStep />}
            {currentStep === 3 && <MentionStep />}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t" style={{ borderColor: theme.ui.border }}>
            {/* 이전 버튼 */}
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-3 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: theme.ui.secondaryBg,
                  color: theme.ui.textSecondary,
                }}
              >
                이전
              </button>
            ) : (
              <div />
            )}

            {/* 다음/시작하기 버튼 */}
            {currentStep < totalSteps ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: theme.ui.interactive.primary }}
              >
                다음
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={isCompleting}
                className="px-6 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: theme.ui.interactive.primary }}
              >
                {isCompleting ? '처리 중...' : '시작하기'}
              </button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
