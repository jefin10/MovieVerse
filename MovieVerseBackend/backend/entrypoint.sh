#!/bin/sh
set -e

echo "Waiting for database..."
python manage.py migrate --noinput

echo "Starting Django server..."
python manage.py runserver 0.0.0.0:8000
