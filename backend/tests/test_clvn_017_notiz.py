"""E2E-Tests für CLVN-017 – Buchungsnotiz hinzufügen.

Akzeptanzkriterien (Backend-Anteil):
- Notiz ist optional
- bis zu 500 Zeichen
- Buchung auch ohne Notiz möglich
- Notiz wird mit der Buchung gespeichert
- Notiz ist in der Buchungsübersicht sichtbar
- Sonderzeichen und Zeilenumbrüche werden korrekt verarbeitet
"""

from __future__ import annotations

from conftest import auth, neue_buchung


def test_buchung_ohne_notiz_moeglich(client):
    payload = neue_buchung()
    assert "notiz" not in payload
    r = client.post("/api/buchungen", json=payload, auth=auth("a"))
    assert r.status_code == 201
    assert r.json()["notiz"] is None


def test_notiz_max_500_zeichen(client):
    zu_lang = "x" * 501
    r = client.post("/api/buchungen", json=neue_buchung(notiz=zu_lang), auth=auth("a"))
    assert r.status_code == 422

    gerade_noch = "x" * 500
    ok = client.post(
        "/api/buchungen", json=neue_buchung(notiz=gerade_noch), auth=auth("a")
    )
    assert ok.status_code == 201


def test_notiz_wird_gespeichert_und_angezeigt(client):
    client.post(
        "/api/buchungen",
        json=neue_buchung(notiz="Externe Gäste erwartet"),
        auth=auth("a"),
    )
    uebersicht = client.get("/api/buchungen", auth=auth("a")).json()
    assert uebersicht[0]["notiz"] == "Externe Gäste erwartet"


def test_sonderzeichen_und_zeilenumbrueche(client):
    notiz = 'Zeile 1\nZeile 2\tTab – Ümläüte & <Sonderzeichen> "Zitat"'
    client.post("/api/buchungen", json=neue_buchung(notiz=notiz), auth=auth("a"))
    gespeichert = client.get("/api/buchungen", auth=auth("a")).json()[0]["notiz"]
    assert gespeichert == notiz
