'use client'

import { createContext, useContext, useState, useMemo, ReactNode, Dispatch, SetStateAction } from 'react'

interface EntityFilterContextType {
  /** 현재 필터링할 entity ID들 */
  filteredEntityIds: string[]
  /** 필터링할 entity ID 설정 (함수형 업데이트 지원) */
  setFilteredEntityIds: Dispatch<SetStateAction<string[]>>
}

const EntityFilterContext = createContext<EntityFilterContextType | null>(null)

export function EntityFilterProvider({ children }: { children: ReactNode }) {
  const [filteredEntityIds, setFilteredEntityIds] = useState<string[]>([])

  // value 객체를 메모이제이션하여 불필요한 리렌더링 방지
  const value = useMemo(
    () => ({ filteredEntityIds, setFilteredEntityIds }),
    [filteredEntityIds]
  )

  return (
    <EntityFilterContext.Provider value={value}>
      {children}
    </EntityFilterContext.Provider>
  )
}

export function useEntityFilter() {
  const context = useContext(EntityFilterContext)
  if (!context) {
    throw new Error('useEntityFilter must be used within EntityFilterProvider')
  }
  return context
}
