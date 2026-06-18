"""Integrationstest der **API-Schicht** als Ganzes.

Im Gegensatz zu den story-spezifischen Testdateien (``test_clvn_XXX_*.py``), die
jeweils ein Akzeptanzkriterium prüfen, betrachtet dieser Test die API-Schicht
*integriert*: Mehrere Endpoints greifen über den echten HTTP-Stack (Routing,
Auth, Pydantic-Validierung, Services, SQLite-Transaktionen) ineinander.

Geprüft werden die schichtübergreifenden Eigenschaften der API:
- der vollständige Buchungs-Lebenszyklus über alle Endpoints hinweg
  (anlegen → auflisten → Details → ändern → exportieren → stornieren),
- die Konsistenz zwischen Schreib- (POST/PATCH/DELETE) und Lese-Endpoints
  (GET ``/verfuegbarkeit``, GET ``/buchungen``),
- die durchgängige Authentifizierung (ADR-0003) und Nutzer-Isolation,
- der camelCase-JSON-Vertrag (ADR/CLAUDE.md) der Antworten,
- das Mapping von Fehlerfällen auf HTTP-Statuscodes (401/404/409/422).
"""

from __future__ import annotations

from conftest import auth, neue_buchung

RAUM = "integration-raum"
NUTZER = "integration-user"


def test_voller_buchungs_lebenszyklus_ueber_alle_endpoints(client):
    """Ein Datensatz wandert konsistent durch alle CRUD-Endpoints."""
    # 1. Anlegen (POST) – Verfügbarkeitsendpoint meldet danach "belegt".
    frei_vorher = client.get(
        "/api/verfuegbarkeit",
        params={"raumId": RAUM, "datum": "2030-06-17", "von": "09:00", "bis": "10:00"},
    ).json()
    assert frei_vorher["verfuegbar"] is True

    erstellt = client.post(
        "/api/buchungen", json=neue_buchung(raumId=RAUM), auth=auth(NUTZER)
    )
    assert erstellt.status_code == 201
    buchung_id = erstellt.json()["id"]

    belegt = client.get(
        "/api/verfuegbarkeit",
        params={"raumId": RAUM, "datum": "2030-06-17", "von": "09:00", "bis": "10:00"},
    ).json()
    assert belegt["verfuegbar"] is False

    # 2. Auflisten (GET-Collection) – die Buchung taucht beim Nutzer auf.
    liste = client.get("/api/buchungen", auth=auth(NUTZER)).json()
    assert buchung_id in [b["id"] for b in liste]

    # 3. Details (GET-Item) – einzelne Buchung abrufbar.
    detail = client.get(f"/api/buchungen/{buchung_id}", auth=auth(NUTZER))
    assert detail.status_code == 200
    assert detail.json()["titel"] == "Test-Meeting"

    # 4. Ändern (PATCH) – die Änderung wird über Lese-Endpoints sichtbar.
    geaendert = client.patch(
        f"/api/buchungen/{buchung_id}",
        json={"titel": "Umbenannt", "bis": "11:00"},
        auth=auth(NUTZER),
    )
    assert geaendert.status_code == 200
    nach_aenderung = client.get(
        f"/api/buchungen/{buchung_id}", auth=auth(NUTZER)
    ).json()
    assert nach_aenderung["titel"] == "Umbenannt"
    assert nach_aenderung["bis"] == "11:00"

    # 5. Exportieren (GET .ics) – iCalendar mit der aktualisierten Buchung.
    export = client.get(f"/api/buchungen/{buchung_id}/export.ics", auth=auth(NUTZER))
    assert export.status_code == 200
    assert export.headers["content-type"].startswith("text/calendar")
    assert "BEGIN:VCALENDAR" in export.text
    assert "SUMMARY:Umbenannt" in export.text

    # 6. Stornieren (DELETE) – Raum wird wieder frei, Buchung verlässt die Liste.
    storno = client.delete(f"/api/buchungen/{buchung_id}", auth=auth(NUTZER))
    assert storno.status_code == 200
    assert storno.json()["status"] == "storniert"

    wieder_frei = client.get(
        "/api/verfuegbarkeit",
        params={"raumId": RAUM, "datum": "2030-06-17", "von": "09:00", "bis": "11:00"},
    ).json()
    assert wieder_frei["verfuegbar"] is True
    aktive_ids = [
        b["id"] for b in client.get("/api/buchungen", auth=auth(NUTZER)).json()
    ]
    assert buchung_id not in aktive_ids


def test_geschuetzte_endpoints_erfordern_authentifizierung(client):
    """Ohne Basic-Auth antwortet jeder ``/api/buchungen``-Endpoint mit 401."""
    # Erst mit Auth eine Buchung anlegen, um eine echte ID zu haben.
    buchung_id = client.post(
        "/api/buchungen", json=neue_buchung(raumId=RAUM), auth=auth(NUTZER)
    ).json()["id"]

    ohne_auth = [
        client.post("/api/buchungen", json=neue_buchung(raumId="x-raum")),
        client.get("/api/buchungen"),
        client.get(f"/api/buchungen/{buchung_id}"),
        client.get(f"/api/buchungen/{buchung_id}/export.ics"),
        client.patch(f"/api/buchungen/{buchung_id}", json={"titel": "X"}),
        client.delete(f"/api/buchungen/{buchung_id}"),
    ]
    assert [r.status_code for r in ohne_auth] == [401, 401, 401, 401, 401, 401]


def test_buchungen_sind_pro_nutzer_isoliert(client):
    """Nutzer A sieht/ändert Nutzer B's Buchungen nicht (Nutzer-Isolation)."""
    fremde_id = client.post(
        "/api/buchungen", json=neue_buchung(raumId=RAUM), auth=auth("nutzer-b")
    ).json()["id"]

    # Nutzer A: in der eigenen Übersicht taucht die fremde Buchung nicht auf.
    a_liste = client.get("/api/buchungen", auth=auth("nutzer-a")).json()
    assert fremde_id not in [b["id"] for b in a_liste]

    # Zugriff auf die fremde Buchung ist für A nicht möglich (404, nicht 403,
    # weil die Buchung für A schlicht nicht existiert).
    assert (
        client.get(f"/api/buchungen/{fremde_id}", auth=auth("nutzer-a")).status_code
        == 404
    )
    assert (
        client.delete(f"/api/buchungen/{fremde_id}", auth=auth("nutzer-a")).status_code
        == 404
    )
    assert (
        client.patch(
            f"/api/buchungen/{fremde_id}",
            json={"titel": "Hijack"},
            auth=auth("nutzer-a"),
        ).status_code
        == 404
    )

    # Der Eigentümer hat weiterhin Zugriff – die Buchung wurde nicht verändert.
    assert (
        client.get(f"/api/buchungen/{fremde_id}", auth=auth("nutzer-b")).status_code
        == 200
    )


def test_antworten_folgen_dem_camelcase_vertrag(client):
    """Die JSON-Antworten verwenden camelCase-Schlüssel (SPA-Vertrag)."""
    body = client.post(
        "/api/buchungen", json=neue_buchung(raumId=RAUM), auth=auth(NUTZER)
    ).json()

    # camelCase ist vorhanden …
    assert {"raumId", "standortId", "dauerMinuten"} <= body.keys()
    # … und die internen snake_case-Namen tauchen nicht im Vertrag auf.
    assert not {"raum_id", "standort_id", "dauer_minuten"} & body.keys()
    # Abgeleitetes Feld wird korrekt berechnet (09:00–10:00 = 60 Minuten).
    assert body["dauerMinuten"] == 60


def test_fehlerfaelle_werden_auf_http_statuscodes_abgebildet(client):
    """Service-Fehler erscheinen an der API als passende HTTP-Codes."""
    client.post("/api/buchungen", json=neue_buchung(raumId=RAUM), auth=auth(NUTZER))

    # 409: überschneidende Buchung eines anderen Nutzers (Doppelbuchung, QS-2).
    konflikt = client.post(
        "/api/buchungen",
        json=neue_buchung(raumId=RAUM, von="09:30", bis="10:30"),
        auth=auth("anderer"),
    )
    assert konflikt.status_code == 409
    assert konflikt.json()["detail"]

    # 422: Pydantic-Validierung greift, bevor die Fachlogik läuft (leerer Titel).
    ungueltig = client.post(
        "/api/buchungen",
        json=neue_buchung(raumId=RAUM, datum="2030-07-01", titel="   "),
        auth=auth(NUTZER),
    )
    assert ungueltig.status_code == 422

    # 404: unbekannte Buchung.
    assert client.get("/api/buchungen/gibtsnicht", auth=auth(NUTZER)).status_code == 404
