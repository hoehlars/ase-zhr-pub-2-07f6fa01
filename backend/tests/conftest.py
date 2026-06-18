"""Gemeinsames Test-Setup für die End-to-End-Tests des Booking Service.

Die Tests laufen gegen die **echte** FastAPI-Anwendung (Routing, Auth, SQLite,
Transaktionen) über HTTP via ``TestClient`` – also End-to-End auf API-Ebene.

Jeder Test erhält eine frische, neu geseedete SQLite-Datenbank.
"""

from __future__ import annotations

import os
import tempfile

# DB-URL auf eine temporäre Datei setzen, BEVOR die App importiert wird
# (app.database liest die URL beim Import).
_TMP_DIR = tempfile.mkdtemp(prefix="calvin-tests-")
os.environ["DATABASE_URL"] = f"sqlite:///{_TMP_DIR}/test.db"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.database import Base, engine  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture
def client():
    # Schema je Test zurücksetzen; der Lifespan-Hook legt es neu an und seedet.
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c


def auth(benutzer: str) -> tuple[str, str]:
    """Basic-Auth-Tupel (Passwort wird ignoriert, ADR-0003)."""
    return (benutzer, "")


def neue_buchung(**overrides) -> dict:
    """Standard-Buchungspayload, per ``overrides`` anpassbar."""
    payload = {
        "raumId": "test-raum",
        "standortId": "test-standort",
        "datum": "2030-06-17",
        "von": "09:00",
        "bis": "10:00",
        "titel": "Test-Meeting",
    }
    payload.update(overrides)
    return payload
