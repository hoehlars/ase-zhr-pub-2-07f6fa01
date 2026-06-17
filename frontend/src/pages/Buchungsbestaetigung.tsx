import { Link, useParams } from "react-router-dom"
import { CheckCircle2, MapPin, Calendar, Clock, FileText } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useBuchungen } from "@/lib/buchungen-context"
import { getRaum, getStandort, formatDatum, formatDauer } from "@/lib/mock-data"

export default function Buchungsbestaetigung() {
  const { buchungId } = useParams()
  const { getBuchung } = useBuchungen()

  const buchung = buchungId ? getBuchung(buchungId) : undefined

  if (!buchung) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground">Buchung nicht gefunden.</p>
        <Link to="/meine-buchungen" className={cn(buttonVariants({ variant: "outline" }))}>
          Zu meinen Buchungen
        </Link>
      </div>
    )
  }

  const raum = getRaum(buchung.raumId)
  const standort = raum ? getStandort(raum.standortId) : undefined

  return (
    <div className="mx-auto max-w-lg space-y-6 py-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <CheckCircle2 className="h-14 w-14 text-emerald-600" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Buchung bestätigt!</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Dein Konferenzraum ist verbindlich reserviert.
          </p>
        </div>
      </div>

      <Card className="text-left">
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-lg font-semibold">{buchung.titel}</h2>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {raum?.name} · {standort?.name}, {raum?.etage} R{raum?.raumnummer}
            </p>
            <p className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {formatDatum(buchung.datum)}
            </p>
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {buchung.von}–{buchung.bis} ({formatDauer(buchung.von, buchung.bis)})
            </p>
            {buchung.notiz && (
              <p className="flex items-start gap-2">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span>{buchung.notiz}</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-3">
        <Link to="/meine-buchungen" className={cn(buttonVariants())}>
          Zu meinen Buchungen
        </Link>
        <Link to="/" className={cn(buttonVariants({ variant: "outline" }))}>
          Weitere Buchung
        </Link>
      </div>
    </div>
  )
}
