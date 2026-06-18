"""E2E-Tests für CLVN-026 – Buchung stornieren.

Akzeptanzkriterien (Backend-Anteil):
- Buchung kann storniert werden (aus Übersicht/Detail – derselbe Endpoint)
- nach Stornierung Bestätigung (Status ``storniert``)
- stornierter Raum ist unmittelbar wieder verfügbar
- stornierte Buchung erscheint nicht mehr in der aktiven Liste
- vergangene Buchungen können nicht storniert werden
"""

from __future__ import annotations

from conftest import auth, neue_buchung

RAUM = "clvn026-raum"


def test_stornierung_bestaetigt_und_entfernt_aus_liste(client):
    buchung_id = client.post(
        "/api/buchungen", json=neue_buchung(raumId=RAUM), auth=auth("a")
    ).json()["id"]

    r = client.delete(f"/api/buchungen/{buchung_id}", auth=auth("a"))
    assert r.status_code == 200
    assert r.json()["status"] == "storniert"

    # Nicht mehr in der aktiven Übersicht.
    ids = [b["id"] for b in client.get("/api/buchungen", auth=auth("a")).json()]
    assert buchung_id not in ids


def test_raum_nach_stornierung_wieder_verfuegbar(client):
    buchung_id = client.post(
        "/api/buchungen", json=neue_buchung(raumId=RAUM), auth=auth("a")
    ).json()["id"]

    # Vorher belegt …
    vorher = client.get(
        "/api/verfuegbarkeit",
        params={"raumId": RAUM, "datum": "2030-06-17", "von": "09:00", "bis": "10:00"},
    ).json()
    assert vorher["verfuegbar"] is False

    client.delete(f"/api/buchungen/{buchung_id}", auth=auth("a"))

    # … nachher wieder frei.
    nachher = client.get(
        "/api/verfuegbarkeit",
        params={"raumId": RAUM, "datum": "2030-06-17", "von": "09:00", "bis": "10:00"},
    ).json()
    assert nachher["verfuegbar"] is True


def test_vergangene_buchung_nicht_stornierbar(client):
    buchung_id = client.post(
        "/api/buchungen",
        json=neue_buchung(raumId=RAUM, datum="2020-01-06"),
        auth=auth("a"),
    ).json()["id"]

    r = client.delete(f"/api/buchungen/{buchung_id}", auth=auth("a"))
    assert r.status_code == 409


def test_storniere_unbekannte_buchung_404(client):
    assert client.delete("/api/buchungen/gibtsnicht", auth=auth("a")).status_code == 404
