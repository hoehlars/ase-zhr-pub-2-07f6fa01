"""E2E-Tests für CLVN-010 – Verfügbarkeit prüfen.

Akzeptanzkriterien:
- Verfügbarkeit eines Raums für einen Zeitraum prüfbar
- freier Raum eindeutig "verfügbar"
- belegter Raum eindeutig "nicht verfügbar"
- Prüfung berücksichtigt bestehende Buchungen
- Ergebnis sofort verfügbar (synchrone Antwort)
- bei Verfügbarkeit kann direkt gebucht werden
"""

from __future__ import annotations

from conftest import auth, neue_buchung

RAUM = "clvn010-raum"


def _pruefe(client, **params):
    basis = {"raumId": RAUM, "datum": "2030-06-17", "von": "09:00", "bis": "10:00"}
    basis.update(params)
    return client.get("/api/verfuegbarkeit", params=basis)


def test_freier_raum_ist_verfuegbar(client):
    r = _pruefe(client)
    assert r.status_code == 200
    body = r.json()
    assert body["verfuegbar"] is True
    assert body["konflikte"] == []


def test_belegter_raum_ist_nicht_verfuegbar(client):
    # Bestehende Buchung anlegen …
    client.post("/api/buchungen", json=neue_buchung(raumId=RAUM), auth=auth("a"))
    # … überschneidende Prüfung muss "nicht verfügbar" liefern.
    r = _pruefe(client, von="09:30", bis="10:30")
    body = r.json()
    assert body["verfuegbar"] is False
    assert body["konflikte"] == [{"von": "09:00", "bis": "10:00"}]


def test_pruefung_beruecksichtigt_nur_ueberschneidende_buchungen(client):
    client.post("/api/buchungen", json=neue_buchung(raumId=RAUM), auth=auth("a"))
    # Angrenzend, aber ohne Überschneidung → weiterhin verfügbar.
    r = _pruefe(client, von="10:00", bis="11:00")
    assert r.json()["verfuegbar"] is True


def test_bei_verfuegbarkeit_direkt_buchbar(client):
    assert _pruefe(client).json()["verfuegbar"] is True
    r = client.post("/api/buchungen", json=neue_buchung(raumId=RAUM), auth=auth("a"))
    assert r.status_code == 201
