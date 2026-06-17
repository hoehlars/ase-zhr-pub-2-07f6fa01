import { Link } from "react-router-dom"
import { CalendarX2, ChevronRight, MapPin } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useBuchungen } from "@/lib/buchungen-context"
import {
  getRaum,
  getStandort,
  formatDatum,
  toMinutes,
  type Buchung,
  HEUTE,
} from "@/lib/mock-data"

function sortKey(b: Buchung): number {
  // yyyymmdd * 10000 + minuten → chronologisch vergleichbar
  return Number(b.datum.replaceAll("-", "")) * 10000 + toMinutes(b.von)
}

function BuchungZeile({ buchung, vergangen }: { buchung: Buchung; vergangen?: boolean }) {
  const raum = getRaum(buchung.raumId)
  const standort = raum ? getStandort(raum.standortId) : undefined
  return (
    <Link to={`/buchung/${buchung.id}`} className="block">
      <Card
        className={cn(
          "flex flex-row items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/50",
          vergangen && "opacity-60",
        )}
      >
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {formatDatum(buchung.datum)} · {buchung.von}–{buchung.bis}
          </p>
          <p className="font-medium">{buchung.titel}</p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {raum?.name} · {standort?.name}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
      </Card>
    </Link>
  )
}

export default function MeineBuchungen() {
  const { buchungen } = useBuchungen()
  const heuteKey = Number(HEUTE.replaceAll("-", ""))

  const anstehend = buchungen
    .filter((b) => Number(b.datum.replaceAll("-", "")) >= heuteKey)
    .sort((a, b) => sortKey(a) - sortKey(b))
  const vergangen = buchungen
    .filter((b) => Number(b.datum.replaceAll("-", "")) < heuteKey)
    .sort((a, b) => sortKey(b) - sortKey(a))

  const leer = buchungen.length === 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Meine Buchungen</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Übersicht aller deiner Raumbuchungen.
        </p>
      </div>

      {leer ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <CalendarX2 className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">Du hast noch keine Buchungen.</p>
          <Link to="/" className={cn(buttonVariants())}>
            Raum buchen
          </Link>
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Anstehend ({anstehend.length})
            </h2>
            {anstehend.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Keine anstehenden Buchungen.
              </p>
            ) : (
              <div className="space-y-3">
                {anstehend.map((b) => (
                  <BuchungZeile key={b.id} buchung={b} />
                ))}
              </div>
            )}
          </section>

          {vergangen.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">
                Vergangen ({vergangen.length})
              </h2>
              <div className="space-y-3">
                {vergangen.map((b) => (
                  <BuchungZeile key={b.id} buchung={b} vergangen />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
