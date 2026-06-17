# ADR-0001: Technologie-Stack für den Booking Service

**Status**: Akzeptiert

## Kontext

Der Booking Service wird als eigenständiger Service aus der SPA ausgelagert (siehe ADR-001). Für die Implementierung muss ein Technologie-Stack gewählt werden, der folgende Anforderungen erfüllt:

- REST API mit OpenAPI-Spezifikation
- Dateibasierte Datenbank (SQLite) für einfachen Betrieb ohne separaten DB-Server
- Schnelle Entwicklung
- Serverseitige Transaktionen zur Verhinderung von Doppelbuchungen (QS-2)

## Entscheidung

Wir verwenden **FastAPI (Python)** mit **SQLite** als Datenbankbackend.

- **Framework**: FastAPI
- **ORM / DB-Zugriff**: SQLAlchemy
- **Migrationen**: Alembic
- **Datenbank**: SQLite

## Betrachtete Alternativen

| Option | REST | Dateibasierte DB | Entwicklungsgeschwindigkeit |
|--------|------|------------------|-----------------------------|
| Spring Boot + Kotlin | Spring MVC / springdoc | H2, SQLite via JDBC | Mittel (JVM, mehr Setup) |
| Quarkus + Kotlin | JAX-RS / integriertes OpenAPI | H2, SQLite via JDBC | Mittel (besseres Hot-Reload) |
| **FastAPI + Python** | **FastAPI (nativ)** | **SQLite via SQLAlchemy** | **Hoch** |

## Begründung

- **Schnelle Entwicklung**: FastAPI erfordert minimalen Boilerplate-Code; das OpenAPI-Schema wird automatisch aus den Python-Typannotationen generiert.
- **SQLite-Kompatibilität**: SQLAlchemy unterstützt SQLite erstklassig; kein separater Datenbankserver erforderlich, was Betrieb und lokale Entwicklung vereinfacht.
- **Doppelbuchungen (QS-2)**: SQLAlchemy-Transaktionen und DB-seitige Unique-Constraints ermöglichen zuverlässige Konflikterkennung.
- **Performance (QS-1)**: FastAPI ist eines der schnellsten Python-Webframeworks (basiert auf Starlette/ASGI) und erfüllt die 500-ms-Anforderung bei 150 gleichzeitigen Nutzern.

## Konsequenzen

- H2 ist als Datenbank nicht verfügbar (JVM-spezifisch); SQLite übernimmt diese Rolle vollständig.
- Das Team benötigt Python-Kenntnisse.
- Bei zukünftig deutlich höherer Last ist eine Migration zu einer vollwertigen relationalen Datenbank (z. B. PostgreSQL) über Alembic ohne Framework-Wechsel möglich.
