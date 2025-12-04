/**
 * 앱 전역 테마 및 색상 팔레트
 *
 * 사용자 설정으로 커스터마이징 가능하도록 설계됨
 * 나중에 Context나 설정 파일로부터 값을 가져올 수 있음
 */

export interface ThemeColors {
  // Entity Type 색상
  entityTypes: {
    person: {
      bg: string
      text: string
      hex: string // Timeline에서 사용할 hex 색상
    }
    project: {
      bg: string
      text: string
      hex: string
    }
    event: {
      bg: string
      text: string
      hex: string
    }
    unknown: {
      bg: string
      text: string
      hex: string
    }
  }

  // Mention Highlight 강도
  mention: {
    // 일반 mention (다른 entity)
    normal: {
      bgOpacity: string  // Tailwind opacity 값 (예: '20')
    }
    // 강조 mention (현재 entity section의 entity)
    emphasized: {
      bgOpacity: string  // Tailwind opacity 값 (예: '40')
    }
  }

  // UI 요소 색상
  ui: {
    // 배경
    primaryBg: string
    cardBg: string
    cardBgHover: string
    stickyMetadataBg: string  // sticky metadata 반투명 배경

    // 텍스트
    textPrimary: string
    textSecondary: string
    textMuted: string
    textPlaceholder: string

    // 테두리
    border: string

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
      borderColor: string      // 테두리 색상 (hex)
      borderColorLight: string // 밝은 테두리 색상 (hex)
      shadowColor: string      // 그림자 색상 (rgba)
    }

    // 버튼 hover
    buttonHover: string

    // 인터랙티브 색상 (선택, hover 등)
    interactive: {
      primary: string           // 주요 인터랙티브 요소 (파란색)
      primaryBg: string         // 주요 배경 (bg-blue-500)
      primaryBgHover: string    // 주요 배경 hover (bg-blue-600)
      primaryBgLight: string    // 주요 배경 연한 (bg-blue-500/20)
      primaryText: string       // 주요 텍스트 (text-blue-400)

      success: string           // 성공 (초록색)
      successBg: string
      successText: string

      warning: string           // 경고 (노란색)
      warningBg: string
      warningText: string

      danger: string            // 위험 (빨간색)
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
      default: string       // 기본 아이콘 색상
      muted: string         // 흐린 아이콘
      orange: string        // 오렌지 (아바타 등)
      blue: string          // 파란색
      yellow: string        // 노란색
      green: string         // 초록색
      purple: string        // 보라색
      cyan: string          // 청록색
      indigo: string        // 남색
      red: string           // 빨간색
    }
  }

  // Timeline 관련 색상
  timeline: {
    background: string       // 타임라인 배경
    entityLine: string       // Entity 수직선 (기본)
    entityLineActive: string // Entity 수직선 (hover/active)
    timeScale: {
      text: string          // 시간 눈금 텍스트
      line: string          // 시간 눈금 선
      majorLine: string     // 주요 시간 눈금 (강조)
    }
    memo: {
      color: string         // Memo 색상 (기본)
      hoverOpacity: number  // Hover 시 투명도
      selectedOpacity: number // 선택 시 투명도
    }
  }

  // Drawer 관련 색상
  drawer: {
    overlay: string          // 배경 오버레이
    background: string       // Drawer 배경
    border: string          // Drawer 테두리
    header: {
      title: string         // 제목 텍스트
      closeButton: string   // 닫기 버튼 기본
      closeButtonHover: string // 닫기 버튼 hover
    }
    section: {
      title: string         // 섹션 제목
      text: string          // 일반 텍스트
      textMuted: string     // 부가 정보 텍스트
    }
    card: {
      background: string    // 카드 배경
      border: string        // 카드 테두리
      borderHover: string   // 카드 테두리 hover
    }
    button: {
      primary: {
        bg: string          // 주요 버튼 배경
        bgHover: string     // 주요 버튼 hover
        text: string        // 주요 버튼 텍스트
      }
      secondary: {
        bg: string          // 보조 버튼 배경
        bgHover: string     // 보조 버튼 hover
        text: string        // 보조 버튼 텍스트
      }
    }
  }

  // Tooltip 관련 색상
  tooltip: {
    background: string      // 배경
    border: string          // 테두리
    shadow: string          // 그림자
    divider: string         // 구분선
    title: string           // 제목 텍스트 (날짜 등)
    text: string            // 본문 텍스트
    hint: string            // 힌트 텍스트
  }
}

/**
 * 기본 테마 색상
 */
export const defaultTheme: ThemeColors = {
  entityTypes: {
    person: {
      bg: 'bg-mention-person',
      text: 'text-mention-person',
      hex: '#22C55E', // green-500 - 초록색
    },
    project: {
      bg: 'bg-mention-project',
      text: 'text-mention-project',
      hex: '#A855F7', // purple-500 - 보라색
    },
    event: {
      bg: 'bg-mention-event',
      text: 'text-mention-event',
      hex: '#F59E0B', // amber-500 - 주황색
    },
    unknown: {
      bg: 'bg-gray-400',
      text: 'text-gray-400',
      hex: '#9CA3AF', // gray-400
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
    primaryBg: 'bg-bg-primary',
    cardBg: 'bg-bg-card',
    cardBgHover: 'hover:bg-bg-secondary/50',
    stickyMetadataBg: 'bg-bg-primary/95',

    // 텍스트
    textPrimary: 'text-white',
    textSecondary: 'text-gray-300',
    textMuted: 'text-text-muted',
    textPlaceholder: 'text-gray-400',

    // 테두리
    border: 'border-border-main',

    // 상태별 색상
    loading: {
      bg: 'bg-bg-card',
    },
    error: {
      text: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    aiProcessing: {
      text: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    delete: {
      text: 'text-red-400',
      bg: 'bg-red-500/10',
      bgHover: 'hover:bg-red-500/10',
    },

    // 검색 하이라이트
    searchHighlight: {
      borderColor: '#EAB308',      // yellow-500
      borderColorLight: '#FACC15', // yellow-400
      shadowColor: 'rgba(234, 179, 8, 0.6)', // yellow-500 with opacity
    },

    // 버튼 hover
    buttonHover: 'hover:bg-gray-700',

    // 인터랙티브 색상
    interactive: {
      primary: '#3B82F6',           // blue-500
      primaryBg: 'bg-blue-500',
      primaryBgHover: 'hover:bg-blue-600',
      primaryBgLight: 'bg-blue-500/20',
      primaryText: 'text-blue-400',

      success: '#22C55E',           // green-500
      successBg: 'bg-green-500',
      successText: 'text-green-400',

      warning: '#EAB308',           // yellow-500
      warningBg: 'bg-yellow-500/30',
      warningText: 'text-yellow-200',

      danger: '#EF4444',            // red-500
      dangerBg: 'bg-red-500/10',
      dangerText: 'text-red-400',
      dangerTextHover: 'hover:text-red-300',
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
      default: '#FFFFFF',       // white
      muted: '#9CA3AF',         // gray-400
      orange: '#FB923C',        // orange-400
      blue: '#60A5FA',          // blue-400
      yellow: '#FACC15',        // yellow-400
      green: '#4ADE80',         // green-400
      purple: '#C084FC',        // purple-400
      cyan: '#22D3EE',          // cyan-400
      indigo: '#818CF8',        // indigo-400
      red: '#F87171',           // red-400
    },
  },

  timeline: {
    background: '#0F172A', // bg-secondary
    entityLine: '#374151', // gray-700
    entityLineActive: '#4B5563', // gray-600
    timeScale: {
      text: '#9CA3AF', // gray-400
      line: '#374151', // gray-700
      majorLine: '#4B5563', // gray-600
    },
    memo: {
      color: '#F8FAFC', // slate-50 - 밝은 흰색 계열
      hoverOpacity: 0.9,
      selectedOpacity: 1,
    },
  },

  drawer: {
    overlay: 'rgba(0, 0, 0, 0.5)', // bg-black/50
    background: '#0F172A', // bg-primary
    border: '#1F2937', // border-main
    header: {
      title: '#FFFFFF', // text-white
      closeButton: '#9CA3AF', // text-muted
      closeButtonHover: '#FFFFFF', // hover:text-white
    },
    section: {
      title: '#9CA3AF', // text-gray-400
      text: '#FFFFFF', // text-white
      textMuted: '#9CA3AF', // text-gray-400
    },
    card: {
      background: '#0F172A', // bg-primary
      border: '#1F2937', // border-main
      borderHover: '#6B7280', // hover:border-gray-500
    },
    button: {
      primary: {
        bg: '#3B82F6', // blue-500
        bgHover: '#2563EB', // blue-600
        text: '#FFFFFF', // text-white
      },
      secondary: {
        bg: '#F97316', // orange-500
        bgHover: '#EA580C', // orange-600
        text: '#FFFFFF', // text-white
      },
    },
  },

  tooltip: {
    background: '#1a1a1a', // 어두운 배경
    border: '#2d2d2d', // 테두리
    shadow: 'rgba(0, 0, 0, 0.5)', // 그림자
    divider: '#2d2d2d', // 구분선
    title: '#888888', // 날짜 텍스트
    text: '#FFFFFF', // 본문 텍스트
    hint: '#666666', // 힌트 텍스트
  },
}

/**
 * Entity type에 따른 색상 클래스 반환
 */
export function getEntityTypeColor(
  type: string | null | undefined,
  theme: ThemeColors = defaultTheme
): { bg: string; text: string; hex: string } {
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
 * Mention highlight용 색상 클래스 생성
 * @param type - Entity type
 * @param isEmphasized - 현재 entity section의 entity인지 여부
 * @param theme - 테마 객체
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
 * 현재 테마 가져오기
 * 나중에 Context나 사용자 설정에서 가져오도록 확장 가능
 */
export function getCurrentTheme(): ThemeColors {
  // TODO: 나중에 UserSettingsContext에서 가져오기
  return defaultTheme
}
