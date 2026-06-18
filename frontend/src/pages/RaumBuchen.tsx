import { useState } from "react"
import { Link } from "react-router-dom"
import { CalendarIcon, Users, Check, X } from "lucide-react"
import { de } from "date-fns/locale"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AusstattungListe } from "@/components/Ausstattung"
import { cn } from "@/lib/utils"
import { useStandort } from "@/lib/standort-context"
import { useBuchungsAuswahl } from "@/lib/useBuchungsAuswahl"
import { useBelegungen } from "@/lib/useBelegungen"
import {
  getRaeumeByStandort,
  getStandort,
  getZeitOptionen,
  formatDatum,
  formatDauer,
  istFrei,
  toMinutes,
  HEUTE,
} from "@/lib/mock-data"

function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function dateToIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export default function RaumBuchen() {
  const { standortId } = useStandort()
  const { datum, von, bis, setAuswahl, query } = useBuchungsAuswahl()
  const [selectedRaumId, setSelectedRaumId] = useState<string | null>(null)

  const standort = getStandort(standortId)
  const raeume = getRaeumeByStandort(standortId)
  const zeiten = getZeitOptionen()
  const zeitraumGueltig = toMinutes(bis) > toMinutes(von)

  // Belegungen aller Räume des Standorts am gewählten Datum (CLVN-011).
  const {
    byRaum,
    loading: belegungenLoading,
    error: belegungenError,
  } = useBelegungen(
    raeume.map((r) => r.id),
    datum,
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Raum buchen</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Wähle Datum und Zeitraum, um verfügbare Konferenzräume zu finden.
        </p>
      </div>

      {/* Such-/Filterleiste */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-1.5">
          <Label>Datum</Label>
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  className="w-[180px] justify-start font-normal"
                >
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  {formatDatum(datum)}
                </Button>
              }
            />
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                locale={de}
                selected={isoToDate(datum)}
                defaultMonth={isoToDate(datum)}
                disabled={{ before: isoToDate(HEUTE) }}
                onSelect={(date) => date && setAuswahl({ datum: dateToIso(date) })}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Von</Label>
          <Select value={von} onValueChange={(v) => v && setAuswahl({ von: v })}>
            <SelectTrigger className="w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {zeiten.map((z) => (
                <SelectItem key={z} value={z}>
                  {z}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Bis</Label>
          <Select value={bis} onValueChange={(v) => v && setAuswahl({ bis: v })}>
            <SelectTrigger className="w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {zeiten.map((z) => (
                <SelectItem key={z} value={z}>
                  {z}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Dauer</span>
          <span
            className={cn(
              "flex h-9 items-center text-sm",
              zeitraumGueltig ? "text-muted-foreground" : "text-destructive",
            )}
          >
            {zeitraumGueltig
              ? formatDauer(von, bis)
              : "Endzeit muss nach Startzeit liegen"}
          </span>
        </div>
      </div>

      {/* Ergebnis-Zusammenfassung */}
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{raeume.length} Räume</span>{" "}
        in {standort?.name} · {formatDatum(datum)}
        {zeitraumGueltig && ` · ${von}–${bis}`}
      </p>

      {/* Raum-Grid */}
      {belegungenError ? (
        <p className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          Verfügbarkeiten konnten nicht geladen werden. Ist das Backend erreichbar?
        </p>
      ) : belegungenLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {raeume.map((raum) => (
            <div
              key={raum.id}
              className="h-48 animate-pulse rounded-xl border bg-muted/40"
            />
          ))}
        </div>
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {raeume.map((raum) => {
          const verfuegbar =
            zeitraumGueltig && istFrei(byRaum[raum.id] ?? [], von, bis)
          const selected = selectedRaumId === raum.id
          // Nur verfügbare Räume sind auswählbar.
          const selectierbar = verfuegbar
          return (
            <Card
              key={raum.id}
              data-testid={`raum-card-${raum.id}`}
              {...(selectierbar
                ? {
                    role: "button",
                    tabIndex: 0,
                    "aria-pressed": selected,
                    onClick: () => setSelectedRaumId(raum.id),
                    onKeyDown: (e: React.KeyboardEvent) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setSelectedRaumId(raum.id)
                      }
                    },
                  }
                : {})}
              className={cn(
                "flex flex-col",
                selectierbar &&
                  "cursor-pointer transition-colors hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                selected && "border-primary ring-2 ring-primary",
              )}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle>{raum.name}</CardTitle>
                  {zeitraumGueltig &&
                    (verfuegbar ? (
                      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                        <Check className="h-3 w-3" /> Verfügbar
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-muted-foreground">
                        <X className="h-3 w-3" /> Belegt
                      </Badge>
                    ))}
                </div>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" /> {raum.kapazitaet} Personen ·{" "}
                  {raum.etage}, Raum {raum.raumnummer}
                </p>
              </CardHeader>
              <CardContent className="flex-1">
                <AusstattungListe items={raum.ausstattung} />
              </CardContent>
              <CardFooter className="gap-2">
                <Link
                  to={`/raeume/${raum.id}${query}`}
                  onClick={(e) => e.stopPropagation()}
                  className={cn(buttonVariants({ variant: "outline" }), "flex-1")}
                >
                  Details
                </Link>
                {verfuegbar ? (
                  <Link
                    to={`/buchen/${raum.id}${query}`}
                    onClick={(e) => e.stopPropagation()}
                    className={cn(buttonVariants(), "flex-1")}
                  >
                    Buchen
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className={cn(buttonVariants(), "flex-1")}
                  >
                    Buchen
                  </button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>
      )}
    </div>
  )
}
