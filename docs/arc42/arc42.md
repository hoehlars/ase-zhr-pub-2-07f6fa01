# Architekturdokumentation Calvin

---

## Einführung und Ziele

### Aufgabenstellung

Calvin ist INNOQs internes Raum- und Arbeitsplatzbuchungssystem zur Verwaltung von Ressourcen an 8 Bürostandorten (Monheim, Berlin, Hamburg, Köln, München, Zürich, Cham, Offenbach).

#### Treibende Kräfte

- INNOQ hat bisher kein dediziertes Buchungssystem
- Hybrides Arbeiten erfordert zuverlässige Arbeitsplatzkoordination
- Vermeidung von Ressourcenkonflikten und Doppelbuchungen

Für die vollständige Produktbeschreibung und Features siehe [Produktvision](../produkt/produktvision.md).

### Qualitätsziele

Die folgenden Qualitätsziele haben die höchste Priorität für die Architektur von Calvin. Die vollständigen Qualitätsszenarien sind in [Qualitätsanforderungen](../architektur/qualitätsanforderungen.md) dokumentiert.

| Priorität | Qualitätsziel | Szenario |
|-----------|---------------|----------|
| 1 | **Zuverlässigkeit** | Doppelbuchungen werden in 99 % der Fälle serverseitig verhindert, auch bei gleichzeitigen Buchungsversuchen innerhalb derselben Sekunde. |
| 2 | **Performance** | Suchergebnisse für verfügbare Räume werden innerhalb von 500 ms angezeigt, auch bei 150 gleichzeitigen Nutzern. |
| 3 | **Benutzbarkeit** | Neue Mitarbeiter können ohne Schulung ihre erste Buchung in maximal 3 Minuten abschließen. 80 % schaffen dies ohne Hilfe. |
| 4 | **Verfügbarkeit** | 98 % Verfügbarkeit während der Kernarbeitszeiten (8:00–18:00 Uhr). Bei Ausfall Wiederherstellung innerhalb von 30 Minuten. |

### Stakeholder

| Rolle | Erwartungshaltung |
|-------|-------------------|
| **INNOQ Mitarbeiter** | Einfache, schnelle Buchung von Räumen und Arbeitsplätzen. Übersicht wer im Büro sein wird. |
| **INNOQ Geschäftsführung** | Überblick über Büroauslastung als Basis für Standortstrategie (Büros verkleinern, schließen oder an anderen Standorten eröffnen). Hohe Mitarbeiterakzeptanz. |

---

## Kontextabgrenzung

### Überblick

Das Calvin-System ist INNOQs internes Raum- und Arbeitsplatzbuchungssystem. Das System operiert in einem minimalen Systemkontext.

### Fachlicher Kontext

```plantuml
@startuml
actor "Consultant" as Consultant
actor "Geschäftsleitung" as GL

rectangle "Calvin" as Calvin

Consultant --> Calvin : Bucht Räume &\n Arbeitsplätze
GL --> Calvin : Sieht Reports
@enduml
```

---

## Bausteinsicht

### Ebene 1: Whitebox Gesamtsystem

Das Calvin-System besteht aus einer Single Page Application (SPA) und einem separaten Booking Service. Diese Architektur wurde für die Prototyping-Phase optimiert und ermöglicht eine klare Trennung zwischen Benutzeroberfläche und Geschäftslogik.

```plantuml
@startuml
!theme plain
skinparam componentStyle rectangle
skinparam backgroundColor white

actor "Consultant" as consultant
actor "Geschäftsleitung" as gl

package "Calvin System" {
    component "SPA\n(Single Page Application)" as spa
    component "Booking Service" as booking
}

consultant --> spa : Bucht Räume &\nArbeitsplätze
gl --> spa : Sieht Reports
spa --> booking : REST API\n(JSON)

@enduml
```

### Enthaltene Bausteine

| Baustein | Verantwortlichkeit | Quellcode |
|----------|-------------------|-----------|
| **SPA** | Benutzeroberfläche für Buchungen, Kalenderansichten und Reports | `frontend/` |
| **Booking Service** | Buchungslogik, Validierung, Konfliktprüfung, Auswertungsdaten | `backend/` |

### Schnittstelle: SPA → Booking Service

Die SPA kommuniziert mit dem Booking Service über eine REST API (JSON über HTTPS). Die API-Spezifikation wird als OpenAPI-Dokument im Backend gepflegt.

---

## Architekturentscheidungen

Architekturentscheidungen sind als Architecture Decision Records (ADR) dokumentiert. Die ADRs findest du unter `docs/arc42/adrs/`.

---

## Qualitätsanforderungen

Die vollständigen Qualitätsszenarien sind in der dedizierten Datei [Qualitätsanforderungen](../architektur/qualitätsanforderungen.md) dokumentiert.

---

## Glossar

Das Glossar findest du unter [/docs/produkt/glossar.md](/docs/produkt/glossar.md).
