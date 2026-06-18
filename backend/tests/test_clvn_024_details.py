"""E2E-Tests für CLVN-024 – Buchungsdetails ansehen.

Akzeptanzkriterien (Backend-Anteil):
- einzelne Buchung abrufbar
- enthält Raum (ID), Standort (ID), Datum, Start-/Endzeit, Notiz/Zweck
- fremde/unbekannte Buchung nicht abrufbar (404)
"""

from __future__ import annotations

from conftest import auth, neue_buchung


def test_einzelne_buchung_mit_allen_feldern(client):
    payload = neue_buchung(
        raumId="hamburg-elbe",
        standortId="hamburg",
        datum="2030-05-05",
        von="10:00",
        bis="11:00",
        titel="Workshop",
        notiz="Material mitbringen",
    )
    buchung_id = client.post("/api/buchungen", json=payload, auth=auth("a")).json()[
        "id"
    ]

    detail = client.get(f"/api/buchungen/{buchung_id}", auth=auth("a")).json()
    assert detail["raumId"] == "hamburg-elbe"
    assert detail["standortId"] == "hamburg"
    assert detail["datum"] == "2030-05-05"
    assert detail["von"] == "10:00"
    assert detail["bis"] == "11:00"
    assert detail["titel"] == "Workshop"
    assert detail["notiz"] == "Material mitbringen"


def test_unbekannte_buchung_404(client):
    assert client.get("/api/buchungen/gibtsnicht", auth=auth("a")).status_code == 404


def test_fremde_buchung_nicht_abrufbar(client):
    buchung_id = client.post(
        "/api/buchungen", json=neue_buchung(), auth=auth("anna")
    ).json()["id"]
    r = client.get(f"/api/buchungen/{buchung_id}", auth=auth("bob"))
    assert r.status_code == 404
