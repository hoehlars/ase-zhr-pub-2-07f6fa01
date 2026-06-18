import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { erstelleBuchung, fetchBuchungen } from "@/lib/api"
import { getRaum, belegungen, HEUTE, type Buchung } from "@/lib/mock-data"

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
  loading: boolean
  error: string | null
  getBuchung: (id: string) => Buchung | undefined
  /** Sendet die Buchung an den Booking Service und liefert die Bestätigung. */
  addBuchung: (data: NeueBuchung) => Promise<Buchung>
  cancelBuchung: (id: string) => void
  istStornierbar: (buchung: Buchung) => boolean
}

const BuchungenContext = createContext<BuchungenContextValue | null>(null)

export function BuchungenProvider({ children }: { children: ReactNode }) {
  const [buchungen, setBuchungen] = useState<Buchung[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let abgebrochen = false
    fetchBuchungen()
      .then((daten) => {
        if (abgebrochen) return
        setBuchungen(daten)
        setError(null)
      })
      .catch(() => !abgebrochen && setError("Buchungen konnten nicht geladen werden"))
      .finally(() => !abgebrochen && setLoading(false))
    return () => {
      abgebrochen = true
    }
  }, [])

  function getBuchung(id: string) {
    return buchungen.find((b) => b.id === id)
  }

  const addBuchung = useCallback(async (data: NeueBuchung): Promise<Buchung> => {
    // Standort ergibt sich aus dem Raum (ADR-0002: das Frontend kennt die Ressourcen).
    const standortId = getRaum(data.raumId)?.standortId ?? ""
    const neu = await erstelleBuchung({ ...data, standortId })
    setBuchungen((prev) => [...prev, neu])
    return neu
  }, [])

  function cancelBuchung(id: string): void {
    setBuchungen((prev) => prev.filter((b) => b.id !== id))
    // Entsprechende Belegung entfernen, damit der Raum wieder verfügbar ist.
    const idx = belegungen.findIndex((bel) => bel.id === `bel-${id}`)
    if (idx !== -1) belegungen.splice(idx, 1)
  }

  function istStornierbar(buchung: Buchung): boolean {
    // Vergangene Buchungen (Datum vor heute) können nicht storniert werden.
    return buchung.datum >= HEUTE
  }

  return (
    <BuchungenContext.Provider
      value={{ buchungen, loading, error, getBuchung, addBuchung, cancelBuchung, istStornierbar }}
    >
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
