'use client'

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react'

interface AIUpdateContextType {
  updatingEntityIds: Set<string>
  addUpdatingEntity: (entityId: string) => void
  removeUpdatingEntity: (entityId: string) => void
  isEntityUpdating: (entityId: string) => boolean
}

const AIUpdateContext = createContext<AIUpdateContextType | undefined>(
  undefined
)

export function AIUpdateProvider({ children }: { children: ReactNode }) {
  const [updatingEntityIds, setUpdatingEntityIds] = useState<Set<string>>(
    new Set()
  )

  // 함수들을 메모이제이션하여 불필요한 리렌더링 방지
  const addUpdatingEntity = useCallback((entityId: string) => {
    setUpdatingEntityIds((prev) => new Set(prev).add(entityId))
  }, [])

  const removeUpdatingEntity = useCallback((entityId: string) => {
    setUpdatingEntityIds((prev) => {
      const next = new Set(prev)
      next.delete(entityId)
      return next
    })
  }, [])

  const isEntityUpdating = useCallback((entityId: string) => {
    return updatingEntityIds.has(entityId)
  }, [updatingEntityIds])

  // value 객체를 메모이제이션
  const value = useMemo(() => ({
    updatingEntityIds,
    addUpdatingEntity,
    removeUpdatingEntity,
    isEntityUpdating,
  }), [updatingEntityIds, addUpdatingEntity, removeUpdatingEntity, isEntityUpdating])

  return (
    <AIUpdateContext.Provider value={value}>
      {children}
    </AIUpdateContext.Provider>
  )
}

export function useAIUpdate() {
  const context = useContext(AIUpdateContext)
  if (!context) {
    throw new Error('useAIUpdate must be used within AIUpdateProvider')
  }
  return context
}
