"""E2E-Tests für CLVN-012 – Alternative Zeitfenster anzeigen.

Akzeptanzkriterien:
- bei Konflikt werden Alternativen angezeigt
- mindestens drei (sofern verfügbar)
- gleiche Dauer wie Wunschzeitraum
- nach zeitlicher Nähe sortiert
- frühere und spätere Alternativen am selben Tag
- eine Alternative kann direkt gebucht werden
- keine Alternativen am selben Tag → wird mitgeteilt (leere Liste)
"""

from __future__ import annotations

from conftest import auth, neue_buchung

RAUM = "clvn012-raum"
DATUM = "2030-06-17"


def _belege(client, von, bis):
    client.post(
        "/api/buchungen",
        json=neue_buchung(raumId=RAUM, datum=DATUM, von=von, bis=bis),
        auth=auth("a"),
    )


def _pruefe(client, von, bis):
    return client.get(
        "/api/verfuegbarkeit",
        params={"raumId": RAUM, "datum": DATUM, "von": von, "bis": bis},
    ).json()


def test_bei_konflikt_werden_alternativen_vorgeschlagen(client):
    _belege(client, "09:00", "10:00")
    body = _pruefe(client, "09:00", "10:00")
    assert body["verfuegbar"] is False
    assert len(body["alternativen"]) >= 3


def test_alternativen_haben_gleiche_dauer(client):
    _belege(client, "09:00", "10:30")  # 90 Minuten
    body = _pruefe(client, "09:00", "10:30")

    def dauer(slot):
        vh, vm = map(int, slot["von"].split(":"))
        bh, bm = map(int, slot["bis"].split(":"))
        return (bh * 60 + bm) - (vh * 60 + vm)

    assert all(dauer(a) == 90 for a in body["alternativen"])


def test_alternativen_nach_naehe_sortiert_mit_frueher_und_spaeter(client):
    # Wunsch 12:00–13:00 ist belegt → 11:00 (früher) und 13:00 (später) sind frei.
    _belege(client, "12:00", "13:00")
    alternativen = _pruefe(client, "12:00", "13:00")["alternativen"]
    starts = [a["von"] for a in alternativen]
    # nächstgelegene zuerst (11:00 und 13:00 haben Abstand 60 Min)
    assert starts[0] in {"11:00", "13:00"}
    assert any(s < "12:00" for s in starts)  # frühere Alternative
    assert any(s > "12:00" for s in starts)  # spätere Alternative


def test_alternative_ist_buchbar(client):
    _belege(client, "09:00", "10:00")
    alternative = _pruefe(client, "09:00", "10:00")["alternativen"][0]
    r = client.post(
        "/api/buchungen",
        json=neue_buchung(
            raumId=RAUM, datum=DATUM, von=alternative["von"], bis=alternative["bis"]
        ),
        auth=auth("b"),
    )
    assert r.status_code == 201


def test_keine_alternativen_wenn_tag_voll(client):
    # Ganzen Tag (08:00–18:00) belegen → keine Alternative gleicher Dauer.
    _belege(client, "08:00", "18:00")
    body = _pruefe(client, "09:00", "10:00")
    assert body["verfuegbar"] is False
    assert body["alternativen"] == []
