#!/bin/sh
set -e

echo "Waiting for database..."
python manage.py migrate --noinput

echo "Starting Gunicorn server..."
exec gunicorn backend.wsgi:application \
	--bind 0.0.0.0:8000 \
	--workers "${GUNICORN_WORKERS:-3}" \
	--threads "${GUNICORN_THREADS:-2}" \
	--timeout "${GUNICORN_TIMEOUT:-120}" \
	--access-logfile - \
	--error-logfile -
