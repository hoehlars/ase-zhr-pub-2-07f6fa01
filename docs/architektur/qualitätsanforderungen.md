# Qualitätsanforderungen Calvin

Diese Seite beschreibt die wesentlichen Qualitätsmerkmale des Calvin-Systems in Form von Qualitätsszenarien. Die übergeordneten Qualitätsziele sind im [arc42-Dokument](../arc42/arc42.md#qualitätsziele) beschrieben.

---

## Qualitätsbaum

| Priorität | ID | Qualitätsmerkmal | Szenario |
|-----------|-----|-----------------|----------|
| 1 | QS-2 | Zuverlässigkeit | Doppelbuchungen serverseitig verhindern – kritisch, Kernfeature |
| 2 | QS-1 | Performance | Suchantwort unter 500 ms bei 150 gleichzeitigen Nutzern |
| 3 | QS-5 | Benutzbarkeit | Erste Buchung ohne Schulung in max. 5 Minuten |
| 4 | QS-3 | Verfügbarkeit | 98 % Uptime in Kernarbeitszeiten, Wiederherstellung in 30 min |
| 5 | QS-4 | Erweiterbarkeit | Neuer Standort innerhalb eines Release-Zyklus integrierbar |

---

## Qualitätsszenarien

### QS-1: Performance bei der Raumsuche

**Qualitätsmerkmal**: Performance / Antwortzeit

**Szenario**:
Während der normalen Arbeitszeit sucht ein INNOQ-Mitarbeiter im Calvin-System nach verfügbaren Räumen an einem bestimmten Standort für einen ausgewählten Zeitraum. Die Suchergebnisliste mit allen verfügbaren Räumen wird innerhalb von 500 ms angezeigt, auch bei gleichzeitiger Nutzung durch bis zu 150 Mitarbeiter.

**Motivation**:
Die schnelle Anzeige von Suchergebnissen ist essentiell für die in der Produktvision versprochene „unkomplizierte unbürokratische leichte Buchung". Mitarbeiter, die nur einen Tag pro Woche im Büro sind, müssen ihre Buchungen schnell und effizient durchführen können.

---

### QS-2: Verhinderung von Doppelbuchungen

**Qualitätsmerkmal**: Zuverlässigkeit / Datenintegrität

**Szenario**:
In einer normalen Betriebssituation versuchen zwei INNOQ-Mitarbeiter gleichzeitig (innerhalb derselben Sekunde) denselben Raum für denselben Zeitraum zu buchen. Das System verarbeitet die erste vollständige Buchungsanfrage erfolgreich und lehnt die zweite Anfrage mit einer verständlichen Fehlermeldung ab. Doppelbuchungen werden in 99 % der Fälle serverseitig verhindert.

**Motivation**:
Die Verhinderung von Doppelbuchungen ist ein Kernfeature von Calvin und essentiell für das Nutzervertrauen. Das System muss die „Sicherheit, einen Konferenzraum wirklich verfügbar zu haben" garantieren.

---

### QS-3: Verfügbarkeit während der Arbeitszeiten

**Qualitätsmerkmal**: Verfügbarkeit

**Szenario**:
Während der typischen INNOQ-Arbeitszeiten (8:00–18:00 Uhr an Werktagen) ist das Calvin-System verfügbar und funktionsfähig. Das System erreicht eine Verfügbarkeit von 98 % während dieser Kernarbeitszeiten. Bei einem Ausfall ist das System innerhalb von 30 Minuten wieder betriebsbereit.

**Motivation**:
Obwohl Ausfälle durch alternative Kommunikationswege (z. B. interner Messenger) kurzfristig kompensiert werden können, muss Calvin während der Arbeitszeiten verlässlich verfügbar sein, um den Buchungsprozess nicht zu behindern.

---

### QS-4: Erweiterbarkeit um neue Standorte

**Qualitätsmerkmal**: Änderbarkeit / Erweiterbarkeit

**Szenario**:
Bei geplanter INNOQ-Expansion fügt ein Entwickler einen neuen Standort mit allen zugehörigen Räumen zum Calvin-System hinzu. Implementierung, Testing und Deployment der Änderung sind innerhalb eines Release-Zyklus (2 Wochen) abgeschlossen, ohne bestehende Funktionalität zu beeinträchtigen.

**Motivation**:
INNOQ betreibt aktuell 8 Standorte und könnte in Zukunft expandieren. Die Multi-Standort-Architektur muss flexibel genug sein, um neue Standorte mit vertretbarem Aufwand zu integrieren.

---

### QS-5: Intuitive Bedienbarkeit für neue Mitarbeiter

**Qualitätsmerkmal**: Benutzbarkeit / Erlernbarkeit

**Szenario**:
Ein neuer INNOQ-Mitarbeiter ohne vorherige Schulung nutzt Calvin zum ersten Mal, um einen Konferenzraum für den nächsten Tag zu buchen. Der Mitarbeiter findet intuitiv den richtigen Weg durch die Oberfläche und schließt die Buchung erfolgreich in maximal 3 Minuten ab. 80 % der neuen Mitarbeiter schaffen ihre erste Buchung ohne fremde Hilfe.

**Motivation**:
Die Produktvision betont „unkomplizierte unbürokratische leichte Buchung für jeden". Das System muss selbsterklärend sein. Eine niedrige Einstiegshürde fördert die angestrebte hohe Mitarbeiterakzeptanz.
