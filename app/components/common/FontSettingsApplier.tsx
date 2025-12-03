'use client'

import { useEffect } from 'react'
import { useSettings } from '@/app/providers/SettingsProvider'

/**
 * 폰트 설정을 body 요소에 적용하는 컴포넌트
 * data-font-size, data-font-family attribute를 통해 CSS에서 스타일 적용
 */
export default function FontSettingsApplier() {
  const { fontSize, fontFamily } = useSettings()

  useEffect(() => {
    // body 요소에 data attribute 적용
    document.body.setAttribute('data-font-size', fontSize)
    document.body.setAttribute('data-font-family', fontFamily)
  }, [fontSize, fontFamily])

  return null // UI 렌더링 없음
}
