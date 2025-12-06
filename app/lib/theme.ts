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

export type ThemeName = 'default' | 'claude-light' | 'claude-dark' | 'custom'

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
 * Claude Light 테마 (따뜻한 라이트 모드)
 * 실제 claude.ai 색상 기반
 */
export const claudeLightTheme: ThemeColors = {
  name: 'claude-light',
  displayName: 'Claude Light',

  entityTypes: {
    person: {
      bg: '#52A675',
      text: '#52A675',
      hex: '#52A675', // 따뜻한 초록
      light: '#6FBB8E',
      glow: 'rgba(82, 166, 117, 0.2)',
    },
    project: {
      bg: '#9B6FA6',
      text: '#9B6FA6',
      hex: '#9B6FA6', // 따뜻한 퍼플
      light: '#B088BB',
      glow: 'rgba(155, 111, 166, 0.2)',
    },
    event: {
      bg: '#E07B53',
      text: '#E07B53',
      hex: '#E07B53', // 따뜻한 오렌지
      light: '#E69570',
      glow: 'rgba(224, 123, 83, 0.2)',
    },
    unknown: {
      bg: '#938C7F',
      text: '#938C7F',
      hex: '#938C7F', // 따뜻한 그레이
      light: '#A8A199',
      glow: 'rgba(147, 140, 127, 0.2)',
    },
  },

  mention: {
    normal: {
      bgOpacity: '15',
    },
    emphasized: {
      bgOpacity: '30',
    },
  },

  ui: {
    // 배경 (따뜻한 베이지/크림 톤)
    primaryBg: '#F5F3EF', // 메인 배경
    secondaryBg: '#ECE9E3', // 약간 어두운 배경
    tertiaryBg: '#E3DFD7', // 더 어두운 배경
    elevatedBg: '#FFFFFF', // 떠있는 요소
    cardBg: '#FFFFFF', // 카드 배경
    cardBgHover: '#FAF8F5', // 카드 hover
    stickyMetadataBg: 'rgba(255, 255, 255, 0.95)',

    // 텍스트 (따뜻한 브라운 톤)
    textPrimary: '#2D2A26', // 진한 브라운
    textSecondary: '#5C574F', // 중간 브라운
    textMuted: '#938C7F', // 옅은 브라운/그레이
    textPlaceholder: '#B3ADA3',

    // 테두리
    border: '#D4CFC6',
    borderSubtle: '#E8E4DC',
    borderStrong: '#B3ADA3',

    // 상태별 색상
    loading: {
      bg: '#ECE9E3',
    },
    error: {
      text: '#C14343',
      bg: 'rgba(193, 67, 67, 0.1)',
    },
    aiProcessing: {
      text: '#9B6FA6',
      bg: 'rgba(155, 111, 166, 0.1)',
    },
    delete: {
      text: '#C14343',
      bg: 'rgba(193, 67, 67, 0.1)',
      bgHover: 'rgba(193, 67, 67, 0.15)',
    },

    // 검색 하이라이트
    searchHighlight: {
      borderColor: '#CC785C',
      borderColorLight: '#E39774',
      shadowColor: 'rgba(204, 120, 92, 0.4)',
    },

    // 버튼 hover
    buttonHover: 'rgba(0, 0, 0, 0.05)',

    // 인터랙티브 색상
    interactive: {
      primary: '#CC785C', // 코랄 accent
      primaryBg: '#CC785C',
      primaryBgHover: '#B86A4F',
      primaryBgLight: 'rgba(204, 120, 92, 0.1)',
      primaryText: '#B86A4F',

      success: '#52A675',
      successBg: '#52A675',
      successText: '#3D7D59',

      warning: '#E07B53',
      warningBg: 'rgba(224, 123, 83, 0.15)',
      warningText: '#C66942',

      danger: '#C14343',
      dangerBg: 'rgba(193, 67, 67, 0.1)',
      dangerText: '#C14343',
      dangerTextHover: '#A33636',
    },

    // Gray 팔레트 (따뜻한 톤)
    gray: {
      50: '#FAF8F5',
      100: '#F5F3EF',
      200: '#ECE9E3',
      300: '#D4CFC6',
      400: '#B3ADA3',
      500: '#938C7F',
      600: '#756F64',
      700: '#5C574F',
      800: '#433F38',
      900: '#2D2A26',
    },

    // 아이콘 색상
    iconColors: {
      default: '#2D2A26',
      muted: '#938C7F',
      orange: '#E07B53',
      blue: '#6B9FC7',
      yellow: '#D9A850',
      green: '#52A675',
      purple: '#9B6FA6',
      cyan: '#5BAAA5',
      indigo: '#7B85C2',
      red: '#C14343',
    },
  },

  // Claude 스타일 확장
  claude: {
    gradient: {
      primary: 'linear-gradient(135deg, #CC785C 0%, #E39774 100%)',
      card: 'linear-gradient(to bottom right, #FFFFFF 0%, #FAF8F5 100%)',
      glow: 'linear-gradient(135deg, rgba(204, 120, 92, 0.08) 0%, rgba(227, 151, 116, 0.08) 100%)',
    },

    accent: {
      purple: {
        base: '#9B6FA6',
        light: '#B088BB',
        dark: '#85608F',
        glow: 'rgba(155, 111, 166, 0.2)',
      },
      blue: {
        base: '#6B9FC7',
        light: '#8AB5D4',
        dark: '#5789B3',
        glow: 'rgba(107, 159, 199, 0.2)',
      },
    },

    shadow: {
      sm: '0 1px 3px rgba(45, 42, 38, 0.1)',
      md: '0 4px 12px rgba(45, 42, 38, 0.12)',
      lg: '0 8px 24px rgba(45, 42, 38, 0.15)',
      glow: '0 0 30px rgba(204, 120, 92, 0.2)',
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
    background: '#F5F3EF',
    entityLine: '#D4CFC6',
    entityLineActive: '#B3ADA3',
    timeScale: {
      text: '#938C7F',
      line: '#E8E4DC',
      majorLine: '#D4CFC6',
    },
    memo: {
      color: '#2D2A26',
      hoverOpacity: 0.9,
      selectedOpacity: 1,
    },
  },

  drawer: {
    overlay: 'rgba(45, 42, 38, 0.5)',
    background: '#FFFFFF',
    border: '#E8E4DC',
    header: {
      title: '#2D2A26',
      closeButton: '#938C7F',
      closeButtonHover: '#2D2A26',
    },
    section: {
      title: '#938C7F',
      text: '#2D2A26',
      textMuted: '#938C7F',
    },
    card: {
      background: '#FAF8F5',
      border: '#E8E4DC',
      borderHover: '#CC785C',
    },
    button: {
      primary: {
        bg: '#CC785C',
        bgHover: '#B86A4F',
        text: '#FFFFFF',
      },
      secondary: {
        bg: '#9B6FA6',
        bgHover: '#85608F',
        text: '#FFFFFF',
      },
    },
  },

  tooltip: {
    background: '#2D2A26',
    border: '#433F38',
    shadow: 'rgba(45, 42, 38, 0.3)',
    divider: '#433F38',
    title: '#B3ADA3',
    text: '#F5F3EF',
    hint: '#938C7F',
  },
}

/**
 * Claude Dark 테마 (따뜻한 다크 모드)
 * 실제 claude.ai 다크모드 색상 기반
 */
export const claudeDarkTheme: ThemeColors = {
  name: 'claude-dark',
  displayName: 'Claude Dark',

  entityTypes: {
    person: {
      bg: '#52A675',
      text: '#52A675',
      hex: '#52A675', // 따뜻한 초록
      light: '#6FBB8E',
      glow: 'rgba(82, 166, 117, 0.25)',
    },
    project: {
      bg: '#9B6FA6',
      text: '#9B6FA6',
      hex: '#9B6FA6', // 따뜻한 퍼플
      light: '#B088BB',
      glow: 'rgba(155, 111, 166, 0.25)',
    },
    event: {
      bg: '#E07B53',
      text: '#E07B53',
      hex: '#E07B53', // 따뜻한 오렌지
      light: '#E69570',
      glow: 'rgba(224, 123, 83, 0.25)',
    },
    unknown: {
      bg: '#938C7F',
      text: '#938C7F',
      hex: '#938C7F', // 따뜻한 그레이
      light: '#A8A199',
      glow: 'rgba(147, 140, 127, 0.25)',
    },
  },

  mention: {
    normal: {
      bgOpacity: '20',
    },
    emphasized: {
      bgOpacity: '35',
    },
  },

  ui: {
    // 배경 (따뜻한 다크 브라운)
    primaryBg: '#1C1915', // 메인 배경
    secondaryBg: '#2D2A26', // 약간 밝은 배경
    tertiaryBg: '#38342F', // 더 밝은 배경
    elevatedBg: '#433F38', // 떠있는 요소
    cardBg: '#2D2A26', // 카드 배경
    cardBgHover: '#38342F', // 카드 hover
    stickyMetadataBg: 'rgba(28, 25, 21, 0.95)',

    // 텍스트 (따뜻한 크림/베이지 톤)
    textPrimary: '#F5F3EF', // 밝은 크림
    textSecondary: '#C9C3B9', // 중간 베이지
    textMuted: '#938C7F', // 옅은 그레이/브라운
    textPlaceholder: '#756F64',

    // 테두리
    border: '#4A4540',
    borderSubtle: '#38342F',
    borderStrong: '#5C574F',

    // 상태별 색상
    loading: {
      bg: '#2D2A26',
    },
    error: {
      text: '#E89393',
      bg: 'rgba(232, 147, 147, 0.12)',
    },
    aiProcessing: {
      text: '#B088BB',
      bg: 'rgba(155, 111, 166, 0.12)',
    },
    delete: {
      text: '#E89393',
      bg: 'rgba(232, 147, 147, 0.12)',
      bgHover: 'rgba(232, 147, 147, 0.18)',
    },

    // 검색 하이라이트
    searchHighlight: {
      borderColor: '#E39774',
      borderColorLight: '#EEAB8D',
      shadowColor: 'rgba(227, 151, 116, 0.4)',
    },

    // 버튼 hover
    buttonHover: 'rgba(255, 255, 255, 0.05)',

    // 인터랙티브 색상
    interactive: {
      primary: '#E39774', // 밝은 코랄 accent
      primaryBg: '#E39774',
      primaryBgHover: '#EEAB8D',
      primaryBgLight: 'rgba(227, 151, 116, 0.15)',
      primaryText: '#EEAB8D',

      success: '#6FBB8E',
      successBg: '#6FBB8E',
      successText: '#8BCBA2',

      warning: '#E69570',
      warningBg: 'rgba(230, 149, 112, 0.15)',
      warningText: '#EEAB8D',

      danger: '#E89393',
      dangerBg: 'rgba(232, 147, 147, 0.12)',
      dangerText: '#E89393',
      dangerTextHover: '#F0ABAB',
    },

    // Gray 팔레트 (따뜻한 톤)
    gray: {
      50: '#F5F3EF',
      100: '#ECE9E3',
      200: '#D4CFC6',
      300: '#B3ADA3',
      400: '#938C7F',
      500: '#756F64',
      600: '#5C574F',
      700: '#4A4540',
      800: '#38342F',
      900: '#2D2A26',
    },

    // 아이콘 색상
    iconColors: {
      default: '#F5F3EF',
      muted: '#938C7F',
      orange: '#E69570',
      blue: '#8AB5D4',
      yellow: '#E6C177',
      green: '#6FBB8E',
      purple: '#B088BB',
      cyan: '#7BC4BF',
      indigo: '#9BA3D4',
      red: '#E89393',
    },
  },

  // Claude 스타일 확장
  claude: {
    gradient: {
      primary: 'linear-gradient(135deg, #E39774 0%, #EEAB8D 100%)',
      card: 'linear-gradient(to bottom right, #2D2A26 0%, #38342F 100%)',
      glow: 'linear-gradient(135deg, rgba(227, 151, 116, 0.1) 0%, rgba(238, 171, 141, 0.1) 100%)',
    },

    accent: {
      purple: {
        base: '#B088BB',
        light: '#C4A0CE',
        dark: '#9B6FA6',
        glow: 'rgba(176, 136, 187, 0.25)',
      },
      blue: {
        base: '#8AB5D4',
        light: '#A3C5DE',
        dark: '#6B9FC7',
        glow: 'rgba(138, 181, 212, 0.25)',
      },
    },

    shadow: {
      sm: '0 2px 8px rgba(0, 0, 0, 0.3)',
      md: '0 4px 16px rgba(0, 0, 0, 0.4)',
      lg: '0 8px 32px rgba(0, 0, 0, 0.5)',
      glow: '0 0 40px rgba(227, 151, 116, 0.3)',
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
    background: '#1C1915',
    entityLine: '#4A4540',
    entityLineActive: '#5C574F',
    timeScale: {
      text: '#938C7F',
      line: '#38342F',
      majorLine: '#4A4540',
    },
    memo: {
      color: '#F5F3EF',
      hoverOpacity: 0.95,
      selectedOpacity: 1,
    },
  },

  drawer: {
    overlay: 'rgba(0, 0, 0, 0.6)',
    background: '#1C1915',
    border: '#38342F',
    header: {
      title: '#F5F3EF',
      closeButton: '#938C7F',
      closeButtonHover: '#F5F3EF',
    },
    section: {
      title: '#938C7F',
      text: '#F5F3EF',
      textMuted: '#938C7F',
    },
    card: {
      background: '#2D2A26',
      border: '#38342F',
      borderHover: '#E39774',
    },
    button: {
      primary: {
        bg: '#E39774',
        bgHover: '#EEAB8D',
        text: '#1C1915',
      },
      secondary: {
        bg: '#B088BB',
        bgHover: '#C4A0CE',
        text: '#1C1915',
      },
    },
  },

  tooltip: {
    background: '#2D2A26',
    border: '#38342F',
    shadow: 'rgba(0, 0, 0, 0.5)',
    divider: '#38342F',
    title: '#938C7F',
    text: '#F5F3EF',
    hint: '#756F64',
  },
}

/**
 * 사용 가능한 모든 테마
 */
export const themes: Record<ThemeName, ThemeColors> = {
  default: defaultTheme,
  'claude-light': claudeLightTheme,
  'claude-dark': claudeDarkTheme,
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
  theme: ThemeColors
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
  theme: ThemeColors
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
  theme: ThemeColors
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
  theme: ThemeColors
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
