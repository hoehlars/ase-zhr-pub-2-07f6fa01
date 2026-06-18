# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Überblick

Booking Service für Calvin (Raumbuchungs-App von INNOQ). **FastAPI + SQLAlchemy + SQLite**
gemäß [ADR-0001](../docs/architektur/adrs/ADR-0001-technologie-stack-fuer-booking-service.md).

Aktueller Stand: Buchungs- und Verfügbarkeitslogik sind implementiert (SQLAlchemy +
SQLite). Endpoints liegen in `app/routers/` (`buchungen.py`, `verfuegbarkeit.py`),
Fachlogik in `app/services.py` + `app/domain.py`. Pro User Story existiert eine
E2E-Testdatei unter `tests/test_clvn_XXX_*.py`. Alembic ist als Abhängigkeit
vorhanden, aber noch ungenutzt (Schema via `Base.metadata.create_all` beim Start).

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

Tests (E2E gegen die echte App via `TestClient`):

```bash
.venv/bin/python -m pytest
```

Beim Hinzufügen neuer Dev-Abhängigkeiten diese in `requirements.txt` ergänzen.

## Architektur & Konventionen

- **Port 3001 ist fest** verdrahtet: das Frontend (`frontend/vite.config.ts`) proxyt
  `/api` auf `localhost:3001`, und `frontend/src/lib/api.ts` leitet in Codespaces den
  Backend-Host aus dem `-3001`-Suffix ab. Bei Portwechsel beide Seiten anpassen.
- **Alle Endpoints unter `/api/...`** — das Frontend ruft konsequent diesen Prefix auf.
- **CORS steht auf `*`** (`app/main.py`), weil die SPA das Backend im Proxy-/Codespaces-
  Betrieb cross-origin aufruft. Bewusst offen für den Prototyp.
- OpenAPI-Schema wird automatisch aus den Python-Typannotationen generiert — Endpoints
  sauber typisieren (Pydantic-Modelle), statt Schemas von Hand zu pflegen.
- **Nur IDs, keine Ressourcedetails** (ADR-0002): Buchungen referenzieren `raum_id`/
  `standort_id`; Anzeigenamen löst die SPA aus ihren Mock-Daten auf.
- **Basic-Auth ohne Passwort** (ADR-0003): `app/auth.py` liest den Nutzernamen als
  Identifier; `/api/buchungen`-Endpoints sind darüber dem Nutzer zugeordnet.
- **JSON in camelCase** (`raumId`, `standortId` …) passend zu den TS-Typen der SPA;
  Pydantic-Schemas (`app/schemas.py`) mappen auf internes `snake_case`.
- Doppelbuchungen (QS-2) werden in `app/services.py` über eine Konfliktprüfung in
  derselben Transaktion verhindert (SQLite serialisiert Schreibzugriffe) — siehe ADR-0001.
- SQLite via SQLAlchemy; Migrationen über Alembic sind vorgesehen, aktuell wird das
  Schema beim Start via `Base.metadata.create_all` angelegt.

## Projekt-Regeln (gelten repo-weit, auch hier)

- **Conventional Commits** verwenden.
- **Ubiquitous Language**: Begriffe aus `docs/produkt/glossar.md` einhalten.
- Bei Unklarheiten zuerst die Doku unter `docs/` konsultieren (Arc42, ADRs, Backlog).
