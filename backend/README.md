# Booking Service

Backend für Calvin gemäß [ADR-0001](../docs/architektur/adrs/ADR-0001-technologie-stack-fuer-booking-service.md):
**FastAPI** (Python) mit **SQLAlchemy** und **SQLite**.

## Entwicklung

```bash
# Virtuelle Umgebung anlegen und Abhängigkeiten installieren
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

# Dev-Server starten (Port 3001, passend zum Vite-Proxy im Frontend)
.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 3001 --reload
```

Die API ist dann unter `http://localhost:3001/api/hello` erreichbar,
die automatische OpenAPI-Doku unter `http://localhost:3001/docs`.

## Stand

Prototyp-Gerüst mit einem `/api/hello`-Endpoint. Datenbankanbindung
(SQLAlchemy/Alembic) und Buchungslogik folgen mit den entsprechenden User
Stories.
