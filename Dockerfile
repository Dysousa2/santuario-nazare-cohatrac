# Dockerfile — Django + Poetry + Fly.io
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PATH="/root/.local/bin:$PATH"

# Instalar dependências de sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev curl \
 && rm -rf /var/lib/apt/lists/*

# Instalar Poetry
RUN curl -sSL https://install.python-poetry.org | python3 -

WORKDIR /app

# Copiar configs do Poetry
COPY pyproject.toml poetry.lock* /app/

# Instalar dependências (sem virtualenv)
RUN poetry config virtualenvs.create false && poetry install --no-root --no-interaction --no-ansi

# Copiar o restante do projeto
COPY . /app/

# Expor porta
EXPOSE 8080

# Comando final
CMD ["gunicorn", "--bind", ":8000", "--workers", "2", "core.wsgi"]