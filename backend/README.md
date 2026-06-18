# Booking Service

Backend für Calvin gemäß [ADR-0001](../docs/architektur/adrs/ADR-0001-technologie-stack-fuer-booking-service.md):
**FastAPI** (Python) mit **SQLAlchemy** und **SQLite**.

Der Service verwaltet **Raumbuchungen** und **Verfügbarkeit**. Ressourcedaten
(Standorte, Räume, Ausstattung) liegen gemäß
[ADR-0002](../docs/architektur/adrs/ADR-0002-ressourcedaten-als-mock-daten-in-der-spa.md)
in der SPA; der Service arbeitet ausschließlich mit IDs. Die Authentifizierung
erfolgt über HTTP Basic ohne Passwort
([ADR-0003](../docs/architektur/adrs/ADR-0003-basic-auth-ohne-passwort-fuer-prototyp.md)):
Der Nutzername ist der Identifier.

## Entwicklung

```bash
# Virtuelle Umgebung anlegen und Abhängigkeiten installieren
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

# Dev-Server starten (Port 3001, passend zum Vite-Proxy im Frontend)
.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 3001 --reload
```

Die automatische OpenAPI-Doku ist unter `http://localhost:3001/docs` erreichbar.
Beim Start wird das SQLite-Schema angelegt und mit Demodaten geseedet (gespiegelt
aus `frontend/src/lib/mock-data.ts`, Demo-Nutzer `calvin`).

## API-Überblick

| Methode & Pfad | Zweck | Stories |
|----------------|-------|---------|
| `GET /api/hello` | Health-/Verbindungscheck | – |
| `GET /api/verfuegbarkeit?raumId&datum&von&bis` | Verfügbarkeit prüfen (+ Alternativen) | CLVN-010, 012 |
| `GET /api/raeume/{raumId}/belegungen?datum` | Belegte Zeitfenster eines Raums | CLVN-011 |
| `POST /api/buchungen` | Buchung absenden (verhindert Doppelbuchung) | CLVN-017/018/019/020 |
| `GET /api/buchungen` | Eigene Buchungsübersicht | CLVN-022/023 |
| `GET /api/buchungen/{id}` | Buchungsdetails | CLVN-024 |
| `GET /api/buchungen/{id}/export.ics` | Export als iCalendar | CLVN-025 |
| `PATCH /api/buchungen/{id}` | Buchung ändern (Verfügbarkeit neu geprüft) | CLVN-027 |
| `DELETE /api/buchungen/{id}` | Buchung stornieren | CLVN-026 |

Alle `/api/buchungen`-Endpoints erfordern Basic-Auth (`-u nutzername:`).

## Tests

End-to-End-Tests laufen über `TestClient` gegen die echte App (Routing, Auth,
SQLite, Transaktionen). Jede Story hat eine eigene Testdatei
(`tests/test_clvn_XXX_*.py`), die ihre Akzeptanzkriterien abdeckt.

```bash
.venv/bin/python -m pytest
```

## Nicht im Backend-Scope

Die Filter-Stories CLVN-004 (Kapazität), CLVN-005 (Ausstattung filtern) und
CLVN-013 (Ausstattung abgleichen) beruhen auf Ressourcedetails, die gemäß
ADR-0002 in der SPA liegen. Der Booking Service kennt diese Daten nicht; diese
Kriterien werden im Frontend umgesetzt und getestet.
