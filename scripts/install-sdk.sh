#!/usr/bin/env bash
set -euo pipefail

# Requires Python 3.10+
PYTHON_VERSION=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
sudo apt install -y "python${PYTHON_VERSION}-venv"

python3 -m venv backend/.venv

source backend/.venv/bin/activate

pip install --upgrade pip

pip install \
  fastapi \
  "uvicorn[standard]" \
  sqlalchemy \
  alembic \
  pydantic

echo "SDKs erfolgreich installiert in backend/.venv"
