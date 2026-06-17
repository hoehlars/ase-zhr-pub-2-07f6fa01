from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Booking Service – siehe ADR-0001 (FastAPI + SQLAlchemy + SQLite).
# Aktuell nur ein Health-/Hello-Endpoint; Buchungslogik und DB-Anbindung folgen.
app = FastAPI(title="Calvin Booking Service")

# CORS offen halten: Im Codespaces-/Proxy-Betrieb ruft die SPA das Backend
# cross-origin auf (siehe frontend/src/lib/api.ts). Für den Prototyp genügt "*".
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/hello")
def hello():
    return {"message": "Hello World!"}
