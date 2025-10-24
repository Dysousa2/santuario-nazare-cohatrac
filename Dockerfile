
FROM python:3.10

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# System deps
RUN apt-get update && apt-get install -y \
    libpq-dev gcc curl build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
ENV POETRY_VERSION=1.8.3
RUN curl -sSL https://install.python-poetry.org | python3 - && \
    ln -s /root/.local/bin/poetry /usr/local/bin/poetry

# App directory
WORKDIR /code

# Copy project configs first for caching
COPY pyproject.toml poetry.lock* /code/

# Install dependencies via poetry
RUN poetry config virtualenvs.create false && poetry install --no-interaction --no-ansi

# Copy the rest do projeto
COPY . /code/

# Collect static files for production
RUN python manage.py collectstatic --no-input

EXPOSE 8000

CMD ["gunicorn", "--bind", ":8000", "--workers=2", "core.wsgi"]
