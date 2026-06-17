import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// Hinter dem Crucible-Proxy laufen die Assets unter einem Unterpfad
// (.../proxy/5173/). Den Pfad aus VSCODE_PROXY_URI ableiten, lokal bleibt "/".
const proxyUri = process.env.VSCODE_PROXY_URI
const base = proxyUri
  ? new URL(proxyUri.replace("{{port}}", "5173")).pathname
  : "/"

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    // Zugriff über den Proxy erfolgt mit fremdem Host (*.svc.cluster.local).
    allowedHosts: true,
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
