'use client'

import { useState } from 'react'
import TextInput from './TextInput'
import ParsePreview from './ParsePreview'
import ImportProgress from './ImportProgress'
import ResultSummary from './ResultSummary'
import type { BulkImportParseResult, ImportExecuteResult } from '@/types/import'

type Step = 'input' | 'preview' | 'progress' | 'complete'

interface ImportPageProps {
  userId: string
}

export default function ImportPage({ userId }: ImportPageProps) {
  const [step, setStep] = useState<Step>('input')
  const [inputText, setInputText] = useState('')
  const [parseResult, setParseResult] = useState<BulkImportParseResult | null>(null)
  const [executeResult, setExecuteResult] = useState<ImportExecuteResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1: 텍스트 파싱 (Gemini)
  const handleParse = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/import/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '파싱 실패')
      }

      const result = await response.json()
      setParseResult(result)
      setStep('preview')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: DB 저장 실행
  const handleExecute = async () => {
    if (!parseResult) return

    setStep('progress')
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/import/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memos: parseResult.memos,
          userId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Import 실패')
      }

      const result = await response.json()
      setExecuteResult(result)
      setStep('complete')
    } catch (err: any) {
      setError(err.message)
      setStep('preview') // 에러 시 preview로 복귀
    } finally {
      setIsLoading(false)
    }
  }

  // Step 렌더링
  return (
    <div className="max-w-4xl mx-auto p-6">
      {step === 'input' && (
        <TextInput
          value={inputText}
          onChange={setInputText}
          onParse={handleParse}
          isLoading={isLoading}
          error={error}
        />
      )}

      {step === 'preview' && parseResult && (
        <ParsePreview
          result={parseResult}
          onBack={() => setStep('input')}
          onExecute={handleExecute}
          isLoading={isLoading}
          error={error}
        />
      )}

      {step === 'progress' && (
        <ImportProgress />
      )}

      {step === 'complete' && executeResult && (
        <ResultSummary
          result={executeResult}
          onReset={() => {
            setStep('input')
            setInputText('')
            setParseResult(null)
            setExecuteResult(null)
            setError(null)
          }}
        />
      )}
    </div>
  )
}
