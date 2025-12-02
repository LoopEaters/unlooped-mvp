'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

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

  const addUpdatingEntity = (entityId: string) => {
    setUpdatingEntityIds((prev) => new Set(prev).add(entityId))
  }

  const removeUpdatingEntity = (entityId: string) => {
    setUpdatingEntityIds((prev) => {
      const next = new Set(prev)
      next.delete(entityId)
      return next
    })
  }

  const isEntityUpdating = (entityId: string) => {
    return updatingEntityIds.has(entityId)
  }

  return (
    <AIUpdateContext.Provider
      value={{
        updatingEntityIds,
        addUpdatingEntity,
        removeUpdatingEntity,
        isEntityUpdating,
      }}
    >
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
