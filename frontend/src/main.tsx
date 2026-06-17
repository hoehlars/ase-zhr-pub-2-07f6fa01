import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import "./index.css"
import App from "./App"
import { StandortProvider } from "@/lib/standort-context"
import { BuchungenProvider } from "@/lib/buchungen-context"
import { Toaster } from "@/components/ui/sonner"

// Hinter dem Crucible-Proxy läuft die App unter einem Unterpfad (= base).
// basename sorgt dafür, dass die Routen trotzdem matchen.
const basename = import.meta.env.BASE_URL.replace(/\/$/, "")

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <StandortProvider>
        <BuchungenProvider>
          <App />
          <Toaster />
        </BuchungenProvider>
      </StandortProvider>
    </BrowserRouter>
  </StrictMode>,
)
