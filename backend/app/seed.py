"""Initiale Demodaten, gespiegelt aus den SPA-Mock-Daten.

Spiegelt ``belegungen`` (Buchungen anderer Mitarbeiter) und ``eigeneBuchungen``
(Buchungen des Demo-Nutzers ``calvin``) aus ``frontend/src/lib/mock-data.ts``,
damit die laufende Anwendung und manuelle Tests realistische Daten vorfinden.

Das Seeding ist idempotent: Es läuft nur, wenn die Tabelle leer ist.
"""

from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .models import STATUS_AKTIV, Buchung

DEMO_NUTZER = "calvin"
KOLLEGE = "kollege"


def _standort_aus_raum(raum_id: str) -> str:
    """Mock-Raum-IDs haben die Form ``<standort>-<name>``."""
    return raum_id.split("-", 1)[0]


# Bestehende Belegungen anderer Mitarbeiter (aus mock-data.ts).
_BELEGUNGEN = [
    ("koeln-rhein", "2026-06-17", "09:00", "10:30"),
    ("koeln-rhein", "2026-06-17", "13:00", "14:00"),
    ("koeln-rhein", "2026-06-18", "10:00", "12:00"),
    ("koeln-dom", "2026-06-17", "08:00", "12:00"),
    ("koeln-dom", "2026-06-17", "14:00", "17:00"),
    ("koeln-severin", "2026-06-17", "11:00", "11:30"),
    ("koeln-hohenzollern", "2026-06-17", "15:00", "16:30"),
    ("berlin-spree", "2026-06-17", "09:00", "11:00"),
    ("hamburg-elbe", "2026-06-17", "13:00", "15:00"),
    ("muenchen-isar", "2026-06-17", "10:00", "12:00"),
]

# Eigene Buchungen des Demo-Nutzers (aus mock-data.ts).
_EIGENE = [
    (
        "koeln-hohenzollern",
        "2026-06-18",
        "09:00",
        "10:00",
        "Team Sync",
        "Wochenplanung mit dem Projektteam.",
    ),
    (
        "berlin-spree",
        "2026-06-24",
        "14:00",
        "16:00",
        "Kundenworkshop Discovery",
        "Workshop-Material vorbereiten.",
    ),
    ("koeln-dom", "2026-07-01", "11:00", "12:30", "Architektur-Review", None),
    ("muenchen-isar", "2026-06-10", "10:00", "11:00", "1:1 mit Lead", None),
]


def seed(db: Session) -> None:
    if db.scalar(select(func.count()).select_from(Buchung)):
        return

    for raum_id, datum, von, bis in _BELEGUNGEN:
        db.add(
            Buchung(
                id=uuid.uuid4().hex,
                raum_id=raum_id,
                standort_id=_standort_aus_raum(raum_id),
                datum=datum,
                von=von,
                bis=bis,
                titel="Belegt",
                notiz=None,
                benutzer=KOLLEGE,
                status=STATUS_AKTIV,
            )
        )

    for raum_id, datum, von, bis, titel, notiz in _EIGENE:
        db.add(
            Buchung(
                id=uuid.uuid4().hex,
                raum_id=raum_id,
                standort_id=_standort_aus_raum(raum_id),
                datum=datum,
                von=von,
                bis=bis,
                titel=titel,
                notiz=notiz,
                benutzer=DEMO_NUTZER,
                status=STATUS_AKTIV,
            )
        )

    db.commit()
