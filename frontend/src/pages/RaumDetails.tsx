import { Link, useParams } from "react-router-dom"
import { ArrowLeft, MapPin, Users, ImageIcon, Check, X } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AusstattungListe } from "@/components/Ausstattung"
import { Belegungsleiste } from "@/components/Belegungsleiste"
import { cn } from "@/lib/utils"
import { useBuchungsAuswahl } from "@/lib/useBuchungsAuswahl"
import {
  getRaum,
  getStandort,
  getZeitOptionen,
  formatDatum,
  formatDauer,
  istVerfuegbar,
  toMinutes,
} from "@/lib/mock-data"

export default function RaumDetails() {
  const { raumId } = useParams()
  const { datum, von, bis, setAuswahl, query } = useBuchungsAuswahl()

  const raum = raumId ? getRaum(raumId) : undefined
  const zeiten = getZeitOptionen()

  if (!raum) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Raum nicht gefunden.</p>
        <Link to={`/${query}`} className={cn(buttonVariants({ variant: "outline" }))}>
          Zurück zur Übersicht
        </Link>
      </div>
    )
  }

  const standort = getStandort(raum.standortId)
  const zeitraumGueltig = toMinutes(bis) > toMinutes(von)
  const verfuegbar = zeitraumGueltig && istVerfuegbar(raum.id, datum, von, bis)

  return (
    <div className="space-y-6">
      <Link
        to={`/${query}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Zurück zur Übersicht
      </Link>

      {/* Kopf */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{raum.name}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" /> {standort?.name} · {raum.etage}, Raum{" "}
            {raum.raumnummer}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Foto-Platzhalter */}
        <div className="flex aspect-video items-center justify-center rounded-lg border bg-muted text-muted-foreground">
          <ImageIcon className="h-10 w-10" />
        </div>

        {/* Eckdaten */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{raum.beschreibung}</p>
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{raum.kapazitaet} Personen</span>
            <span className="text-muted-foreground">Kapazität</span>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Ausstattung</p>
            <AusstattungListe items={raum.ausstattung} mitLabel />
          </div>
        </div>
      </div>

      {/* Verfügbarkeit */}
      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">
                Verfügbarkeit am {formatDatum(datum)}
              </h2>
              <p className="text-sm text-muted-foreground">
                Wähle ein freies Zeitfenster für deine Buchung.
              </p>
            </div>
            <div className="flex items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Von</Label>
                <Select value={von} onValueChange={(v) => v && setAuswahl({ von: v })}>
                  <SelectTrigger className="w-[100px]">
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
                  <SelectTrigger className="w-[100px]">
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
            </div>
          </div>

          <Belegungsleiste
            raumId={raum.id}
            datum={datum}
            von={von}
            bis={bis}
            onSelectVon={(neuVon, neuBis) =>
              setAuswahl({ von: neuVon, bis: neuBis })
            }
          />

          {/* Ergebnis */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
            <div className="flex items-center gap-3 text-sm">
              {zeitraumGueltig ? (
                <>
                  <span>
                    Gewählt:{" "}
                    <span className="font-medium">
                      {von}–{bis}
                    </span>{" "}
                    ({formatDauer(von, bis)})
                  </span>
                  {verfuegbar ? (
                    <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                      <Check className="h-3 w-3" /> Verfügbar
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-muted-foreground">
                      <X className="h-3 w-3" /> Nicht verfügbar
                    </Badge>
                  )}
                </>
              ) : (
                <span className="text-destructive">
                  Endzeit muss nach Startzeit liegen
                </span>
              )}
            </div>
            {verfuegbar ? (
              <Link
                to={`/buchen/${raum.id}${query}`}
                className={cn(buttonVariants())}
              >
                Diesen Raum buchen
              </Link>
            ) : (
              <button type="button" disabled className={cn(buttonVariants())}>
                Diesen Raum buchen
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
