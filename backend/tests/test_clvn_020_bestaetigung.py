"""E2E-Tests für CLVN-020 – Buchungsbestätigung erhalten.

Akzeptanzkriterien (Backend-Anteil):
- nach erfolgreicher Buchung Bestätigung mit allen Details
- enthält Raum (ID), Datum + Zeitraum, Standort (ID), Meetingtitel, Notiz
- von der Bestätigung zur Buchungsübersicht navigierbar (gleiche ID auffindbar)
"""

from __future__ import annotations

from conftest import auth, neue_buchung


def test_bestaetigung_enthaelt_alle_details(client):
    payload = neue_buchung(
        raumId="koeln-rhein",
        standortId="koeln",
        datum="2030-09-01",
        von="14:00",
        bis="15:30",
        titel="Kundentermin",
        notiz="Bitte Beamer vorbereiten",
    )
    r = client.post("/api/buchungen", json=payload, auth=auth("a"))
    assert r.status_code == 201
    body = r.json()
    assert body["raumId"] == "koeln-rhein"
    assert body["standortId"] == "koeln"
    assert body["datum"] == "2030-09-01"
    assert body["von"] == "14:00"
    assert body["bis"] == "15:30"
    assert body["titel"] == "Kundentermin"
    assert body["notiz"] == "Bitte Beamer vorbereiten"


def test_von_bestaetigung_zur_uebersicht(client):
    r = client.post("/api/buchungen", json=neue_buchung(), auth=auth("a"))
    buchung_id = r.json()["id"]
    detail = client.get(f"/api/buchungen/{buchung_id}", auth=auth("a"))
    assert detail.status_code == 200
    assert detail.json()["id"] == buchung_id
