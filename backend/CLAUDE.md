# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Überblick

Booking Service für Calvin (Raumbuchungs-App von INNOQ). **FastAPI + SQLAlchemy + SQLite**
gemäß [ADR-0001](../docs/architektur/adrs/ADR-0001-technologie-stack-fuer-booking-service.md).

Aktueller Stand: Prototyp-Gerüst mit einem einzigen `/api/hello`-Endpoint in
`app/main.py`. DB-Anbindung (SQLAlchemy/Alembic) und Buchungslogik existieren noch
nicht und folgen mit den entsprechenden User Stories (`docs/produkt/backlog/`).

## Befehle

```bash
# Venv anlegen + Abhängigkeiten installieren
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

# Dev-Server (Port 3001, passend zum Vite-Proxy des Frontends)
.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 3001 --reload
```

- API: `http://localhost:3001/api/...`
- OpenAPI-Doku: `http://localhost:3001/docs`

Es gibt noch kein Test-Setup. Beim Hinzufügen von Tests neue Dev-Abhängigkeiten in
`requirements.txt` ergänzen.

## Architektur & Konventionen

- **Port 3001 ist fest** verdrahtet: das Frontend (`frontend/vite.config.ts`) proxyt
  `/api` auf `localhost:3001`, und `frontend/src/lib/api.ts` leitet in Codespaces den
  Backend-Host aus dem `-3001`-Suffix ab. Bei Portwechsel beide Seiten anpassen.
- **Alle Endpoints unter `/api/...`** — das Frontend ruft konsequent diesen Prefix auf.
- **CORS steht auf `*`** (`app/main.py`), weil die SPA das Backend im Proxy-/Codespaces-
  Betrieb cross-origin aufruft. Bewusst offen für den Prototyp.
- OpenAPI-Schema wird automatisch aus den Python-Typannotationen generiert — Endpoints
  sauber typisieren (Pydantic-Modelle), statt Schemas von Hand zu pflegen.
- Geplant: SQLite via SQLAlchemy, Migrationen über Alembic. Doppelbuchungen (QS-2) sollen
  über DB-seitige Unique-Constraints + Transaktionen verhindert werden — siehe ADR-0001.

## Projekt-Regeln (gelten repo-weit, auch hier)

- **Conventional Commits** verwenden.
- **Ubiquitous Language**: Begriffe aus `docs/produkt/glossar.md` einhalten.
- Bei Unklarheiten zuerst die Doku unter `docs/` konsultieren (Arc42, ADRs, Backlog).
