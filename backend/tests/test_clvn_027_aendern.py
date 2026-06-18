"""E2E-Tests für CLVN-027 – Buchung ändern.

Akzeptanzkriterien (Backend-Anteil):
- Datum änderbar
- Uhrzeit (Start-/Endzeit) änderbar
- Raum wechselbar (Standort bleibt)
- bei Änderung wird Verfügbarkeit neu geprüft
- bei Konflikt entsprechende Meldung (409)
- nach erfolgreicher Änderung Bestätigung; Übersicht aktualisiert
"""

from __future__ import annotations

from conftest import auth, neue_buchung


def _erstelle(client, **overrides):
    return client.post(
        "/api/buchungen", json=neue_buchung(**overrides), auth=auth("a")
    ).json()["id"]


def test_datum_aendern(client):
    bid = _erstelle(client, raumId="r1", datum="2030-06-17")
    r = client.patch(
        f"/api/buchungen/{bid}", json={"datum": "2030-06-20"}, auth=auth("a")
    )
    assert r.status_code == 200
    assert r.json()["datum"] == "2030-06-20"


def test_uhrzeit_aendern(client):
    bid = _erstelle(client, raumId="r1", von="09:00", bis="10:00")
    r = client.patch(
        f"/api/buchungen/{bid}", json={"von": "11:00", "bis": "12:30"}, auth=auth("a")
    )
    assert r.status_code == 200
    body = r.json()
    assert (body["von"], body["bis"]) == ("11:00", "12:30")


def test_raum_wechseln_standort_bleibt(client):
    bid = _erstelle(client, raumId="koeln-rhein", standortId="koeln")
    r = client.patch(
        f"/api/buchungen/{bid}", json={"raumId": "koeln-dom"}, auth=auth("a")
    )
    assert r.status_code == 200
    body = r.json()
    assert body["raumId"] == "koeln-dom"
    assert body["standortId"] == "koeln"


def test_aenderung_prueft_verfuegbarkeit_und_meldet_konflikt(client):
    # Raum r2 ist 14:00–15:00 von einem anderen Nutzer belegt.
    client.post(
        "/api/buchungen",
        json=neue_buchung(raumId="r2", von="14:00", bis="15:00"),
        auth=auth("kollege"),
    )
    bid = _erstelle(client, raumId="r1", von="09:00", bis="10:00")
    # Verschiebung auf r2 14:00–15:00 → Konflikt.
    r = client.patch(
        f"/api/buchungen/{bid}",
        json={"raumId": "r2", "von": "14:00", "bis": "15:00"},
        auth=auth("a"),
    )
    assert r.status_code == 409


def test_erfolgreiche_aenderung_in_uebersicht_sichtbar(client):
    bid = _erstelle(client, raumId="r1", datum="2030-06-17")
    client.patch(f"/api/buchungen/{bid}", json={"datum": "2030-07-01"}, auth=auth("a"))
    eintrag = next(
        b for b in client.get("/api/buchungen", auth=auth("a")).json() if b["id"] == bid
    )
    assert eintrag["datum"] == "2030-07-01"


def test_unveraenderte_buchung_blockiert_sich_nicht_selbst(client):
    # Reine Titeländerung darf nicht am eigenen Zeitslot scheitern.
    bid = _erstelle(client, raumId="r1")
    r = client.patch(
        f"/api/buchungen/{bid}", json={"titel": "Neuer Titel"}, auth=auth("a")
    )
    assert r.status_code == 200
    assert r.json()["titel"] == "Neuer Titel"
