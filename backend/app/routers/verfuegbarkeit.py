"""Endpoints rund um Verfügbarkeit und Belegung (CLVN-010, CLVN-011, CLVN-012)."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from .. import domain, services
from ..database import get_db
from ..schemas import BelegungOut, VerfuegbarkeitOut, Zeitfenster

router = APIRouter(prefix="/api", tags=["verfuegbarkeit"])

DbSession = Annotated[Session, Depends(get_db)]


@router.get("/raeume/{raum_id}/belegungen", response_model=list[BelegungOut])
def belegungen(
    raum_id: str,
    datum: Annotated[str, Query(description="ISO-Datum YYYY-MM-DD")],
    db: DbSession,
) -> list[BelegungOut]:
    """Belegte Zeitfenster eines Raums an einem Datum (CLVN-011).

    Liefert die belegten Slots, damit das Frontend freie von belegten
    Zeitfenstern unterscheiden kann.
    """
    belegt = services.aktive_belegungen(db, raum_id, datum)
    belegt.sort(key=lambda b: domain.to_minutes(b.von))
    return [BelegungOut(von=b.von, bis=b.bis) for b in belegt]


@router.get("/verfuegbarkeit", response_model=VerfuegbarkeitOut)
def verfuegbarkeit(
    db: DbSession,
    raum_id: Annotated[str, Query(alias="raumId")],
    datum: Annotated[str, Query()],
    von: Annotated[str, Query()],
    bis: Annotated[str, Query()],
) -> VerfuegbarkeitOut:
    """Prüft die Verfügbarkeit eines Raums für einen Zeitraum (CLVN-010).

    Bei Konflikt werden zusätzlich Alternativvorschläge gleicher Dauer am selben
    Tag geliefert (CLVN-012).
    """
    kollisionen = services.konflikte(db, raum_id, datum, von, bis)
    verfuegbar = not kollisionen

    alternativen: list[Zeitfenster] = []
    if not verfuegbar:
        belegte = [
            (b.von, b.bis) for b in services.aktive_belegungen(db, raum_id, datum)
        ]
        alternativen = [
            Zeitfenster(von=a["von"], bis=a["bis"])
            for a in domain.alternative_zeitfenster(belegte, von, bis)
        ]

    return VerfuegbarkeitOut(
        raum_id=raum_id,
        datum=datum,
        von=von,
        bis=bis,
        verfuegbar=verfuegbar,
        konflikte=[Zeitfenster(von=k.von, bis=k.bis) for k in kollisionen],
        alternativen=alternativen,
    )
