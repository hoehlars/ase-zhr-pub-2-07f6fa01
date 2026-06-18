"""Pydantic-Schemas (API-Verträge).

Die JSON-Felder verwenden ``camelCase`` (``raumId``, ``standortId`` …), passend
zu den TypeScript-Typen der SPA (``frontend/src/lib/mock-data.ts``). Intern
arbeitet das Backend mit ``snake_case``; ``populate_by_name`` erlaubt beides.
"""

from __future__ import annotations

import re

from pydantic import BaseModel, ConfigDict, field_validator
from pydantic.alias_generators import to_camel

ZEIT_PATTERN = re.compile(r"^([01]\d|2[0-3]):([0-5]\d)$")
DATUM_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class BuchungCreate(CamelModel):
    raum_id: str
    standort_id: str
    datum: str
    von: str
    bis: str
    # Meetingtitel: Pflichtfeld, max. 100 Zeichen (CLVN-018).
    titel: str
    # Buchungsnotiz: optional, max. 500 Zeichen (CLVN-017).
    notiz: str | None = None

    @field_validator("datum")
    @classmethod
    def _datum_format(cls, v: str) -> str:
        if not DATUM_PATTERN.match(v):
            raise ValueError("datum muss im Format YYYY-MM-DD vorliegen")
        return v

    @field_validator("von", "bis")
    @classmethod
    def _zeit_format(cls, v: str) -> str:
        if not ZEIT_PATTERN.match(v):
            raise ValueError("Zeit muss im Format HH:mm vorliegen")
        return v

    @field_validator("titel")
    @classmethod
    def _titel_pflicht(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Meetingtitel ist ein Pflichtfeld")
        if len(v) > 100:
            raise ValueError("Meetingtitel darf höchstens 100 Zeichen lang sein")
        return v

    @field_validator("notiz")
    @classmethod
    def _notiz_laenge(cls, v: str | None) -> str | None:
        if v is not None and len(v) > 500:
            raise ValueError("Buchungsnotiz darf höchstens 500 Zeichen lang sein")
        return v


class BuchungUpdate(CamelModel):
    """Änderung einer Buchung (CLVN-027). Alle Felder optional.

    Der Standort bleibt erhalten und ist daher nicht änderbar.
    """

    raum_id: str | None = None
    datum: str | None = None
    von: str | None = None
    bis: str | None = None
    titel: str | None = None
    notiz: str | None = None

    @field_validator("datum")
    @classmethod
    def _datum_format(cls, v: str | None) -> str | None:
        if v is not None and not DATUM_PATTERN.match(v):
            raise ValueError("datum muss im Format YYYY-MM-DD vorliegen")
        return v

    @field_validator("von", "bis")
    @classmethod
    def _zeit_format(cls, v: str | None) -> str | None:
        if v is not None and not ZEIT_PATTERN.match(v):
            raise ValueError("Zeit muss im Format HH:mm vorliegen")
        return v

    @field_validator("titel")
    @classmethod
    def _titel_laenge(cls, v: str | None) -> str | None:
        if v is not None:
            if not v.strip():
                raise ValueError("Meetingtitel darf nicht leer sein")
            if len(v) > 100:
                raise ValueError("Meetingtitel darf höchstens 100 Zeichen lang sein")
        return v

    @field_validator("notiz")
    @classmethod
    def _notiz_laenge(cls, v: str | None) -> str | None:
        if v is not None and len(v) > 500:
            raise ValueError("Buchungsnotiz darf höchstens 500 Zeichen lang sein")
        return v


class BuchungOut(CamelModel):
    id: str
    raum_id: str
    standort_id: str
    datum: str
    von: str
    bis: str
    titel: str
    notiz: str | None
    status: str
    # Abgeleitete Felder für die Buchungsübersicht (CLVN-023).
    dauer_minuten: int
    vergangen: bool


class Zeitfenster(CamelModel):
    von: str
    bis: str


class VerfuegbarkeitOut(CamelModel):
    raum_id: str
    datum: str
    von: str
    bis: str
    verfuegbar: bool
    # Bestehende Buchungen, die mit dem Wunschzeitraum kollidieren.
    konflikte: list[Zeitfenster]
    # Alternativvorschläge gleicher Dauer (nur wenn nicht verfügbar).
    alternativen: list[Zeitfenster]


class BelegungOut(CamelModel):
    """Ein belegtes Zeitfenster eines Raums (CLVN-011)."""

    von: str
    bis: str
