import { test, expect } from "@playwright/test"

// CLVN-016-SUBTASK-1: Verfügbaren Raum auswählen und hervorheben.
//
// Ausgangslage (Default der Startseite): Standort Köln, Datum 2026-06-17,
// Zeitfenster 09:00–10:00. Aus den Mock-Daten ergibt sich deterministisch:
//   - verfügbar: Severin (koeln-severin), Hohenzollern (koeln-hohenzollern)
//   - belegt:    Rhein (koeln-rhein), Dom (koeln-dom)
const VERFUEGBAR = "raum-card-koeln-severin"
const VERFUEGBAR_2 = "raum-card-koeln-hohenzollern"
const BELEGT = "raum-card-koeln-rhein"

test.beforeEach(async ({ page }) => {
  await page.goto("/")
  // Warten, bis die Raumkarten gerendert sind.
  await expect(page.getByTestId(VERFUEGBAR)).toBeVisible()
})

test("ein verfügbarer Raum kann per Klick ausgewählt und hervorgehoben werden", async ({
  page,
}) => {
  const karte = page.getByTestId(VERFUEGBAR)
  await expect(karte).toHaveAttribute("aria-pressed", "false")

  await karte.click()

  await expect(karte).toHaveAttribute("aria-pressed", "true")
})

test("ein nicht verfügbarer Raum kann nicht ausgewählt werden", async ({ page }) => {
  await page.getByTestId(BELEGT).click()

  // Kein Raum darf nach dem Klick auf einen belegten Raum ausgewählt sein.
  await expect(page.locator('[aria-pressed="true"]')).toHaveCount(0)
})

test("zu jedem Zeitpunkt ist höchstens ein Raum ausgewählt", async ({ page }) => {
  await page.getByTestId(VERFUEGBAR).click()
  await page.getByTestId(VERFUEGBAR_2).click()

  // Genau ein Raum ausgewählt – und zwar der zuletzt geklickte.
  await expect(page.locator('[aria-pressed="true"]')).toHaveCount(1)
  await expect(page.getByTestId(VERFUEGBAR_2)).toHaveAttribute("aria-pressed", "true")
  await expect(page.getByTestId(VERFUEGBAR)).toHaveAttribute("aria-pressed", "false")
})
