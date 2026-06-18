import { Link } from "react-router-dom"
import { CalendarX2, ChevronRight, MapPin, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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

function BuchungZeile({
  buchung,
  vergangen,
  onStornieren,
}: {
  buchung: Buchung
  vergangen?: boolean
  onStornieren?: () => void
}) {
  const raum = getRaum(buchung.raumId)
  const standort = raum ? getStandort(raum.standortId) : undefined
  return (
    <Card
      className={cn(
        "flex flex-row items-center justify-between gap-4 p-4",
        vergangen && "opacity-60",
      )}
    >
      <Link to={`/buchung/${buchung.id}`} className="min-w-0 flex-1">
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
      </Link>

      <div className="flex shrink-0 items-center gap-2">
        {!vergangen && onStornieren && (
          <AlertDialog>
            <AlertDialogTrigger
              className={cn(
                buttonVariants({ variant: "destructive", size: "icon-sm" }),
              )}
              aria-label="Buchung stornieren"
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="h-4 w-4" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Buchung stornieren?</AlertDialogTitle>
                <AlertDialogDescription>
                  Möchtest du die Buchung &ldquo;{buchung.titel}&rdquo; am{" "}
                  {formatDatum(buchung.datum)} ({buchung.von}–{buchung.bis})
                  wirklich stornieren? Der Raum wird danach sofort wieder für
                  andere Mitarbeiter verfügbar.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={onStornieren}
                >
                  Ja, stornieren
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <Link to={`/buchung/${buchung.id}`}>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        </Link>
      </div>
    </Card>
  )
}

export default function MeineBuchungen() {
  const { buchungen, loading, error, cancelBuchung, istStornierbar } = useBuchungen()
  const heuteKey = Number(HEUTE.replaceAll("-", ""))

  const anstehend = buchungen
    .filter((b) => Number(b.datum.replaceAll("-", "")) >= heuteKey)
    .sort((a, b) => sortKey(a) - sortKey(b))
  const vergangen = buchungen
    .filter((b) => Number(b.datum.replaceAll("-", "")) < heuteKey)
    .sort((a, b) => sortKey(b) - sortKey(a))

  const leer = buchungen.length === 0

  function handleStornieren(buchung: Buchung) {
    cancelBuchung(buchung.id)
    toast.success("Buchung storniert", {
      description: `„${buchung.titel}" am ${formatDatum(buchung.datum)} wurde erfolgreich storniert.`,
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Meine Buchungen</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Übersicht aller deiner Raumbuchungen.
        </p>
      </div>

      {loading ? (
        <p className="py-12 text-center text-muted-foreground">Lädt…</p>
      ) : error ? (
        <p className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {error}. Ist das Backend erreichbar?
        </p>
      ) : leer ? (
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
                  <BuchungZeile
                    key={b.id}
                    buchung={b}
                    onStornieren={
                      istStornierbar(b) ? () => handleStornieren(b) : undefined
                    }
                  />
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
