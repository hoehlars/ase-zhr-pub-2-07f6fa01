import { useEffect, useState } from "react"
import { fetchBelegungen, type Zeitfenster } from "@/lib/api"

interface BelegungenState {
  /** Belegte Zeitfenster je Raum-ID. Fehlt ein Raum, ist er (noch) nicht geladen. */
  byRaum: Record<string, Zeitfenster[]>
  loading: boolean
  error: string | null
}

/**
 * Lädt die belegten Zeitfenster (CLVN-011) für eine Menge von Räumen an einem
 * Datum aus dem Booking Service. Aktualisiert sich, wenn sich Räume oder Datum
 * ändern; veraltete Antworten (Race) werden verworfen.
 */
export function useBelegungen(raumIds: string[], datum: string): BelegungenState {
  const [state, setState] = useState<BelegungenState>({
    byRaum: {},
    loading: true,
    error: null,
  })

  // Stabiler Schlüssel für die Abhängigkeit (Array-Identität wechselt je Render).
  const key = raumIds.join(",")

  useEffect(() => {
    let abgebrochen = false
    setState((s) => ({ ...s, loading: true }))

    Promise.all(
      raumIds.map(
        async (id) => [id, await fetchBelegungen(id, datum)] as const,
      ),
    )
      .then((eintraege) => {
        if (abgebrochen) return
        setState({ byRaum: Object.fromEntries(eintraege), loading: false, error: null })
      })
      .catch(() => {
        if (abgebrochen) return
        setState({ byRaum: {}, loading: false, error: "Belegungen nicht erreichbar" })
      })

    return () => {
      abgebrochen = true
    }
    // raumIds wird über `key` abgebildet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, datum])

  return state
}
