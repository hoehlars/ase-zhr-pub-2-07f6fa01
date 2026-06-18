"""E2E-Tests für CLVN-011 – Belegte Zeitfenster erkennen.

Akzeptanzkriterien (Backend-Anteil):
- belegte Zeitfenster eines Raums werden geliefert
- freie sind von belegten unterscheidbar (nur belegte werden zurückgegeben)
- Anzeige aktualisiert sich bei Auswahl eines anderen Raums
- bei vielen Buchungen übersichtlich (sortiert)
"""

from __future__ import annotations

from conftest import auth, neue_buchung

DATUM = "2030-06-17"


def _belege(client, raum, von, bis, benutzer="a"):
    return client.post(
        "/api/buchungen",
        json=neue_buchung(raumId=raum, datum=DATUM, von=von, bis=bis),
        auth=auth(benutzer),
    )


def test_belegte_zeitfenster_werden_geliefert(client):
    _belege(client, "raum-x", "09:00", "10:30")
    _belege(client, "raum-x", "13:00", "14:00")
    r = client.get("/api/raeume/raum-x/belegungen", params={"datum": DATUM})
    assert r.status_code == 200
    assert r.json() == [
        {"von": "09:00", "bis": "10:30"},
        {"von": "13:00", "bis": "14:00"},
    ]


def test_freie_zeitfenster_tauchen_nicht_auf(client):
    # Kein Eintrag → leere Liste (alles frei).
    r = client.get("/api/raeume/leer/belegungen", params={"datum": DATUM})
    assert r.json() == []


def test_belegung_ist_raumspezifisch(client):
    _belege(client, "raum-a", "09:00", "10:00")
    _belege(client, "raum-b", "11:00", "12:00")
    a = client.get("/api/raeume/raum-a/belegungen", params={"datum": DATUM}).json()
    b = client.get("/api/raeume/raum-b/belegungen", params={"datum": DATUM}).json()
    assert a == [{"von": "09:00", "bis": "10:00"}]
    assert b == [{"von": "11:00", "bis": "12:00"}]


def test_viele_buchungen_werden_sortiert_geliefert(client):
    _belege(client, "raum-voll", "15:00", "16:00")
    _belege(client, "raum-voll", "08:00", "09:00")
    _belege(client, "raum-voll", "11:00", "12:00")
    r = client.get("/api/raeume/raum-voll/belegungen", params={"datum": DATUM}).json()
    assert [b["von"] for b in r] == ["08:00", "11:00", "15:00"]
