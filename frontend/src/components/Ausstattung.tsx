import { Monitor, SquarePen, Video, Phone, Presentation } from "lucide-react"
import type { AusstattungsTyp } from "@/lib/mock-data"

const ICONS: Record<AusstattungsTyp, typeof Monitor> = {
  Bildschirm: Monitor,
  Whiteboard: SquarePen,
  Videokonferenz: Video,
  Telefonkonferenz: Phone,
  Flipchart: Presentation,
}

/** Liste der Ausstattung als Icons mit optionalem Text-Label. */
export function AusstattungListe({
  items,
  mitLabel = false,
}: {
  items: AusstattungsTyp[]
  mitLabel?: boolean
}) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2">
      {items.map((typ) => {
        const Icon = ICONS[typ]
        return (
          <li
            key={typ}
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
            title={typ}
          >
            <Icon className="h-4 w-4" />
            {mitLabel && <span>{typ}</span>}
          </li>
        )
      })}
    </ul>
  )
}
