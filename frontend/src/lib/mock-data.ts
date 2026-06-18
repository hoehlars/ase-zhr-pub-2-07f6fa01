// Zentrale Mock-Daten für den Calvin-Prototyp (kein Backend).
// Alle Daten sind frei erfunden, aber plausibel: echte INNOQ-Standorte,
// glaubwürdige Raumnamen, realistische Zeitslots.

export type AusstattungsTyp =
  | "Bildschirm"
  | "Whiteboard"
  | "Videokonferenz"
  | "Flipchart"
  | "Telefonkonferenz"

export interface Standort {
  id: string
  /** Stadtname, dient zugleich als Anzeigename */
  name: string
}

export interface Raum {
  id: string
  standortId: string
  name: string
  /** Maximale Personenzahl */
  kapazitaet: number
  /** z.B. "2. OG" */
  etage: string
  raumnummer: string
  ausstattung: AusstattungsTyp[]
  beschreibung: string
}

/** Eine eigene Buchung des angemeldeten Mitarbeiters. */
export interface Buchung {
  id: string
  raumId: string
  datum: string
  von: string
  bis: string
  titel: string
  notiz?: string
}

// --- Konstanten ---------------------------------------------------------

/** Fixes "heute" für den Prototyp (siehe Projektkontext). */
export const HEUTE = "2026-06-17"

/** Büroöffnungszeiten – Grenzen für die Zeitauswahl. */
export const OEFFNUNG_VON = "08:00"
export const OEFFNUNG_BIS = "18:00"

// --- Standorte ----------------------------------------------------------

export const standorte: Standort[] = [
  { id: "monheim", name: "Monheim" },
  { id: "berlin", name: "Berlin" },
  { id: "hamburg", name: "Hamburg" },
  { id: "koeln", name: "Köln" },
  { id: "muenchen", name: "München" },
  { id: "zuerich", name: "Zürich" },
  { id: "baar", name: "Baar" },
  { id: "offenbach", name: "Offenbach" },
]

/** Standardmäßig vorausgewählter Standort. */
export const DEFAULT_STANDORT_ID = "koeln"

// --- Räume --------------------------------------------------------------

export const raeume: Raum[] = [
  // Köln
  {
    id: "koeln-rhein",
    standortId: "koeln",
    name: "Rhein",
    kapazitaet: 8,
    etage: "2. OG",
    raumnummer: "204",
    ausstattung: ["Bildschirm", "Whiteboard", "Videokonferenz"],
    beschreibung:
      "Heller Besprechungsraum mit Blick auf den Innenhof. Ideal für Team-Meetings und Kundenworkshops.",
  },
  {
    id: "koeln-dom",
    standortId: "koeln",
    name: "Dom",
    kapazitaet: 12,
    etage: "3. OG",
    raumnummer: "311",
    ausstattung: ["Bildschirm", "Videokonferenz", "Flipchart"],
    beschreibung:
      "Großer Konferenzraum für Workshops und Präsentationen mit großzügiger Bestuhlung.",
  },
  {
    id: "koeln-severin",
    standortId: "koeln",
    name: "Severin",
    kapazitaet: 4,
    etage: "2. OG",
    raumnummer: "207",
    ausstattung: ["Whiteboard", "Telefonkonferenz"],
    beschreibung:
      "Kompakter Raum für kurze Besprechungen und fokussierte 1:1-Gespräche.",
  },
  {
    id: "koeln-hohenzollern",
    standortId: "koeln",
    name: "Hohenzollern",
    kapazitaet: 6,
    etage: "1. OG",
    raumnummer: "105",
    ausstattung: ["Bildschirm", "Whiteboard", "Videokonferenz", "Flipchart"],
    beschreibung:
      "Vielseitiger Raum mit moderner Ausstattung, gut für hybride Meetings.",
  },

  // Berlin
  {
    id: "berlin-spree",
    standortId: "berlin",
    name: "Spree",
    kapazitaet: 10,
    etage: "4. OG",
    raumnummer: "401",
    ausstattung: ["Bildschirm", "Videokonferenz", "Whiteboard"],
    beschreibung:
      "Geräumiger Raum mit Dachterrassen-Zugang, beliebt für Workshops.",
  },
  {
    id: "berlin-brandenburg",
    standortId: "berlin",
    name: "Brandenburg",
    kapazitaet: 6,
    etage: "4. OG",
    raumnummer: "408",
    ausstattung: ["Bildschirm", "Whiteboard"],
    beschreibung: "Ruhiger Besprechungsraum für Team-Abstimmungen.",
  },
  {
    id: "berlin-mueggelsee",
    standortId: "berlin",
    name: "Müggelsee",
    kapazitaet: 4,
    etage: "3. OG",
    raumnummer: "305",
    ausstattung: ["Telefonkonferenz"],
    beschreibung: "Kleiner Raum für vertrauliche Gespräche und Calls.",
  },

  // Hamburg
  {
    id: "hamburg-elbe",
    standortId: "hamburg",
    name: "Elbe",
    kapazitaet: 12,
    etage: "5. OG",
    raumnummer: "502",
    ausstattung: ["Bildschirm", "Videokonferenz", "Flipchart", "Whiteboard"],
    beschreibung:
      "Großer Workshop-Raum mit Hafenblick und flexibler Möblierung.",
  },
  {
    id: "hamburg-alster",
    standortId: "hamburg",
    name: "Alster",
    kapazitaet: 6,
    etage: "5. OG",
    raumnummer: "509",
    ausstattung: ["Bildschirm", "Whiteboard"],
    beschreibung: "Mittelgroßer Raum für Projektmeetings.",
  },
  {
    id: "hamburg-speicher",
    standortId: "hamburg",
    name: "Speicher",
    kapazitaet: 4,
    etage: "4. OG",
    raumnummer: "417",
    ausstattung: ["Whiteboard", "Telefonkonferenz"],
    beschreibung: "Gemütlicher Raum im Backstein-Stil für kleine Runden.",
  },

  // Monheim
  {
    id: "monheim-rhein",
    standortId: "monheim",
    name: "Rheinblick",
    kapazitaet: 8,
    etage: "2. OG",
    raumnummer: "210",
    ausstattung: ["Bildschirm", "Videokonferenz", "Whiteboard"],
    beschreibung: "Modern ausgestatteter Raum für Team- und Kundentermine.",
  },
  {
    id: "monheim-marienburg",
    standortId: "monheim",
    name: "Marienburg",
    kapazitaet: 5,
    etage: "1. OG",
    raumnummer: "112",
    ausstattung: ["Whiteboard", "Flipchart"],
    beschreibung: "Kreativraum mit viel Wandfläche für Workshops.",
  },

  // München
  {
    id: "muenchen-isar",
    standortId: "muenchen",
    name: "Isar",
    kapazitaet: 10,
    etage: "3. OG",
    raumnummer: "301",
    ausstattung: ["Bildschirm", "Videokonferenz", "Whiteboard"],
    beschreibung: "Großzügiger Konferenzraum mit Tageslicht.",
  },
  {
    id: "muenchen-olympia",
    standortId: "muenchen",
    name: "Olympia",
    kapazitaet: 6,
    etage: "3. OG",
    raumnummer: "308",
    ausstattung: ["Bildschirm", "Whiteboard"],
    beschreibung: "Solider Besprechungsraum für den Projektalltag.",
  },
  {
    id: "muenchen-viktualien",
    standortId: "muenchen",
    name: "Viktualien",
    kapazitaet: 4,
    etage: "2. OG",
    raumnummer: "215",
    ausstattung: ["Telefonkonferenz"],
    beschreibung: "Kompakte Telefonbox für ungestörte Calls.",
  },

  // Zürich
  {
    id: "zuerich-limmat",
    standortId: "zuerich",
    name: "Limmat",
    kapazitaet: 8,
    etage: "2. OG",
    raumnummer: "203",
    ausstattung: ["Bildschirm", "Videokonferenz", "Whiteboard"],
    beschreibung: "Heller Meetingraum im Herzen der Stadt.",
  },
  {
    id: "zuerich-uetliberg",
    standortId: "zuerich",
    name: "Uetliberg",
    kapazitaet: 5,
    etage: "2. OG",
    raumnummer: "209",
    ausstattung: ["Whiteboard", "Flipchart"],
    beschreibung: "Workshop-Raum mit Bergblick.",
  },

  // Baar
  {
    id: "baar-lorze",
    standortId: "baar",
    name: "Lorze",
    kapazitaet: 6,
    etage: "1. OG",
    raumnummer: "104",
    ausstattung: ["Bildschirm", "Whiteboard", "Videokonferenz"],
    beschreibung: "Funktionaler Besprechungsraum für hybride Meetings.",
  },
  {
    id: "baar-zugersee",
    standortId: "baar",
    name: "Zugersee",
    kapazitaet: 10,
    etage: "1. OG",
    raumnummer: "108",
    ausstattung: ["Bildschirm", "Videokonferenz", "Flipchart", "Whiteboard"],
    beschreibung: "Großer Raum für Team-Events und Workshops.",
  },

  // Offenbach
  {
    id: "offenbach-main",
    standortId: "offenbach",
    name: "Main",
    kapazitaet: 8,
    etage: "3. OG",
    raumnummer: "302",
    ausstattung: ["Bildschirm", "Videokonferenz", "Whiteboard"],
    beschreibung: "Zentraler Konferenzraum mit moderner Technik.",
  },
  {
    id: "offenbach-buesing",
    standortId: "offenbach",
    name: "Büsing",
    kapazitaet: 4,
    etage: "2. OG",
    raumnummer: "214",
    ausstattung: ["Whiteboard", "Telefonkonferenz"],
    beschreibung: "Kleiner Raum für fokussierte Besprechungen.",
  },
]

// Hinweis: Bestehende Belegungen und eigene Buchungen liefert der Booking
// Service (Backend). Demodaten dafür werden serverseitig geseedet
// (backend/app/seed.py); das Frontend lädt sie über @/lib/api.

// --- Hilfsfunktionen ----------------------------------------------------

export function getStandort(id: string): Standort | undefined {
  return standorte.find((s) => s.id === id)
}

export function getRaum(id: string): Raum | undefined {
  return raeume.find((r) => r.id === id)
}

export function getRaeumeByStandort(standortId: string): Raum[] {
  return raeume.filter((r) => r.standortId === standortId)
}

/** Minuten seit Mitternacht für "HH:mm". */
export function toMinutes(zeit: string): number {
  const [h, m] = zeit.split(":").map(Number)
  return h * 60 + m
}

/** Prüft, ob sich zwei Zeitfenster überschneiden. */
export function ueberschneidet(
  vonA: string,
  bisA: string,
  vonB: string,
  bisB: string,
): boolean {
  return toMinutes(vonA) < toMinutes(bisB) && toMinutes(vonB) < toMinutes(bisA)
}

/**
 * Ist das Wunschzeitfenster frei, gegeben die belegten Zeitfenster eines Raums?
 * Die Belegungen liefert das Backend (siehe @/lib/api, @/lib/useBelegungen).
 */
export function istFrei(
  belegungen: { von: string; bis: string }[],
  von: string,
  bis: string,
): boolean {
  return !belegungen.some((b) => ueberschneidet(von, bis, b.von, b.bis))
}

/** Dauer zwischen zwei Zeiten als lesbarer Text, z.B. "1 Std 30 Min". */
export function formatDauer(von: string, bis: string): string {
  const min = toMinutes(bis) - toMinutes(von)
  if (min <= 0) return "—"
  const std = Math.floor(min / 60)
  const rest = min % 60
  const teile: string[] = []
  if (std > 0) teile.push(`${std} Std`)
  if (rest > 0) teile.push(`${rest} Min`)
  return teile.join(" ")
}

/** ISO-Datum (yyyy-mm-dd) → "DD.MM.YYYY". */
export function formatDatum(iso: string): string {
  const [y, m, d] = iso.split("-")
  return `${d}.${m}.${y}`
}

/** Auswahloptionen für die Zeit (08:00–18:00 in 30-Min-Schritten). */
export function getZeitOptionen(): string[] {
  const optionen: string[] = []
  for (let min = toMinutes(OEFFNUNG_VON); min <= toMinutes(OEFFNUNG_BIS); min += 30) {
    const h = String(Math.floor(min / 60)).padStart(2, "0")
    const m = String(min % 60).padStart(2, "0")
    optionen.push(`${h}:${m}`)
  }
  return optionen
}
