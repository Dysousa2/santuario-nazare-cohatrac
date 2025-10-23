# Dockerfile
ARG PYTHON_VERSION=3.12-slim-bullseye
FROM python:${PYTHON_VERSION}

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    POETRY_VERSION=1.8.3 \
    POETRY_VIRTUALENVS_CREATE=false \
    PORT=8080

# deps do sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc curl \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /code

# Instala Poetry
RUN pip install --no-cache-dir "poetry==$POETRY_VERSION"

# Copia configs do Poetry primeiro para aproveitar cache
COPY pyproject.toml poetry.lock* /code/

# Instala dependências (sem criar venv, por causa do POETRY_VIRTUALENVS_CREATE=false)
RUN poetry install --no-interaction --no-ansi --only main

# Copia o restante do projeto
COPY . /code

# Coleta estáticos (precisa STATIC_ROOT nas settings)
RUN python manage.py collectstatic --noinput

# Porta informativa (Fly usa internal_port do fly.toml)
EXPOSE 8080

# Sobe gunicorn
CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:${PORT}", "--workers", "3", "--threads", "2", "--timeout", "120", "--log-file", "-"]
