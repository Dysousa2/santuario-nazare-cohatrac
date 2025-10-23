# Dockerfile
FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Dependências do sistema (opcional: ajustar conforme precisar)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Requisitos Python
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Código
COPY . .

# Variáveis necessárias no build para collectstatic (não vazar credenciais!)
# O collectstatic só precisa do settings e do DEBUG=False para produzir os arquivos;
# As chaves sensíveis virão como secrets de runtime no Fly, não no build.
ENV DJANGO_SETTINGS_MODULE=core.settings \
    DEBUG=False

# Coleta os estáticos (WhiteNoise vai servir)
RUN python manage.py collectstatic --noinput

# Porta padrão de apps no Fly
ENV PORT=8080

# Comando de entrada
CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8080", "--log-file", "-"]