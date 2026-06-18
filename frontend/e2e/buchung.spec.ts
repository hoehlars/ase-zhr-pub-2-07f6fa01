import { test, expect } from "@playwright/test"

// Buchungs-Flow gegen den echten Booking Service (CLVN-019/020/023):
// Raum wählen → bestätigen → Bestätigung sehen → in "Meine Buchungen" wiederfinden.
//
// Datum/Zeit kommen aus den URL-Query-Parametern (useBuchungsAuswahl). Bewusst
// ein anderes Datum als die Lese-Specs (2026-06-17), damit die hier angelegte
// Buchung deren Verfügbarkeits-Annahmen nicht verändert (gemeinsame Backend-DB).
test("eine Buchung anlegen und in Meine Buchungen wiederfinden", async ({ page }) => {
  const titel = "E2E Termin Severin"

  await page.goto("/?datum=2026-06-19&von=09:00&bis=10:00")
  const karte = page.getByTestId("raum-card-koeln-severin")
  await expect(karte).toBeVisible()

  await karte.getByRole("link", { name: "Buchen" }).click()

  await expect(page.getByRole("heading", { name: "Buchung bestätigen" })).toBeVisible()
  await page.getByLabel("Meetingtitel").fill(titel)
  await page.getByRole("button", { name: "Buchung absenden" }).click()

  // Buchungsbestätigung (kommt aus der Backend-Antwort).
  await expect(page.getByRole("heading", { name: "Buchung bestätigt!" })).toBeVisible()
  await expect(page.getByText(titel)).toBeVisible()

  // Persistiert: taucht in der Übersicht auf (vom Backend geladen).
  await page.getByRole("link", { name: "Meine Buchungen" }).click()
  await expect(page.getByText(titel)).toBeVisible()
})
