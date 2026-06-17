import { createContext, useContext, useState, type ReactNode } from "react"
import { DEFAULT_STANDORT_ID } from "@/lib/mock-data"

interface StandortContextValue {
  standortId: string
  setStandortId: (id: string) => void
}

const StandortContext = createContext<StandortContextValue | null>(null)

export function StandortProvider({ children }: { children: ReactNode }) {
  const [standortId, setStandortId] = useState<string>(DEFAULT_STANDORT_ID)
  return (
    <StandortContext.Provider value={{ standortId, setStandortId }}>
      {children}
    </StandortContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStandort(): StandortContextValue {
  const ctx = useContext(StandortContext)
  if (!ctx) throw new Error("useStandort muss innerhalb von StandortProvider verwendet werden")
  return ctx
}
