# Backend-Image für den Calvin Booking Service (FastAPI + SQLAlchemy + SQLite).
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    # SQLite-Datei in ein beschreibbares Verzeichnis legen (siehe VOLUME unten).
    DATABASE_URL=sqlite:////data/calvin.db

WORKDIR /app

# Abhängigkeiten zuerst installieren – eigener Layer für besseres Build-Caching.
COPY requirements.txt ./
RUN pip install -r requirements.txt

# Anwendungscode.
COPY app ./app

# Nicht als root laufen; /data für die SQLite-Datei beschreibbar machen.
RUN useradd --create-home --uid 1000 appuser \
    && mkdir -p /data \
    && chown -R appuser:appuser /data
USER appuser
VOLUME ["/data"]

# Port 3001 ist projektweit fest verdrahtet (Frontend-Proxy, siehe backend/CLAUDE.md).
EXPOSE 3001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3001"]
