"""E2E-Tests für CLVN-025 – Buchung exportieren/teilen.

Akzeptanzkriterien (Backend-Anteil):
- Buchung als Kalendereintrag (.ics) exportierbar
- Export enthält Datum, Uhrzeit, Raum, Standort
- Export aus der Detailansicht/Übersicht erreichbar (per Buchungs-ID)

Hinweis: E-Mail-Versand und Link-Kopieren sind reine Frontend-Aktionen; das
Backend liefert die teilbaren Daten (.ics, Buchungs-ID).
"""

from __future__ import annotations

from conftest import auth, neue_buchung


def test_ics_export_enthaelt_buchungsdetails(client):
    payload = neue_buchung(
        raumId="koeln-dom",
        standortId="koeln",
        datum="2030-08-20",
        von="09:00",
        bis="10:30",
        titel="Architektur-Review",
    )
    buchung_id = client.post("/api/buchungen", json=payload, auth=auth("a")).json()[
        "id"
    ]

    r = client.get(f"/api/buchungen/{buchung_id}/export.ics", auth=auth("a"))
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("text/calendar")
    assert "attachment" in r.headers["content-disposition"]

    ics = r.text
    assert "BEGIN:VCALENDAR" in ics
    assert "SUMMARY:Architektur-Review" in ics
    assert "DTSTART:20300820T090000" in ics
    assert "DTEND:20300820T103000" in ics
    assert "koeln-dom" in ics  # Raum (ID)
    assert "koeln" in ics  # Standort (ID)


def test_export_unbekannte_buchung_404(client):
    r = client.get("/api/buchungen/gibtsnicht/export.ics", auth=auth("a"))
    assert r.status_code == 404
