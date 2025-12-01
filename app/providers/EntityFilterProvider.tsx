'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface EntityFilterContextType {
  /** 현재 필터링할 entity ID들 */
  filteredEntityIds: string[]
  /** 필터링할 entity ID 설정 */
  setFilteredEntityIds: (ids: string[]) => void
}

const EntityFilterContext = createContext<EntityFilterContextType | null>(null)

export function EntityFilterProvider({ children }: { children: ReactNode }) {
  const [filteredEntityIds, setFilteredEntityIds] = useState<string[]>([])

  return (
    <EntityFilterContext.Provider
      value={{ filteredEntityIds, setFilteredEntityIds }}
    >
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
