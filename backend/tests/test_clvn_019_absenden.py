"""E2E-Tests für CLVN-019 – Raumbuchung absenden.

Akzeptanzkriterien (Backend-Anteil):
- Buchung wird nach dem Absenden gespeichert
- Raum wird für den Zeitraum als belegt markiert
- Doppelbuchung wird verhindert
- bei erfolgreicher Buchung → Weiterleitung zur Bestätigung (201 + Bestätigungsdaten)
- bei Fehler (Raum zwischenzeitlich gebucht) → verständliche Fehlermeldung
"""

from __future__ import annotations

from conftest import auth, neue_buchung

RAUM = "clvn019-raum"


def test_buchung_wird_gespeichert(client):
    r = client.post("/api/buchungen", json=neue_buchung(raumId=RAUM), auth=auth("a"))
    assert r.status_code == 201
    buchung_id = r.json()["id"]
    # In der Übersicht des Nutzers auffindbar.
    ids = [b["id"] for b in client.get("/api/buchungen", auth=auth("a")).json()]
    assert buchung_id in ids


def test_raum_wird_als_belegt_markiert(client):
    client.post("/api/buchungen", json=neue_buchung(raumId=RAUM), auth=auth("a"))
    belegt = client.get(
        "/api/raeume/" + RAUM + "/belegungen", params={"datum": "2030-06-17"}
    ).json()
    assert {"von": "09:00", "bis": "10:00"} in belegt


def test_doppelbuchung_wird_verhindert(client):
    client.post("/api/buchungen", json=neue_buchung(raumId=RAUM), auth=auth("a"))
    # Anderer Nutzer, überschneidender Zeitraum.
    konflikt = client.post(
        "/api/buchungen",
        json=neue_buchung(raumId=RAUM, von="09:30", bis="10:30"),
        auth=auth("b"),
    )
    assert konflikt.status_code == 409
    assert konflikt.json()["detail"]  # verständliche Fehlermeldung vorhanden


def test_endzeit_muss_nach_startzeit_liegen(client):
    r = client.post(
        "/api/buchungen",
        json=neue_buchung(raumId=RAUM, von="11:00", bis="10:00"),
        auth=auth("a"),
    )
    assert r.status_code == 422


def test_buchung_erfordert_authentifizierung(client):
    r = client.post("/api/buchungen", json=neue_buchung(raumId=RAUM))
    assert r.status_code == 401
