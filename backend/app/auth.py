"""HTTP Basic Authentication ohne Passwortprüfung (ADR-0003).

Der Nutzername dient als eindeutiger Identifier für die Zuordnung von Buchungen.
Ein Passwort wird **nicht** geprüft. Fehlt der Authorization-Header, antwortet
der Service mit 401 und fordert Basic-Auth an.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials

security = HTTPBasic(auto_error=False)


def current_user(
    credentials: Annotated[HTTPBasicCredentials | None, Depends(security)],
) -> str:
    """Liefert den Nutzernamen aus dem Basic-Auth-Header (kein Passwortcheck)."""
    if credentials is None or not credentials.username.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentifizierung erforderlich",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username


CurrentUser = Annotated[str, Depends(current_user)]
