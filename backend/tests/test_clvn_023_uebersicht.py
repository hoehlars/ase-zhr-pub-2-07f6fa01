"""E2E-Tests für CLVN-023 – Buchungsübersicht anzeigen.

Akzeptanzkriterien (Backend-Anteil):
- alle Buchungen des Mitarbeiters werden geliefert
- je Buchung mind.: Datum, Uhrzeit (von/bis), Raum (ID), Standort (ID)
- chronologisch sortiert (nächste Buchung zuerst)
- vergangene von zukünftigen unterscheidbar (Flag ``vergangen``)
- bei keinen Buchungen: leere Liste (Hinweis im Frontend)
"""

from __future__ import annotations

from conftest import auth, neue_buchung

USER = "uebersicht-user"


def _book(client, datum, von="09:00", bis="10:00", raum="r"):
    client.post(
        "/api/buchungen",
        json=neue_buchung(raumId=raum, datum=datum, von=von, bis=bis),
        auth=auth(USER),
    )


def test_pflichtfelder_je_buchung_vorhanden(client):
    _book(client, "2030-06-17")
    eintrag = client.get("/api/buchungen", auth=auth(USER)).json()[0]
    for feld in ("datum", "von", "bis", "raumId", "standortId"):
        assert feld in eintrag and eintrag[feld]


def test_naechste_buchung_zuerst_vergangene_danach(client):
    _book(client, "2030-01-02", raum="b")  # zukünftig, später
    _book(client, "2030-01-01", raum="a")  # zukünftig, früher → "nächste"
    _book(client, "2020-01-01", raum="p")  # vergangen
    reihenfolge = [
        b["datum"] for b in client.get("/api/buchungen", auth=auth(USER)).json()
    ]
    assert reihenfolge == ["2030-01-01", "2030-01-02", "2020-01-01"]


def test_vergangen_flag(client):
    _book(client, "2020-01-01", raum="alt")
    _book(client, "2030-01-01", raum="neu")
    eintraege = {
        b["raumId"]: b["vergangen"]
        for b in client.get("/api/buchungen", auth=auth(USER)).json()
    }
    assert eintraege["alt"] is True
    assert eintraege["neu"] is False


def test_keine_buchungen_leere_liste(client):
    r = client.get("/api/buchungen", auth=auth("niemand"))
    assert r.status_code == 200
    assert r.json() == []
