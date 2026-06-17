import { createContext, useContext, useState, type ReactNode } from "react"
import {
  belegungen,
  eigeneBuchungen,
  type Buchung,
} from "@/lib/mock-data"

interface NeueBuchung {
  raumId: string
  datum: string
  von: string
  bis: string
  titel: string
  notiz?: string
}

interface BuchungenContextValue {
  buchungen: Buchung[]
  getBuchung: (id: string) => Buchung | undefined
  addBuchung: (data: NeueBuchung) => Buchung
}

const BuchungenContext = createContext<BuchungenContextValue | null>(null)

let counter = 0
function naechsteId(): string {
  counter += 1
  return `mb-neu-${counter}`
}

export function BuchungenProvider({ children }: { children: ReactNode }) {
  const [buchungen, setBuchungen] = useState<Buchung[]>(() => [...eigeneBuchungen])

  function getBuchung(id: string) {
    return buchungen.find((b) => b.id === id)
  }

  function addBuchung(data: NeueBuchung): Buchung {
    const neu: Buchung = { id: naechsteId(), ...data }
    setBuchungen((prev) => [...prev, neu])
    // Raum für den Zeitraum als belegt markieren (verhindert Doppelbuchung).
    belegungen.push({
      id: `bel-${neu.id}`,
      raumId: neu.raumId,
      datum: neu.datum,
      von: neu.von,
      bis: neu.bis,
    })
    return neu
  }

  return (
    <BuchungenContext.Provider value={{ buchungen, getBuchung, addBuchung }}>
      {children}
    </BuchungenContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBuchungen(): BuchungenContextValue {
  const ctx = useContext(BuchungenContext)
  if (!ctx)
    throw new Error("useBuchungen muss innerhalb von BuchungenProvider verwendet werden")
  return ctx
}
