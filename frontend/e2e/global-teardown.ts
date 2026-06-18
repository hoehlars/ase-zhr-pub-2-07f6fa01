import { readdirSync, rmSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

// Entfernt die pro Lauf angelegten E2E-SQLite-Dateien (siehe playwright.config.ts).
export default function globalTeardown() {
  const hier = dirname(fileURLToPath(import.meta.url))
  const backend = join(hier, "..", "..", "backend")
  for (const datei of readdirSync(backend)) {
    if (/^calvin-e2e-\d+\.db$/.test(datei)) {
      rmSync(join(backend, datei), { force: true })
    }
  }
}
