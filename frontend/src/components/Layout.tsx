import { NavLink, Outlet } from "react-router-dom"
import { CalendarCheck, MapPin } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { standorte, getStandort } from "@/lib/mock-data"
import { useStandort } from "@/lib/standort-context"

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          "rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
        )
      }
    >
      {children}
    </NavLink>
  )
}

export default function Layout() {
  const { standortId, setStandortId } = useStandort()

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
          {/* Logo */}
          <NavLink to="/" className="mr-4 flex items-center gap-2 font-semibold">
            <CalendarCheck className="h-5 w-5 text-primary" />
            <span>Calvin</span>
          </NavLink>

          {/* Hauptnavigation */}
          <nav className="flex items-center gap-1">
            <NavItem to="/">Raum buchen</NavItem>
            <NavItem to="/meine-buchungen">Meine Buchungen</NavItem>
          </nav>

          {/* Standort-Switcher (immer sichtbar) */}
          <div className="ml-auto">
            <Select
              value={standortId}
              onValueChange={(v) => v && setStandortId(v)}
            >
              <SelectTrigger className="w-[180px]" aria-label="Standort wählen">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <SelectValue>
                  {(value: string) => getStandort(value)?.name ?? value}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {standorte.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
