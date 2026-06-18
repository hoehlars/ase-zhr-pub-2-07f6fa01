"""Calvin Booking Service – FastAPI-Anwendung (siehe ADR-0001).

Verwaltet Raumbuchungen und Verfügbarkeit. Ressourcedaten (Standorte, Räume,
Ausstattung) liegen gemäß ADR-0002 in der SPA; der Service arbeitet nur mit IDs.
Authentifizierung über Basic-Auth ohne Passwort (ADR-0003).
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, SessionLocal, engine
from .routers import buchungen, verfuegbarkeit
from .seed import seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Schema anlegen und Demodaten einspielen (idempotent).
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed(db)
    yield


app = FastAPI(title="Calvin Booking Service", lifespan=lifespan)

# CORS offen halten: Im Codespaces-/Proxy-Betrieb ruft die SPA das Backend
# cross-origin auf (siehe frontend/src/lib/api.ts). Für den Prototyp genügt "*".
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(buchungen.router)
app.include_router(verfuegbarkeit.router)


@app.get("/api/hello")
def hello():
    return {"message": "Hello World!"}
