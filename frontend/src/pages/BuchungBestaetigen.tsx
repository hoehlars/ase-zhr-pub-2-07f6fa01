import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Check } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useBuchungsAuswahl } from "@/lib/useBuchungsAuswahl"
import { useBuchungen } from "@/lib/buchungen-context"
import {
  getRaum,
  getStandort,
  formatDatum,
  formatDauer,
  istVerfuegbar,
  toMinutes,
} from "@/lib/mock-data"

function Zeile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  )
}

export default function BuchungBestaetigen() {
  const { raumId } = useParams()
  const { datum, von, bis, query } = useBuchungsAuswahl()
  const { addBuchung } = useBuchungen()
  const navigate = useNavigate()

  const [titel, setTitel] = useState("")
  const [notiz, setNotiz] = useState("")

  const raum = raumId ? getRaum(raumId) : undefined

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
  const titelGefuellt = titel.trim().length > 0
  const kannAbsenden = verfuegbar && titelGefuellt

  function handleAbsenden() {
    if (!kannAbsenden || !raum) return
    const neu = addBuchung({
      raumId: raum.id,
      datum,
      von,
      bis,
      titel: titel.trim(),
      notiz: notiz.trim() || undefined,
    })
    navigate(`/buchung/${neu.id}`)
  }

  return (
    <div className="space-y-6">
      <Link
        to={`/raeume/${raum.id}${query}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Zurück
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight">Buchung bestätigen</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Zusammenfassung */}
        <Card>
          <CardHeader>
            <CardTitle>Zusammenfassung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Zeile label="Raum">{raum.name}</Zeile>
            <Zeile label="Standort">
              {standort?.name}, {raum.etage} R{raum.raumnummer}
            </Zeile>
            <Zeile label="Datum">{formatDatum(datum)}</Zeile>
            <Zeile label="Zeit">
              {von}–{bis} ({formatDauer(von, bis)})
            </Zeile>
            <Zeile label="Kapazität">{raum.kapazitaet} Personen</Zeile>
            <Separator />
            <div className="flex justify-end">
              {verfuegbar ? (
                <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                  <Check className="h-3 w-3" /> Verfügbar
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-muted-foreground">
                  Nicht verfügbar
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Buchungsdetails */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="titel">
                Meetingtitel <span className="text-destructive">*</span>
              </Label>
              <Input
                id="titel"
                value={titel}
                onChange={(e) => setTitel(e.target.value)}
                placeholder="z.B. Team Sync"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notiz">Notiz (optional)</Label>
              <Textarea
                id="notiz"
                value={notiz}
                onChange={(e) => setNotiz(e.target.value)}
                placeholder="z.B. Agenda, benötigtes Material …"
                rows={4}
              />
            </div>

            {!verfuegbar && (
              <p className="text-sm text-destructive">
                Dieser Raum ist im gewählten Zeitraum nicht verfügbar. Bitte wähle
                ein anderes Zeitfenster.
              </p>
            )}

            <Button
              className="w-full"
              disabled={!kannAbsenden}
              onClick={handleAbsenden}
            >
              Buchung absenden
            </Button>
            {!titelGefuellt && verfuegbar && (
              <p className="text-center text-xs text-muted-foreground">
                Bitte gib einen Meetingtitel ein, um fortzufahren.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
