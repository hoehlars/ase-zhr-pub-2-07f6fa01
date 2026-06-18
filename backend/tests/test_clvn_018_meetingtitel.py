"""E2E-Tests für CLVN-018 – Meetingtitel eingeben.

Akzeptanzkriterien (Backend-Anteil):
- Meetingtitel ist Pflichtfeld
- maximale Länge 100 Zeichen
- Validierung bei leerem Feld
- Titel wird in der Übersicht angezeigt
- Titel wird nach dem Absenden gespeichert
"""

from __future__ import annotations

from conftest import auth, neue_buchung


def test_titel_ist_pflichtfeld(client):
    payload = neue_buchung()
    del payload["titel"]
    r = client.post("/api/buchungen", json=payload, auth=auth("a"))
    assert r.status_code == 422


def test_leerer_titel_wird_abgelehnt(client):
    r = client.post("/api/buchungen", json=neue_buchung(titel="   "), auth=auth("a"))
    assert r.status_code == 422


def test_titel_max_100_zeichen(client):
    zu_lang = "x" * 101
    r = client.post("/api/buchungen", json=neue_buchung(titel=zu_lang), auth=auth("a"))
    assert r.status_code == 422

    gerade_noch = "x" * 100
    ok = client.post(
        "/api/buchungen", json=neue_buchung(titel=gerade_noch), auth=auth("a")
    )
    assert ok.status_code == 201


def test_titel_wird_gespeichert_und_in_uebersicht_angezeigt(client):
    client.post(
        "/api/buchungen", json=neue_buchung(titel="Quartalsplanung"), auth=auth("a")
    )
    uebersicht = client.get("/api/buchungen", auth=auth("a")).json()
    assert uebersicht[0]["titel"] == "Quartalsplanung"
