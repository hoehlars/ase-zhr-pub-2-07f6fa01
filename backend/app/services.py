"""Anwendungslogik für Buchungen und Verfügbarkeit.

Hier liegt die Kernlogik des Booking Service: Verfügbarkeitsprüfung,
Doppelbuchungs-Verhinderung (QS-2) und Verwaltung von Buchungen.
"""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from . import domain
from .models import STATUS_AKTIV, STATUS_STORNIERT, Buchung


class KonfliktError(Exception):
    """Der Raum ist im gewünschten Zeitraum bereits belegt (Doppelbuchung)."""


class VergangenError(Exception):
    """Aktion auf einer vergangenen Buchung ist nicht erlaubt."""


class ValidierungsError(Exception):
    """Fachliche Validierung fehlgeschlagen (z. B. Endzeit vor Startzeit)."""


def aktive_belegungen(
    db: Session,
    raum_id: str,
    datum: str,
    *,
    ausser_id: str | None = None,
) -> list[Buchung]:
    """Alle aktiven Buchungen eines Raums an einem Datum.

    ``ausser_id`` schließt eine Buchung aus (für die Verfügbarkeitsprüfung bei
    Änderungen, CLVN-027).
    """
    stmt = select(Buchung).where(
        Buchung.raum_id == raum_id,
        Buchung.datum == datum,
        Buchung.status == STATUS_AKTIV,
    )
    if ausser_id is not None:
        stmt = stmt.where(Buchung.id != ausser_id)
    return list(db.scalars(stmt))


def konflikte(
    db: Session,
    raum_id: str,
    datum: str,
    von: str,
    bis: str,
    *,
    ausser_id: str | None = None,
) -> list[Buchung]:
    """Aktive Buchungen, die sich mit dem Wunschzeitraum überschneiden."""
    return [
        b
        for b in aktive_belegungen(db, raum_id, datum, ausser_id=ausser_id)
        if domain.ueberschneidet(von, bis, b.von, b.bis)
    ]


def pruefe_zeitraum(von: str, bis: str) -> None:
    """Validiert Zeitlogik: Endzeit nach Startzeit, innerhalb Öffnungszeiten."""
    if domain.to_minutes(bis) <= domain.to_minutes(von):
        raise ValidierungsError("Die Endzeit muss nach der Startzeit liegen")
    if not domain.innerhalb_oeffnungszeiten(von, bis):
        raise ValidierungsError(
            f"Buchungen sind nur innerhalb der Öffnungszeiten "
            f"({domain.OEFFNUNG_VON}–{domain.OEFFNUNG_BIS}) möglich"
        )


def erstelle_buchung(
    db: Session,
    *,
    benutzer: str,
    raum_id: str,
    standort_id: str,
    datum: str,
    von: str,
    bis: str,
    titel: str,
    notiz: str | None,
) -> Buchung:
    """Legt eine Buchung an und verhindert Doppelbuchungen (QS-2, CLVN-019).

    Die Konfliktprüfung und das Insert laufen in **einer** Transaktion. SQLite
    serialisiert Schreibzugriffe, sodass keine zwei kollidierenden Buchungen
    gleichzeitig committet werden können.
    """
    pruefe_zeitraum(von, bis)

    if konflikte(db, raum_id, datum, von, bis):
        raise KonfliktError("Der Konferenzraum ist in diesem Zeitraum bereits belegt")

    buchung = Buchung(
        id=uuid.uuid4().hex,
        raum_id=raum_id,
        standort_id=standort_id,
        datum=datum,
        von=von,
        bis=bis,
        titel=titel.strip(),
        notiz=notiz,
        benutzer=benutzer,
        status=STATUS_AKTIV,
    )
    db.add(buchung)
    db.commit()
    db.refresh(buchung)
    return buchung


def buchungen_des_nutzers(db: Session, benutzer: str) -> list[Buchung]:
    """Aktive Buchungen eines Nutzers, chronologisch (nächste zuerst) – CLVN-023."""
    stmt = select(Buchung).where(
        Buchung.benutzer == benutzer,
        Buchung.status == STATUS_AKTIV,
    )
    buchungen = list(db.scalars(stmt))
    # Nächste (zukünftige) Buchung zuerst, vergangene danach – jeweils
    # chronologisch aufsteigend (CLVN-023).
    buchungen.sort(key=lambda b: (domain.ist_vergangen(b.datum, b.bis), b.datum, b.von))
    return buchungen


def hole_buchung(db: Session, benutzer: str, buchung_id: str) -> Buchung | None:
    """Einzelne aktive Buchung des Nutzers (CLVN-024)."""
    stmt = select(Buchung).where(
        Buchung.id == buchung_id,
        Buchung.benutzer == benutzer,
        Buchung.status == STATUS_AKTIV,
    )
    return db.scalars(stmt).first()


def storniere_buchung(db: Session, benutzer: str, buchung_id: str) -> Buchung | None:
    """Storniert eine Buchung; vergangene Buchungen bleiben unangetastet (CLVN-026)."""
    buchung = hole_buchung(db, benutzer, buchung_id)
    if buchung is None:
        return None
    if domain.ist_vergangen(buchung.datum, buchung.bis):
        raise VergangenError("Vergangene Buchungen können nicht storniert werden")
    buchung.status = STATUS_STORNIERT
    db.commit()
    db.refresh(buchung)
    return buchung


def aendere_buchung(
    db: Session,
    benutzer: str,
    buchung_id: str,
    *,
    raum_id: str | None = None,
    datum: str | None = None,
    von: str | None = None,
    bis: str | None = None,
    titel: str | None = None,
    notiz: str | None = None,
    notiz_gesetzt: bool = False,
) -> Buchung | None:
    """Ändert eine Buchung und prüft die Verfügbarkeit neu (CLVN-027)."""
    buchung = hole_buchung(db, benutzer, buchung_id)
    if buchung is None:
        return None

    neu_raum = raum_id if raum_id is not None else buchung.raum_id
    neu_datum = datum if datum is not None else buchung.datum
    neu_von = von if von is not None else buchung.von
    neu_bis = bis if bis is not None else buchung.bis

    pruefe_zeitraum(neu_von, neu_bis)

    if konflikte(db, neu_raum, neu_datum, neu_von, neu_bis, ausser_id=buchung.id):
        raise KonfliktError("Der Konferenzraum ist im neuen Zeitraum bereits belegt")

    buchung.raum_id = neu_raum
    buchung.datum = neu_datum
    buchung.von = neu_von
    buchung.bis = neu_bis
    if titel is not None:
        buchung.titel = titel.strip()
    if notiz_gesetzt:
        buchung.notiz = notiz

    db.commit()
    db.refresh(buchung)
    return buchung
