import { test, expect } from "@playwright/test"

// Vollständiger Raumbuchungsprozess (CLVN-019/020/023):
// Buchungsübersicht → Vorher-Stand merken → Standort & Datum über die UI
// wählen → Raum auswählen → Buchung abschließen → Übersicht → neue Buchung
// verifizieren.
//
// Verwendet Hamburg (nicht Köln) und 2026-06-25, damit kein Konflikt mit den
// anderen Specs entsteht, die koeln-severin am 2026-06-19 belegen.
test("vollständiger Raumbuchungsprozess", async ({ page }) => {
  const titel = "E2E Raumbuchungsprozess Hamburg Elbe"

  // 1. Buchungsübersicht öffnen
  await page.goto("/meine-buchungen")
  await expect(page.getByRole("heading", { name: "Meine Buchungen" })).toBeVisible()
  await expect(page.getByText("Lädt…")).not.toBeVisible()

  // 2. Bisherige Buchungen merken: eindeutige /buchung/-Hrefs zählen
  //    (jede BuchungZeile erzeugt zwei Links auf dieselbe Buchungs-ID)
  const anzahlVorher = await page
    .locator('a[href^="/buchung/"]')
    .evaluateAll((links) => new Set(links.map((l) => l.getAttribute("href"))).size)

  // 3. Standort-Seite öffnen (Raum buchen)
  await page.goto("/")
  await expect(page.getByRole("heading", { name: "Raum buchen" })).toBeVisible()

  // 4. Standort wählen: Hamburg
  await page.getByRole("combobox", { name: "Standort wählen" }).click()
  await page.getByRole("option", { name: "Hamburg" }).click()
  // Warten, bis die Hamburg-Raumkarten gerendert sind
  await expect(page.getByTestId("raum-card-hamburg-elbe")).toBeVisible()

  // 5. Datum auswählen: 25.06.2026 über den Datepicker
  await page.getByRole("button").filter({ hasText: "17.06.2026" }).click()
  await page.getByRole("button", { name: "25" }).click()
  await page.keyboard.press("Escape") // Kalender-Popover schließen

  // 6. Raum auswählen: Hamburg Elbe (warten bis Belegungen geladen)
  const karte = page.getByTestId("raum-card-hamburg-elbe")
  await expect(karte.getByRole("link", { name: "Buchen" })).toBeVisible()
  await karte.click()
  await expect(karte).toHaveAttribute("aria-pressed", "true")

  // 7. Buchungsprozess abschließen
  await karte.getByRole("link", { name: "Buchen" }).click()
  await expect(page.getByRole("heading", { name: "Buchung bestätigen" })).toBeVisible()
  await page.getByLabel("Meetingtitel").fill(titel)
  await page.getByRole("button", { name: "Buchung absenden" }).click()
  await expect(page.getByRole("heading", { name: "Buchung bestätigt!" })).toBeVisible()
  await expect(page.getByText(titel)).toBeVisible()

  // 8. Buchungsübersicht öffnen
  await page.getByRole("link", { name: "Meine Buchungen" }).click()
  await expect(page.getByRole("heading", { name: "Meine Buchungen" })).toBeVisible()
  await expect(page.getByText("Lädt…")).not.toBeVisible()

  // 9. Verifizieren, dass neue Buchung existiert
  await expect(page.getByText(titel)).toBeVisible()
  const anzahlNachher = await page
    .locator('a[href^="/buchung/"]')
    .evaluateAll((links) => new Set(links.map((l) => l.getAttribute("href"))).size)
  expect(anzahlNachher).toBe(anzahlVorher + 1)
})
