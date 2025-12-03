'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

// 설정 타입 정의 (향후 확장 가능)
interface AppSettings {
  layout: {
    isFullWidth: boolean
  }
  font: {
    size: 'small' | 'medium' | 'large' | 'xlarge'
    family: 'inter' | 'noto' | 'system'
  }
  // 향후 추가 가능: theme, compactMode 등
  // theme?: 'light' | 'dark' | 'system'
}

// 기본 설정값
const DEFAULT_SETTINGS: AppSettings = {
  layout: {
    isFullWidth: false,
  },
  font: {
    size: 'medium',
    family: 'inter',
  },
}

// localStorage 키
const STORAGE_KEY = 'app-settings'

interface SettingsContextType {
  settings: AppSettings
  isFullWidth: boolean
  toggleFullWidth: () => void
  setFullWidth: (value: boolean) => void
  // Font settings
  fontSize: AppSettings['font']['size']
  fontFamily: AppSettings['font']['family']
  setFontSize: (size: AppSettings['font']['size']) => void
  setFontFamily: (family: AppSettings['font']['family']) => void
  // 향후 추가 가능한 메서드들
  // setTheme: (theme: AppSettings['theme']) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [isInitialized, setIsInitialized] = useState(false)

  // 🚀 초기화: localStorage에서 모든 설정을 한번에 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as AppSettings
        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsed,
          // 중첩된 객체도 병합
          layout: {
            ...DEFAULT_SETTINGS.layout,
            ...parsed.layout,
          },
          font: {
            ...DEFAULT_SETTINGS.font,
            ...parsed.font,
          },
        })
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  // 💾 설정 저장: debounce 적용하여 성능 최적화
  useEffect(() => {
    if (!isInitialized) return

    // debounce: 300ms 후에 저장
    const saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      } catch (error) {
        console.error('Failed to save settings to localStorage:', error)
      }
    }, 300)

    return () => clearTimeout(saveTimer)
  }, [settings, isInitialized])

  // Full Width 관련 메서드들
  const toggleFullWidth = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        isFullWidth: !prev.layout.isFullWidth,
      },
    }))
  }, [])

  const setFullWidth = useCallback((value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        isFullWidth: value,
      },
    }))
  }, [])

  // Font 관련 메서드들
  const setFontSize = useCallback((size: AppSettings['font']['size']) => {
    setSettings((prev) => ({
      ...prev,
      font: {
        ...prev.font,
        size,
      },
    }))
  }, [])

  const setFontFamily = useCallback((family: AppSettings['font']['family']) => {
    setSettings((prev) => ({
      ...prev,
      font: {
        ...prev.font,
        family,
      },
    }))
  }, [])

  const value: SettingsContextType = {
    settings,
    isFullWidth: settings.layout.isFullWidth,
    toggleFullWidth,
    setFullWidth,
    fontSize: settings.font.size,
    fontFamily: settings.font.family,
    setFontSize,
    setFontFamily,
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

// 편의를 위한 별칭 (기존 useLayout 코드 호환)
export const useLayout = useSettings
