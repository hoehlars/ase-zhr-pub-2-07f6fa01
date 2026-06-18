"""Datenbank-Setup für den Booking Service (SQLAlchemy + SQLite, siehe ADR-0001).

Die DB-URL ist über ``DATABASE_URL`` konfigurierbar (Default: lokale Datei
``calvin.db``). Tests setzen eine eigene temporäre Datei, damit sie isoliert
gegen ein frisches Schema laufen.
"""

from __future__ import annotations

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./calvin.db")

# check_same_thread=False: SQLite erlaubt sonst keinen Zugriff über Threads,
# was uvicorn/TestClient aber benötigen.
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI-Dependency: stellt pro Request eine Session bereit."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
