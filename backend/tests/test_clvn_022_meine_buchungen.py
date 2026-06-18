"""E2E-Tests für CLVN-022 – Meine Buchungen aufrufen.

Akzeptanzkriterien (Backend-Anteil):
- nur eigene Buchungen des angemeldeten Mitarbeiters werden angezeigt
- Zugriff erfordert Authentifizierung
"""

from __future__ import annotations

from conftest import auth, neue_buchung


def test_nur_eigene_buchungen_sichtbar(client):
    client.post(
        "/api/buchungen",
        json=neue_buchung(raumId="r1", titel="Von Anna"),
        auth=auth("anna"),
    )
    client.post(
        "/api/buchungen",
        json=neue_buchung(raumId="r2", titel="Von Bob"),
        auth=auth("bob"),
    )

    anna = client.get("/api/buchungen", auth=auth("anna")).json()
    bob = client.get("/api/buchungen", auth=auth("bob")).json()

    assert [b["titel"] for b in anna] == ["Von Anna"]
    assert [b["titel"] for b in bob] == ["Von Bob"]


def test_uebersicht_erfordert_authentifizierung(client):
    r = client.get("/api/buchungen")
    assert r.status_code == 401
