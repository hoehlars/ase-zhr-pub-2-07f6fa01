"""Abbildung von ORM-Modellen auf API-Schemas."""

from __future__ import annotations

from . import domain
from .models import Buchung
from .schemas import BuchungOut


def buchung_to_out(buchung: Buchung) -> BuchungOut:
    return BuchungOut(
        id=buchung.id,
        raum_id=buchung.raum_id,
        standort_id=buchung.standort_id,
        datum=buchung.datum,
        von=buchung.von,
        bis=buchung.bis,
        titel=buchung.titel,
        notiz=buchung.notiz,
        status=buchung.status,
        dauer_minuten=domain.dauer_minuten(buchung.von, buchung.bis),
        vergangen=domain.ist_vergangen(buchung.datum, buchung.bis),
    )
