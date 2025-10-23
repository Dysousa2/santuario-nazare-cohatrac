# Dockerfile
ARG PYTHON_VERSION=3.12-slim-bullseye
FROM python:${PYTHON_VERSION}

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080

# deps nativas
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /code

# deps Python
COPY requirements.txt /tmp/requirements.txt
RUN pip install --upgrade pip \
 && pip install --no-cache-dir -r /tmp/requirements.txt

# código
COPY . /code

# coletar estáticos (certifique-se de ter STATIC_ROOT nas settings)
RUN python manage.py collectstatic --noinput

# (EXPOSE é informativo; o Fly usa [http_service].internal_port)
EXPOSE 8080

# gunicorn usando a porta do ambiente
CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:${PORT}", "--workers", "3", "--threads", "2", "--timeout", "120", "--log-file", "-"]
