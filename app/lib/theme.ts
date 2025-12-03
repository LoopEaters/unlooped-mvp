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
    }
    project: {
      bg: string
      text: string
    }
    unknown: {
      bg: string
      text: string
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

    // 버튼 hover
    buttonHover: string
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
    },
    project: {
      bg: 'bg-mention-project',
      text: 'text-mention-project',
    },
    unknown: {
      bg: 'bg-gray-400',
      text: 'text-gray-400',
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

    // 버튼 hover
    buttonHover: 'hover:bg-gray-700',
  },
}

/**
 * Entity type에 따른 색상 클래스 반환
 */
export function getEntityTypeColor(
  type: string | null | undefined,
  theme: ThemeColors = defaultTheme
): { bg: string; text: string } {
  switch (type) {
    case 'person':
      return theme.entityTypes.person
    case 'project':
      return theme.entityTypes.project
    case 'unknown':
    case null:
    case undefined:
      return theme.entityTypes.unknown
    default:
      return theme.entityTypes.unknown
  }
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
