import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"

// Hinter dem Crucible-Proxy laufen die Assets unter einem Unterpfad
// (.../proxy/PORT/). Den Pfad aus VSCODE_PROXY_URI ableiten, lokal bleibt "/".
const PORT = 5173
const BACKEND = "http://localhost:3001"
const proxyUri = process.env.VSCODE_PROXY_URI
const base = proxyUri
  ? new URL(proxyUri.replace("{{port}}", String(PORT))).pathname
  : "/"
// Prefix ohne abschließenden Slash, z.B. "/t/<token>/s/<session>/proxy/5173".
const prefix = base.replace(/\/$/, "")

// Der Proxy (Crucible + code-server-Port-Proxy) STRIPPT den kompletten Prefix,
// bevor die Anfrage Vite erreicht — Vite sieht nur noch "/...". `base` allein
// erzeugt dann ein 302 auf den Prefix, das code-server zu ".../proxy/5173/t/.../proxy/5173/"
// verbiegt → 404. Lösung wie Next.js' assetPrefix: `base` emittiert weiterhin die
// korrekten absoluten Asset-URLs (überlebt Deep-Link-Reloads), und diese Middleware
// hängt den gestrippten Prefix bei *eingehenden* Requests wieder an, damit Vites
// Base-Matching greift. Lokal (base "/") ist sie ein No-op.
function proxyBaseRewrite(): Plugin {
  return {
    name: "proxy-base-rewrite",
    configureServer(server) {
      if (!prefix) return
      server.middlewares.use((req, _res, next) => {
        if (req.url && req.url !== prefix && !req.url.startsWith(prefix + "/")) {
          req.url = prefix + req.url
        }
        next()
      })
    },
  }
}

// API-Aufrufe an den Booking Service (:3001) durchreichen. Der Client stellt den
// `base`-Prefix voran (import.meta.env.BASE_URL), damit die URLs hinter dem Proxy
// und bei Deep-Links korrekt auflösen. Daher beide Formen weiterleiten:
//   - "/api/..."          (lokal bzw. nachdem Crucible den Prefix gestrippt hat)
//   - "<prefix>/api/..."  (Direktzugriff auf :5173, z.B. durch Playwright/MCP)
const apiProxy: Record<string, { target: string; rewrite?: (p: string) => string }> = {
  "/api": { target: BACKEND },
}
if (prefix) {
  apiProxy[`${prefix}/api`] = {
    target: BACKEND,
    rewrite: (p) => p.slice(prefix.length),
  }
}

export default defineConfig({
  base,
  plugins: [proxyBaseRewrite(), react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: PORT,
    // Kein stillen Port-Increment: wenn 5173 belegt ist, soll Vite mit einer
    // klaren Fehlermeldung abbrechen statt auf 5174 auszuweichen (base wäre sonst falsch).
    strictPort: true,
    // Zugriff über den Proxy erfolgt mit fremdem Host (*.svc.cluster.local).
    allowedHosts: true,
    proxy: apiProxy,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
