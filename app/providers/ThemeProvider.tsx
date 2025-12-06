'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ThemeColors, ThemeName, themes, defaultTheme } from '@/app/lib/theme'

// ============================================================================
// Context 정의
// ============================================================================

interface ThemeContextType {
  theme: ThemeColors
  themeName: ThemeName
  setTheme: (name: ThemeName) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// ============================================================================
// Provider 컴포넌트
// ============================================================================

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: ThemeName
}

export function ThemeProvider({ children, defaultTheme: initialTheme = 'default' }: ThemeProviderProps) {
  const [themeName, setThemeName] = useState<ThemeName>(initialTheme)
  const [theme, setThemeState] = useState<ThemeColors>(themes[initialTheme])

  // 로컬 스토리지에서 테마 불러오기
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as ThemeName | null
    if (savedTheme && themes[savedTheme]) {
      setThemeName(savedTheme)
      setThemeState(themes[savedTheme])
    }
  }, [])

  // 테마 변경 함수
  const setTheme = (name: ThemeName) => {
    if (themes[name]) {
      setThemeName(name)
      setThemeState(themes[name])
      localStorage.setItem('app-theme', name)
    }
  }

  // 테마 토글 (default ↔ claude-dark)
  const toggleTheme = () => {
    const newTheme = themeName === 'default' ? 'claude-dark' : 'default'
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// ============================================================================
// Hook
// ============================================================================

/**
 * 테마 사용 Hook
 *
 * @example
 * const { theme, themeName, setTheme, toggleTheme } = useTheme()
 *
 * // 현재 테마 사용
 * <div className={theme.ui.textPrimary}>
 *
 * // 테마 변경
 * setTheme('claude')
 *
 * // 테마 토글
 * toggleTheme()
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// ============================================================================
// 편의 함수 (선택적)
// ============================================================================

/**
 * ThemeProvider 없이 기본 테마 사용
 */
export function useDefaultTheme() {
  return {
    theme: defaultTheme,
    themeName: 'default' as ThemeName,
    setTheme: () => {},
    toggleTheme: () => {},
  }
}
