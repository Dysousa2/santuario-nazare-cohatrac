# Dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Sistema básico
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl && \
    rm -rf /var/lib/apt/lists/*

# Instala Poetry (global) e desativa venv
RUN pip install --no-cache-dir poetry
RUN poetry config virtualenvs.create false

# Copia manifestos do Poetry primeiro (cache)
COPY pyproject.toml poetry.lock* /app/

# Instala somente deps de produção
RUN poetry install --only main --no-interaction --no-ansi --no-root

# Copia o projeto
COPY . /app

# Coleta estáticos na imagem (gera /app/staticfiles)
RUN python manage.py collectstatic --noinput

# Porta padrão (Fly usa PORT, mas definimos fallback)
ENV PORT=8080

# Comando de execução (escuta 0.0.0.0:$PORT)
CMD ["gunicorn", "--bind", ":8000", "--workers", "2", "core.wsgi"]
