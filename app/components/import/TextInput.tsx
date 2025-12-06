'use client'

import { useTheme } from '@/app/providers/ThemeProvider'
import { FileText } from 'lucide-react'

interface TextInputProps {
  value: string
  onChange: (value: string) => void
  onParse: () => void
  isLoading: boolean
  error: string | null
}

export default function TextInput({ value, onChange, onParse, isLoading, error }: TextInputProps) {
  const { theme } = useTheme()

  return (
    <div className="space-y-4">
      {/* 안내 문구 */}
      <div
        className="rounded-lg p-4 border"
        style={{
          backgroundColor: theme.ui.cardBg,
          borderColor: theme.ui.border,
        }}
      >
        <div className="flex items-start gap-3">
          <FileText
            className="w-5 h-5 mt-0.5"
            style={{ color: theme.ui.textMuted }}
          />
          <div>
            <h3
              className="font-medium mb-1"
              style={{ color: theme.ui.textPrimary }}
            >
              사용 방법
            </h3>
            <ul
              className="text-sm space-y-1 list-disc list-inside"
              style={{ color: theme.ui.textMuted }}
            >
              <li>자유 형식으로 메모를 붙여넣으세요</li>
              <li>AI가 자동으로 날짜와 Entity를 인식합니다</li>
              <li>@ 기호로 Entity를 표시하면 더 정확합니다</li>
              <li>날짜 예시: "2024-01-15", "오늘", "어제", "2024년 1월 15일"</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 텍스트 입력 영역 */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="여기에 메모를 붙여넣으세요...

예시:
2024-01-15
오늘 @김철수님과 @카페에서 만났다.
@프로젝트A에 대해 논의했다.

2024-01-16
@회의에서 새로운 아이디어가 나왔다."
        className="w-full h-96 px-4 py-3 rounded-lg resize-none border"
        style={{
          backgroundColor: theme.ui.cardBg,
          borderColor: theme.ui.border,
          color: theme.ui.textPrimary,
          fontFamily: 'monospace',
          outline: 'none',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = theme.ui.interactive.primary
          e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.ui.interactive.primary}33`
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = theme.ui.border
          e.currentTarget.style.boxShadow = 'none'
        }}
      />

      {/* 에러 메시지 */}
      {error && (
        <div
          className="rounded-lg p-3 border"
          style={{
            backgroundColor: theme.ui.error.bg,
            borderColor: `${theme.ui.error.text}33`,
          }}
        >
          <p style={{ color: theme.ui.error.text }}>{error}</p>
        </div>
      )}

      {/* 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={onParse}
          disabled={!value.trim() || isLoading}
          className="px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          style={{
            backgroundColor: theme.ui.interactive.primaryBg,
            color: '#ffffff',
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = theme.ui.interactive.primaryBgHover
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = theme.ui.interactive.primaryBg
            }
          }}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              AI 분석 중...
            </>
          ) : (
            'AI로 분석하기'
          )}
        </button>
      </div>
    </div>
  )
}
