import { defineConfig, devices } from "@playwright/test"

// E2E-Tests gegen den Vite-Dev-Server. Playwright startet den Server selbst
// (oder nutzt einen bereits laufenden) und steuert Chromium gegen localhost:5173.
const PORT = 5173
const baseURL = `http://localhost:${PORT}`

// Pro Testlauf eine frische SQLite-Datei, damit der Schreibpfad (Buchung anlegen)
// deterministisch ist und wiederholte Läufe nicht an einer Doppelbuchung (409)
// scheitern. Aufräumen übernimmt der globalTeardown.
const E2E_DB = `./calvin-e2e-${Date.now()}.db`

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // In CI zusätzlich JUnit-XML schreiben (für dorny/test-reporter); lokal nur "list".
  reporter: process.env.CI
    ? [["list"], ["junit", { outputFile: "test-results/junit.xml" }]]
    : "list",
  globalTeardown: "./e2e/global-teardown.ts",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Beide Server starten: Booking Service (3001) und Vite-Dev-Server (5173).
  // Das Frontend ruft das Backend über den Vite-Proxy (/api → :3001) auf, daher
  // muss es für die E2E-Tests laufen. Eigene SQLite-Datei für deterministische,
  // isolierte Testdaten (Seed entspricht den Annahmen der Specs).
  webServer: [
    {
      command:
        ".venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 3001",
      cwd: "../backend",
      url: "http://localhost:3001/api/hello",
      env: { DATABASE_URL: `sqlite:///${E2E_DB}` },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "npm run dev",
      url: baseURL,
      // Für die Tests ohne Crucible-Proxy-Präfix laufen lassen (base "/"), damit
      // die App unter http://localhost:5173/ erreichbar ist – sonst liefe sie nur
      // unter dem Proxy-Unterpfad und der Router-basename würde "/" verfehlen.
      env: { VSCODE_PROXY_URI: "" },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
})
