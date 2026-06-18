"""Endpoints zur Verwaltung von Raumbuchungen.

Deckt ab: Buchung absenden (CLVN-019), Buchungsbestätigung (CLVN-020),
Meetingtitel/Notiz (CLVN-018/017), Übersicht (CLVN-022/023), Details (CLVN-024),
Export (CLVN-025), Stornieren (CLVN-026), Ändern (CLVN-027).
"""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from .. import services
from ..auth import CurrentUser
from ..database import get_db
from ..mapper import buchung_to_out
from ..schemas import BuchungCreate, BuchungOut, BuchungUpdate

router = APIRouter(prefix="/api/buchungen", tags=["buchungen"])

DbSession = Annotated[Session, Depends(get_db)]


@router.post("", response_model=BuchungOut, status_code=status.HTTP_201_CREATED)
def buchung_absenden(
    payload: BuchungCreate, benutzer: CurrentUser, db: DbSession
) -> BuchungOut:
    """Sendet eine Raumbuchung ab und gibt die Buchungsbestätigung zurück.

    CLVN-019: speichert die Buchung, verhindert Doppelbuchungen.
    CLVN-020: die Antwort enthält alle Bestätigungsdetails.
    """
    try:
        buchung = services.erstelle_buchung(
            db,
            benutzer=benutzer,
            raum_id=payload.raum_id,
            standort_id=payload.standort_id,
            datum=payload.datum,
            von=payload.von,
            bis=payload.bis,
            titel=payload.titel,
            notiz=payload.notiz,
        )
    except services.ValidierungsError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, str(exc)) from exc
    except services.KonfliktError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc)) from exc
    return buchung_to_out(buchung)


@router.get("", response_model=list[BuchungOut])
def buchungsuebersicht(benutzer: CurrentUser, db: DbSession) -> list[BuchungOut]:
    """Übersicht aller eigenen Buchungen, chronologisch (CLVN-022/023)."""
    return [buchung_to_out(b) for b in services.buchungen_des_nutzers(db, benutzer)]


@router.get("/{buchung_id}", response_model=BuchungOut)
def buchungsdetails(
    buchung_id: str, benutzer: CurrentUser, db: DbSession
) -> BuchungOut:
    """Details einer einzelnen Buchung (CLVN-024)."""
    buchung = services.hole_buchung(db, benutzer, buchung_id)
    if buchung is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Buchung nicht gefunden")
    return buchung_to_out(buchung)


@router.get("/{buchung_id}/export.ics")
def buchung_exportieren(
    buchung_id: str, benutzer: CurrentUser, db: DbSession
) -> Response:
    """Exportiert eine Buchung als iCalendar-Datei (CLVN-025).

    Hinweis (ADR-0002): Der Booking Service kennt nur IDs, daher enthält der
    Export ``raum_id``/``standort_id`` statt Anzeigenamen. Die SPA kann den
    Export bei Bedarf mit Klarnamen anreichern.
    """
    buchung = services.hole_buchung(db, benutzer, buchung_id)
    if buchung is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Buchung nicht gefunden")

    dtstart = f"{buchung.datum.replace('-', '')}T{buchung.von.replace(':', '')}00"
    dtend = f"{buchung.datum.replace('-', '')}T{buchung.bis.replace(':', '')}00"
    beschreibung = buchung.notiz or ""
    ics = "\r\n".join(
        [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Calvin//Booking Service//DE",
            "BEGIN:VEVENT",
            f"UID:{buchung.id}@calvin",
            f"SUMMARY:{buchung.titel}",
            f"DTSTART:{dtstart}",
            f"DTEND:{dtend}",
            f"LOCATION:{buchung.raum_id}, {buchung.standort_id}",
            f"DESCRIPTION:{beschreibung}",
            "END:VEVENT",
            "END:VCALENDAR",
            "",
        ]
    )
    return Response(
        content=ics,
        media_type="text/calendar",
        headers={
            "Content-Disposition": f'attachment; filename="buchung-{buchung.id}.ics"'
        },
    )


@router.patch("/{buchung_id}", response_model=BuchungOut)
def buchung_aendern(
    buchung_id: str,
    payload: BuchungUpdate,
    benutzer: CurrentUser,
    db: DbSession,
) -> BuchungOut:
    """Ändert eine Buchung und prüft die Verfügbarkeit neu (CLVN-027)."""
    notiz_gesetzt = "notiz" in payload.model_fields_set
    try:
        buchung = services.aendere_buchung(
            db,
            benutzer,
            buchung_id,
            raum_id=payload.raum_id,
            datum=payload.datum,
            von=payload.von,
            bis=payload.bis,
            titel=payload.titel,
            notiz=payload.notiz,
            notiz_gesetzt=notiz_gesetzt,
        )
    except services.ValidierungsError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, str(exc)) from exc
    except services.KonfliktError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc)) from exc
    if buchung is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Buchung nicht gefunden")
    return buchung_to_out(buchung)


@router.delete("/{buchung_id}", response_model=BuchungOut)
def buchung_stornieren(
    buchung_id: str, benutzer: CurrentUser, db: DbSession
) -> BuchungOut:
    """Storniert eine Buchung (CLVN-026).

    Der Raum wird dadurch wieder verfügbar; vergangene Buchungen sind geschützt.
    """
    try:
        buchung = services.storniere_buchung(db, benutzer, buchung_id)
    except services.VergangenError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc)) from exc
    if buchung is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Buchung nicht gefunden")
    return buchung_to_out(buchung)
