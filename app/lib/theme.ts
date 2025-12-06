/**
 * 앱 전역 테마 및 색상 팔레트
 *
 * 멀티 테마 지원 시스템
 * - default: 기존 다크 테마
 * - claude: Claude 웹사이트 스타일
 * - custom: 사용자 정의 테마 (향후 확장)
 */

// ============================================================================
// 테마 타입 정의
// ============================================================================

export type ThemeName = 'default' | 'claude' | 'custom'

export interface ThemeColors {
  name: ThemeName
  displayName: string

  // Entity Type 색상
  entityTypes: {
    person: {
      bg: string
      text: string
      hex: string
      light?: string  // Claude 스타일용
      glow?: string   // 글로우 효과용
    }
    project: {
      bg: string
      text: string
      hex: string
      light?: string
      glow?: string
    }
    event: {
      bg: string
      text: string
      hex: string
      light?: string
      glow?: string
    }
    unknown: {
      bg: string
      text: string
      hex: string
      light?: string
      glow?: string
    }
  }

  // Mention Highlight 강도
  mention: {
    normal: {
      bgOpacity: string
    }
    emphasized: {
      bgOpacity: string
    }
  }

  // UI 요소 색상
  ui: {
    // 배경
    primaryBg: string
    secondaryBg: string
    tertiaryBg: string
    elevatedBg: string
    cardBg: string
    cardBgHover: string
    stickyMetadataBg: string

    // 텍스트
    textPrimary: string
    textSecondary: string
    textMuted: string
    textPlaceholder: string

    // 테두리
    border: string
    borderSubtle: string
    borderStrong: string

    // 상태별 색상
    loading: {
      bg: string
    }
    error: {
      text: string
      bg: string
    }
    aiProcessing: {
      text: string
      bg: string
    }
    delete: {
      text: string
      bg: string
      bgHover: string
    }

    // 검색 하이라이트
    searchHighlight: {
      borderColor: string
      borderColorLight: string
      shadowColor: string
    }

    // 버튼 hover
    buttonHover: string

    // 인터랙티브 색상
    interactive: {
      primary: string
      primaryBg: string
      primaryBgHover: string
      primaryBgLight: string
      primaryText: string

      success: string
      successBg: string
      successText: string

      warning: string
      warningBg: string
      warningText: string

      danger: string
      dangerBg: string
      dangerText: string
      dangerTextHover: string
    }

    // Gray 팔레트
    gray: {
      50: string
      100: string
      200: string
      300: string
      400: string
      500: string
      600: string
      700: string
      800: string
      900: string
    }

    // 아이콘 색상
    iconColors: {
      default: string
      muted: string
      orange: string
      blue: string
      yellow: string
      green: string
      purple: string
      cyan: string
      indigo: string
      red: string
    }
  }

  // Claude 스타일 확장 (선택적)
  claude?: {
    // 그라데이션
    gradient: {
      primary: string
      card: string
      glow: string
    }

    // 액센트 색상
    accent: {
      purple: {
        base: string
        light: string
        dark: string
        glow: string
      }
      blue: {
        base: string
        light: string
        dark: string
        glow: string
      }
    }

    // 그림자
    shadow: {
      sm: string
      md: string
      lg: string
      glow: string
    }

    // Border Radius (선택적)
    borderRadius?: {
      sm: string
      base: string
      md: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
      full: string
    }
  }

  // Timeline 관련 색상
  timeline: {
    background: string
    entityLine: string
    entityLineActive: string
    timeScale: {
      text: string
      line: string
      majorLine: string
    }
    memo: {
      color: string
      hoverOpacity: number
      selectedOpacity: number
    }
  }

  // Drawer 관련 색상
  drawer: {
    overlay: string
    background: string
    border: string
    header: {
      title: string
      closeButton: string
      closeButtonHover: string
    }
    section: {
      title: string
      text: string
      textMuted: string
    }
    card: {
      background: string
      border: string
      borderHover: string
    }
    button: {
      primary: {
        bg: string
        bgHover: string
        text: string
      }
      secondary: {
        bg: string
        bgHover: string
        text: string
      }
    }
  }

  // Tooltip 관련 색상
  tooltip: {
    background: string
    border: string
    shadow: string
    divider: string
    title: string
    text: string
    hint: string
  }
}

// ============================================================================
// 테마 정의
// ============================================================================

/**
 * 기본 테마 (기존 다크 테마)
 */
export const defaultTheme: ThemeColors = {
  name: 'default',
  displayName: 'Default Dark',

  entityTypes: {
    person: {
      bg: '#22C55E',
      text: '#22C55E',
      hex: '#22C55E', // green-500
    },
    project: {
      bg: '#A855F7',
      text: '#A855F7',
      hex: '#A855F7', // purple-500
    },
    event: {
      bg: '#F59E0B',
      text: '#F59E0B',
      hex: '#F59E0B', // amber-500
    },
    unknown: {
      bg: '#9CA3AF',
      text: '#9CA3AF',
      hex: '#9CA3AF',
    },
  },

  mention: {
    normal: {
      bgOpacity: '20',
    },
    emphasized: {
      bgOpacity: '40',
    },
  },

  ui: {
    // 배경
    primaryBg: '#1a1f2e',
    secondaryBg: '#252b3b',
    tertiaryBg: '#2a2f3e',
    elevatedBg: '#2a2f3e',
    cardBg: '#2a2f3e',
    cardBgHover: '#252b3b80',
    stickyMetadataBg: 'rgba(26, 31, 46, 0.95)',

    // 텍스트
    textPrimary: '#ffffff',
    textSecondary: '#d1d5db',
    textMuted: '#9ca3af',
    textPlaceholder: '#9ca3af',

    // 테두리
    border: '#374151',
    borderSubtle: 'rgba(55, 65, 81, 0.5)',
    borderStrong: '#374151',

    // 상태별 색상
    loading: {
      bg: '#2a2f3e',
    },
    error: {
      text: '#f87171',
      bg: 'rgba(239, 68, 68, 0.1)',
    },
    aiProcessing: {
      text: '#60A5FA',
      bg: 'rgba(59, 130, 246, 0.1)',
    },
    delete: {
      text: '#f87171',
      bg: 'rgba(239, 68, 68, 0.1)',
      bgHover: 'rgba(239, 68, 68, 0.1)',
    },

    // 검색 하이라이트
    searchHighlight: {
      borderColor: '#EAB308',
      borderColorLight: '#FACC15',
      shadowColor: 'rgba(234, 179, 8, 0.6)',
    },

    // 버튼 hover
    buttonHover: '#374151',

    // 인터랙티브 색상
    interactive: {
      primary: '#3B82F6',
      primaryBg: '#3B82F6',
      primaryBgHover: '#2563EB',
      primaryBgLight: 'rgba(59, 130, 246, 0.2)',
      primaryText: '#60A5FA',

      success: '#22C55E',
      successBg: '#22C55E',
      successText: '#4ADE80',

      warning: '#EAB308',
      warningBg: 'rgba(234, 179, 8, 0.3)',
      warningText: '#FDE047',

      danger: '#EF4444',
      dangerBg: 'rgba(239, 68, 68, 0.1)',
      dangerText: '#f87171',
      dangerTextHover: '#fca5a5',
    },

    // Gray 팔레트
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },

    // 아이콘 색상
    iconColors: {
      default: '#FFFFFF',
      muted: '#9CA3AF',
      orange: '#FB923C',
      blue: '#60A5FA',
      yellow: '#FACC15',
      green: '#4ADE80',
      purple: '#C084FC',
      cyan: '#22D3EE',
      indigo: '#818CF8',
      red: '#F87171',
    },
  },

  timeline: {
    background: '#0F172A',
    entityLine: '#374151',
    entityLineActive: '#4B5563',
    timeScale: {
      text: '#9CA3AF',
      line: '#374151',
      majorLine: '#4B5563',
    },
    memo: {
      color: '#F8FAFC',
      hoverOpacity: 0.9,
      selectedOpacity: 1,
    },
  },

  drawer: {
    overlay: 'rgba(0, 0, 0, 0.5)',
    background: '#0A0F1E',
    border: '#1F2937',
    header: {
      title: '#FFFFFF',
      closeButton: '#9CA3AF',
      closeButtonHover: '#FFFFFF',
    },
    section: {
      title: '#9CA3AF',
      text: '#FFFFFF',
      textMuted: '#9CA3AF',
    },
    card: {
      background: '#0F172A',
      border: '#1F2937',
      borderHover: '#6B7280',
    },
    button: {
      primary: {
        bg: '#3B82F6',
        bgHover: '#2563EB',
        text: '#FFFFFF',
      },
      secondary: {
        bg: '#F97316',
        bgHover: '#EA580C',
        text: '#FFFFFF',
      },
    },
  },

  tooltip: {
    background: '#1a1a1a',
    border: '#2d2d2d',
    shadow: 'rgba(0, 0, 0, 0.5)',
    divider: '#2d2d2d',
    title: '#888888',
    text: '#FFFFFF',
    hint: '#666666',
  },
}

/**
 * Claude 스타일 테마
 */
export const claudeTheme: ThemeColors = {
  name: 'claude',
  displayName: 'Claude Style',

  entityTypes: {
    person: {
      bg: '#10B981',
      text: '#10B981',
      hex: '#10B981', // emerald-500
      light: '#34D399', // emerald-400
      glow: 'rgba(16, 185, 129, 0.2)',
    },
    project: {
      bg: '#A78BFA',
      text: '#A78BFA',
      hex: '#A78BFA', // purple-400
      light: '#C4B5FD', // purple-300
      glow: 'rgba(167, 139, 250, 0.2)',
    },
    event: {
      bg: '#F59E0B',
      text: '#F59E0B',
      hex: '#F59E0B', // amber-500
      light: '#FBBF24', // amber-400
      glow: 'rgba(245, 158, 11, 0.2)',
    },
    unknown: {
      bg: '#9CA3AF',
      text: '#9CA3AF',
      hex: '#9CA3AF',
      light: '#CBD5E1',
      glow: 'rgba(156, 163, 175, 0.2)',
    },
  },

  mention: {
    normal: {
      bgOpacity: '20',
    },
    emphasized: {
      bgOpacity: '40',
    },
  },

  ui: {
    // 배경 (더 깊은 다크 톤)
    primaryBg: '#0A0E17',
    secondaryBg: '#141821',
    tertiaryBg: '#1C2029',
    elevatedBg: '#242938',
    cardBg: '#141821',
    cardBgHover: '#1C2029',
    stickyMetadataBg: 'rgba(10, 14, 23, 0.95)',

    // 텍스트 (Claude 스타일 - 부드러운 흰색)
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    textPlaceholder: '#64748B',

    // 테두리
    border: 'rgba(255, 255, 255, 0.1)',
    borderSubtle: 'rgba(255, 255, 255, 0.05)',
    borderStrong: 'rgba(255, 255, 255, 0.15)',

    // 상태별 색상
    loading: {
      bg: '#141821',
    },
    error: {
      text: '#f87171',
      bg: 'rgba(239, 68, 68, 0.1)',
    },
    aiProcessing: {
      text: '#C084FC',
      bg: 'rgba(168, 85, 247, 0.1)',
    },
    delete: {
      text: '#f87171',
      bg: 'rgba(239, 68, 68, 0.1)',
      bgHover: 'rgba(239, 68, 68, 0.1)',
    },

    // 검색 하이라이트
    searchHighlight: {
      borderColor: '#A78BFA',
      borderColorLight: '#C4B5FD',
      shadowColor: 'rgba(167, 139, 250, 0.6)',
    },

    // 버튼 hover
    buttonHover: 'rgba(255, 255, 255, 0.05)',

    // 인터랙티브 색상
    interactive: {
      primary: '#A78BFA', // purple-400
      primaryBg: 'linear-gradient(to right, #A855F7, #3B82F6)',
      primaryBgHover: '#8B5CF6',
      primaryBgLight: 'rgba(168, 85, 247, 0.2)',
      primaryText: '#C084FC',

      success: '#10B981',
      successBg: '#10B981',
      successText: '#34D399',

      warning: '#F59E0B',
      warningBg: 'rgba(245, 158, 11, 0.3)',
      warningText: '#FCD34D',

      danger: '#EF4444',
      dangerBg: 'rgba(239, 68, 68, 0.1)',
      dangerText: '#f87171',
      dangerTextHover: '#fca5a5',
    },

    // Gray 팔레트 (Slate 계열)
    gray: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },

    // 아이콘 색상
    iconColors: {
      default: '#F8FAFC',
      muted: '#94A3B8',
      orange: '#FB923C',
      blue: '#60A5FA',
      yellow: '#FACC15',
      green: '#10B981',
      purple: '#A78BFA',
      cyan: '#22D3EE',
      indigo: '#818CF8',
      red: '#F87171',
    },
  },

  // Claude 스타일 확장
  claude: {
    gradient: {
      primary: 'linear-gradient(135deg, #A78BFA 0%, #60A5FA 100%)',
      card: 'linear-gradient(to bottom right, #141821 0%, #1C2029 100%)',
      glow: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(96, 165, 250, 0.1) 100%)',
    },

    accent: {
      purple: {
        base: '#A78BFA', // purple-400
        light: '#C4B5FD', // purple-300
        dark: '#8B5CF6', // purple-500
        glow: 'rgba(167, 139, 250, 0.3)',
      },
      blue: {
        base: '#60A5FA', // blue-400
        light: '#93C5FD', // blue-300
        dark: '#3B82F6', // blue-500
        glow: 'rgba(96, 165, 250, 0.3)',
      },
    },

    shadow: {
      sm: '0 2px 8px rgba(0, 0, 0, 0.2)',
      md: '0 4px 16px rgba(0, 0, 0, 0.3)',
      lg: '0 8px 32px rgba(0, 0, 0, 0.4)',
      glow: '0 0 40px rgba(167, 139, 250, 0.3)',
    },

    borderRadius: {
      sm: '0.25rem',
      base: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
      '2xl': '2rem',
      '3xl': '3rem',
      full: '9999px',
    },
  },

  timeline: {
    background: '#0A0E17',
    entityLine: '#334155',
    entityLineActive: '#475569',
    timeScale: {
      text: '#94A3B8',
      line: '#334155',
      majorLine: '#475569',
    },
    memo: {
      color: '#F8FAFC',
      hoverOpacity: 0.95,
      selectedOpacity: 1,
    },
  },

  drawer: {
    overlay: 'rgba(0, 0, 0, 0.7)',
    background: '#0A0E17',
    border: '#1C2029',
    header: {
      title: '#F8FAFC',
      closeButton: '#94A3B8',
      closeButtonHover: '#F8FAFC',
    },
    section: {
      title: '#94A3B8',
      text: '#F8FAFC',
      textMuted: '#94A3B8',
    },
    card: {
      background: '#141821',
      border: '#1C2029',
      borderHover: '#64748B',
    },
    button: {
      primary: {
        bg: '#A78BFA',
        bgHover: '#8B5CF6',
        text: '#FFFFFF',
      },
      secondary: {
        bg: '#60A5FA',
        bgHover: '#3B82F6',
        text: '#FFFFFF',
      },
    },
  },

  tooltip: {
    background: '#0A0E17',
    border: '#1C2029',
    shadow: 'rgba(0, 0, 0, 0.6)',
    divider: '#1C2029',
    title: '#94A3B8',
    text: '#F8FAFC',
    hint: '#64748B',
  },
}

/**
 * 사용 가능한 모든 테마
 */
export const themes: Record<ThemeName, ThemeColors> = {
  default: defaultTheme,
  claude: claudeTheme,
  custom: defaultTheme, // 향후 사용자 정의 테마로 확장
}

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * Entity type에 따른 색상 반환
 */
export function getEntityTypeColor(
  type: string | null | undefined,
  theme: ThemeColors = defaultTheme
): { bg: string; text: string; hex: string; light?: string; glow?: string } {
  switch (type) {
    case 'person':
      return theme.entityTypes.person
    case 'project':
      return theme.entityTypes.project
    case 'event':
      return theme.entityTypes.event
    case 'unknown':
    case null:
    case undefined:
      return theme.entityTypes.unknown
    default:
      return theme.entityTypes.unknown
  }
}

/**
 * Entity type에 따른 hex 색상 반환 (Timeline용)
 */
export function getEntityTypeHexColor(
  type: string | null | undefined,
  theme: ThemeColors = defaultTheme
): string {
  return getEntityTypeColor(type, theme).hex
}

/**
 * Mention highlight용 색상 클래스 생성 (deprecated - 하위 호환성을 위해 유지)
 * @deprecated getMentionHighlightStyle()을 사용하세요
 */
export function getMentionHighlightClass(
  type: string | null | undefined,
  isEmphasized: boolean = false,
  theme: ThemeColors = defaultTheme
): string {
  const typeColor = getEntityTypeColor(type, theme)
  const opacity = isEmphasized
    ? theme.mention.emphasized.bgOpacity
    : theme.mention.normal.bgOpacity

  return `${typeColor.bg}/${opacity} ${typeColor.text} px-1.5 py-0.5 rounded font-medium`
}

/**
 * Mention highlight용 style 객체 생성 (hex 기반)
 */
export function getMentionHighlightStyle(
  type: string | null | undefined,
  isEmphasized: boolean = false,
  theme: ThemeColors = defaultTheme
): { backgroundColor: string; color: string } {
  const typeColor = getEntityTypeColor(type, theme)
  const opacity = isEmphasized
    ? parseInt(theme.mention.emphasized.bgOpacity) / 100
    : parseInt(theme.mention.normal.bgOpacity) / 100

  // hex를 rgba로 변환
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  return {
    backgroundColor: hexToRgba(typeColor.hex, opacity),
    color: typeColor.hex,
  }
}

/**
 * 현재 테마 가져오기 (Context에서 사용)
 */
export function getCurrentTheme(): ThemeColors {
  return defaultTheme
}

/**
 * 테마 이름으로 테마 가져오기
 */
export function getThemeByName(name: ThemeName): ThemeColors {
  return themes[name] || defaultTheme
}
