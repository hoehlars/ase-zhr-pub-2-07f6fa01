import { useSearchParams } from "react-router-dom"
import { HEUTE } from "@/lib/mock-data"

/** Standard-Zeitfenster beim Einstieg. */
const DEFAULT_VON = "09:00"
const DEFAULT_BIS = "10:00"

export interface BuchungsAuswahl {
  datum: string
  von: string
  bis: string
}

/**
 * Hält die aktuelle Datum/Zeit-Auswahl in den URL-Query-Parametern.
 * So bleibt die Auswahl über den gesamten Buchungs-Flow (Liste → Details →
 * Bestätigen) erhalten und ist als Link teilbar.
 */
export function useBuchungsAuswahl() {
  const [params, setParams] = useSearchParams()

  const auswahl: BuchungsAuswahl = {
    datum: params.get("datum") ?? HEUTE,
    von: params.get("von") ?? DEFAULT_VON,
    bis: params.get("bis") ?? DEFAULT_BIS,
  }

  function setAuswahl(next: Partial<BuchungsAuswahl>) {
    const p = new URLSearchParams(params)
    for (const [key, value] of Object.entries(next)) {
      if (value) p.set(key, value)
    }
    setParams(p, { replace: true })
  }

  /** Query-String (?datum=…&von=…&bis=…) zum Anhängen an interne Links. */
  const query = `?${new URLSearchParams({
    datum: auswahl.datum,
    von: auswahl.von,
    bis: auswahl.bis,
  }).toString()}`

  return { ...auswahl, setAuswahl, query }
}
