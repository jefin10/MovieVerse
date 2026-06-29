# syntax = docker/dockerfile:1
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=5001

WORKDIR /app

# System deps kept minimal; scikit-learn wheels ship prebuilt for slim images
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5001

# Model artifacts are mounted/copied under ./model
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "--workers", "2", "--threads", "2", "--timeout", "120", "wsgi:app"]
