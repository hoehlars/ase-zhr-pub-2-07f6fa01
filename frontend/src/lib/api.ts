// Zentraler API-Client für den Calvin Booking Service.
//
// Der Booking Service liefert ausschließlich Buchungen und Belegungen und kennt
// gemäß ADR-0002 nur IDs (raumId/standortId). Ressourcedaten (Standorte, Räume,
// Ausstattung) bleiben im Frontend (mock-data) und werden dort über die IDs
// aufgelöst.

import type { Buchung } from "@/lib/mock-data"

const BACKEND_PORT = 3001

// Demo-Nutzer für Basic-Auth ohne Passwortprüfung (ADR-0003): der Nutzername ist
// der Identifier, dem Buchungen zugeordnet werden. Entspricht dem im Backend
// geseedeten Nutzer, damit dessen Buchungen ("Meine Buchungen") erscheinen.
const DEMO_NUTZER = "calvin"
const AUTH_HEADER = `Basic ${btoa(`${DEMO_NUTZER}:`)}`

/** Basis-URL für API-Aufrufe – funktioniert lokal, in Codespaces und im Proxy. */
function backendBaseUrl(): string {
  const { hostname } = window.location
  // GitHub Codespaces: <name>-<port>.app.github.dev → Backend liegt unter -3001.
  if (hostname.endsWith(".app.github.dev")) {
    const host = hostname.replace(
      /-\d+\.app\.github\.dev$/,
      `-${BACKEND_PORT}.app.github.dev`,
    )
    return `https://${host}/`
  }
  // Lokal & hinter dem Crucible-Proxy: über den Vite-Proxy (/api → :3001).
  // BASE_URL ist "/" lokal bzw. der Proxy-Unterpfad und endet stets mit "/" —
  // so lösen die Aufrufe unabhängig von der aktuellen Route korrekt auf
  // (siehe .claude/rules/betrieb-hinter-proxy.md).
  return import.meta.env.BASE_URL
}

function url(path: string): string {
  return `${backendBaseUrl()}${path.replace(/^\//, "")}`
}

/** Raum-/Buchungs-übergreifendes Zeitfenster, wie es das Backend liefert. */
export interface Zeitfenster {
  von: string
  bis: string
}

/** Eingabedaten für eine neue Buchung (CLVN-019). */
export interface NeueBuchung {
  raumId: string
  standortId: string
  datum: string
  von: string
  bis: string
  titel: string
  notiz?: string
}

/** Der Raum ist im gewünschten Zeitraum bereits belegt (HTTP 409, QS-2). */
export class KonfliktError extends Error {}

/** Roher fetch inkl. Basic-Auth – auch für einfache Statuschecks nutzbar. */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(url(path), {
    ...init,
    headers: { Authorization: AUTH_HEADER, ...init?.headers },
  })
}

async function fehlertext(res: Response): Promise<string> {
  try {
    const body = await res.json()
    return typeof body?.detail === "string" ? body.detail : res.statusText
  } catch {
    return res.statusText
  }
}

async function jsonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  })
  if (res.status === 409) throw new KonfliktError(await fehlertext(res))
  if (!res.ok) throw new Error(await fehlertext(res))
  return (await res.json()) as T
}

/** Eigene Buchungen des Nutzers, chronologisch (CLVN-022/023). */
export function fetchBuchungen(): Promise<Buchung[]> {
  return jsonFetch<Buchung[]>("/api/buchungen")
}

/** Belegte Zeitfenster eines Raums an einem Datum (CLVN-011). */
export function fetchBelegungen(raumId: string, datum: string): Promise<Zeitfenster[]> {
  const params = new URLSearchParams({ datum })
  return jsonFetch<Zeitfenster[]>(
    `/api/raeume/${encodeURIComponent(raumId)}/belegungen?${params}`,
  )
}

/** Sendet eine Raumbuchung ab und liefert die Bestätigung (CLVN-019/020). */
export function erstelleBuchung(payload: NeueBuchung): Promise<Buchung> {
  return jsonFetch<Buchung>("/api/buchungen", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}
