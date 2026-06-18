import { cn } from "@/lib/utils"
import type { Zeitfenster } from "@/lib/api"
import {
  toMinutes,
  ueberschneidet,
  OEFFNUNG_VON,
  OEFFNUNG_BIS,
} from "@/lib/mock-data"

const SLOT_MIN = 30

function minutesToTime(min: number): string {
  const h = String(Math.floor(min / 60)).padStart(2, "0")
  const m = String(min % 60).padStart(2, "0")
  return `${h}:${m}`
}

/**
 * Tages-Belegungsleiste für einen Raum: zeigt freie und belegte Zeitfenster
 * (08:00–18:00, 30-Min-Raster). Belegte Slots sind nicht wählbar, freie Slots
 * können angeklickt werden, um den Beginn der Buchung zu setzen.
 */
export function Belegungsleiste({
  belegungen,
  von,
  bis,
  onSelectVon,
}: {
  /** Belegte Zeitfenster des Raums am gewählten Datum (aus dem Backend). */
  belegungen: Zeitfenster[]
  von: string
  bis: string
  onSelectVon?: (neuVon: string, neuBis: string) => void
}) {
  const start = toMinutes(OEFFNUNG_VON)
  const ende = toMinutes(OEFFNUNG_BIS)
  const vonMin = toMinutes(von)
  const bisMin = toMinutes(bis)
  const dauer = Math.max(bisMin - vonMin, SLOT_MIN)

  const slots: { startMin: number; belegt: boolean; gewaehlt: boolean }[] = []
  for (let t = start; t < ende; t += SLOT_MIN) {
    const belegt = belegungen.some((b) =>
      ueberschneidet(minutesToTime(t), minutesToTime(t + SLOT_MIN), b.von, b.bis),
    )
    const gewaehlt = t >= vonMin && t < bisMin
    slots.push({ startMin: t, belegt, gewaehlt })
  }

  const stunden: number[] = []
  for (let t = start; t <= ende; t += 60) stunden.push(t)

  function handleClick(slotStart: number, belegt: boolean) {
    if (belegt || !onSelectVon) return
    const neuBis = Math.min(slotStart + dauer, ende)
    onSelectVon(minutesToTime(slotStart), minutesToTime(neuBis))
  }

  return (
    <div className="space-y-2">
      {/* Slot-Leiste */}
      <div className="flex gap-px overflow-hidden rounded-md border">
        {slots.map((slot) => (
          <button
            key={slot.startMin}
            type="button"
            disabled={slot.belegt}
            onClick={() => handleClick(slot.startMin, slot.belegt)}
            title={`${minutesToTime(slot.startMin)}–${minutesToTime(
              slot.startMin + SLOT_MIN,
            )} · ${slot.belegt ? "belegt" : "frei"}`}
            className={cn(
              "h-9 flex-1 transition-colors",
              slot.belegt
                ? "cursor-not-allowed bg-muted-foreground/25"
                : slot.gewaehlt
                  ? "bg-primary"
                  : "cursor-pointer bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60",
            )}
          />
        ))}
      </div>

      {/* Stunden-Achse */}
      <div className="flex justify-between text-xs text-muted-foreground">
        {stunden.map((t) => (
          <span key={t}>{minutesToTime(t)}</span>
        ))}
      </div>

      {/* Legende */}
      <div className="flex flex-wrap gap-4 pt-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-emerald-100 dark:bg-emerald-900/40" />
          frei
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-primary" /> deine Wahl
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-muted-foreground/25" />{" "}
          belegt (nicht wählbar)
        </span>
      </div>
    </div>
  )
}
