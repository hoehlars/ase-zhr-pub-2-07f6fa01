"""SQLAlchemy-Modelle des Booking Service.

Gemäß ADR-0002 kennt der Booking Service **keine** Ressourcedetails (Raumname,
Kapazität, Ausstattung, Standortname). Er speichert ausschließlich IDs
(``raum_id``, ``standort_id``) sowie die fachlichen Buchungsdaten. Anzeigenamen
löst die SPA aus ihren Mock-Daten auf.
"""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base

# Buchungsstatus
STATUS_AKTIV = "aktiv"
STATUS_STORNIERT = "storniert"


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Buchung(Base):
    """Eine Raumbuchung eines INNOQ-Mitarbeiters."""

    __tablename__ = "buchungen"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    # Ressourcen werden nur über ihre ID referenziert (ADR-0002).
    raum_id: Mapped[str] = mapped_column(String, index=True, nullable=False)
    standort_id: Mapped[str] = mapped_column(String, nullable=False)
    # Datum als ISO-String (YYYY-MM-DD), Zeiten als "HH:mm" – konsistent zur SPA.
    datum: Mapped[str] = mapped_column(String, index=True, nullable=False)
    von: Mapped[str] = mapped_column(String, nullable=False)
    bis: Mapped[str] = mapped_column(String, nullable=False)
    titel: Mapped[str] = mapped_column(String, nullable=False)
    notiz: Mapped[str | None] = mapped_column(String, nullable=True)
    # Nutzername aus Basic-Auth dient als Identifier (ADR-0003).
    benutzer: Mapped[str] = mapped_column(String, index=True, nullable=False)
    status: Mapped[str] = mapped_column(String, default=STATUS_AKTIV, nullable=False)
    erstellt_am: Mapped[datetime] = mapped_column(
        DateTime, default=_now, nullable=False
    )
