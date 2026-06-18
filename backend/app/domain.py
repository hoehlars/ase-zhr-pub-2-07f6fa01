"""Fachliche Hilfsfunktionen: Zeitlogik, Büroöffnungszeiten, Verfügbarkeit.

Spiegelt die Konventionen der SPA (``frontend/src/lib/mock-data.ts``) wider,
damit Frontend und Backend dieselbe Fachlogik verwenden.
"""

from __future__ import annotations

from datetime import datetime, timezone

# Büroöffnungszeiten – Grenzen für die Zeitauswahl (vgl. CLVN-009).
OEFFNUNG_VON = "08:00"
OEFFNUNG_BIS = "18:00"

# Raster der wählbaren Zeiten (30-Minuten-Schritte).
RASTER_MINUTEN = 30


def to_minutes(zeit: str) -> int:
    """Minuten seit Mitternacht für ``"HH:mm"``."""
    stunde, minute = zeit.split(":")
    return int(stunde) * 60 + int(minute)


def from_minutes(minuten: int) -> str:
    """Umkehrung von :func:`to_minutes` → ``"HH:mm"``."""
    return f"{minuten // 60:02d}:{minuten % 60:02d}"


def ueberschneidet(von_a: str, bis_a: str, von_b: str, bis_b: str) -> bool:
    """Überschneiden sich die Zeitfenster [von_a, bis_a) und [von_b, bis_b)?"""
    return to_minutes(von_a) < to_minutes(bis_b) and to_minutes(von_b) < to_minutes(
        bis_a
    )


def innerhalb_oeffnungszeiten(von: str, bis: str) -> bool:
    return to_minutes(OEFFNUNG_VON) <= to_minutes(von) and to_minutes(
        bis
    ) <= to_minutes(OEFFNUNG_BIS)


def dauer_minuten(von: str, bis: str) -> int:
    return to_minutes(bis) - to_minutes(von)


def alternative_zeitfenster(
    belegte: list[tuple[str, str]],
    von: str,
    bis: str,
    max_anzahl: int = 6,
) -> list[dict[str, str]]:
    """Freie Zeitfenster gleicher Dauer am selben Tag (CLVN-012).

    Es werden Kandidaten im 30-Minuten-Raster innerhalb der Öffnungszeiten
    geprüft, der Wunschzeitraum ausgelassen und nach zeitlicher Nähe zum
    gewünschten Start sortiert (frühere **und** spätere Alternativen).
    """
    dauer = dauer_minuten(von, bis)
    wunsch_start = to_minutes(von)
    grenze_start = to_minutes(OEFFNUNG_VON)
    grenze_ende = to_minutes(OEFFNUNG_BIS)

    kandidaten: list[dict[str, str]] = []
    start = grenze_start
    while start + dauer <= grenze_ende:
        kandidat_von = from_minutes(start)
        kandidat_bis = from_minutes(start + dauer)
        ist_wunsch = start == wunsch_start
        frei = not any(
            ueberschneidet(kandidat_von, kandidat_bis, b_von, b_bis)
            for b_von, b_bis in belegte
        )
        if frei and not ist_wunsch:
            kandidaten.append({"von": kandidat_von, "bis": kandidat_bis})
        start += RASTER_MINUTEN

    # Nach Nähe zum Wunschstart sortieren.
    kandidaten.sort(key=lambda k: abs(to_minutes(k["von"]) - wunsch_start))
    return kandidaten[:max_anzahl]


def ist_vergangen(datum: str, bis: str, jetzt: datetime | None = None) -> bool:
    """Liegt das Ende der Buchung in der Vergangenheit?"""
    jetzt = jetzt or datetime.now(timezone.utc)
    ende = datetime.strptime(f"{datum} {bis}", "%Y-%m-%d %H:%M")
    # Naiver Vergleich in lokaler/aufrufender Zeitzone genügt für den Prototyp.
    return ende < jetzt.replace(tzinfo=None)
