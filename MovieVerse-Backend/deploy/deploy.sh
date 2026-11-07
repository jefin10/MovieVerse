#!/usr/bin/env bash
# Builds the API and AI images here and runs them on the server.
#
#   deploy/deploy.sh ec2-user@1.2.3.4 path/to/key.pem            # deploy
#   deploy/deploy.sh ec2-user@1.2.3.4 path/to/key.pem --ingest   # and load the catalog
#
# Needs Docker with the compose plugin on the server. Run this against a server
# already running MovieVerse only after checking it is not using port 8080 or a
# compose project of the same name: this does not migrate an old setup's data.
set -euo pipefail

HOST="${1:?usage: deploy.sh user@host key.pem [--ingest]}"
KEY="${2:?usage: deploy.sh user@host key.pem [--ingest]}"
INGEST="${3:-}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SSH=(ssh -i "$KEY" -o BatchMode=yes "$HOST")

echo "› Building images"
docker build --platform linux/amd64 -t movieverse-backend:latest "$ROOT"
docker build --platform linux/amd64 -t movieverse-ai:latest "$ROOT/../MovieverseAI/server"

echo "› Copying images to $HOST"
docker save movieverse-backend:latest movieverse-ai:latest | gzip -1 | "${SSH[@]}" 'gunzip | docker load'

echo "› Copying compose file and AI model"
"${SSH[@]}" 'mkdir -p ~/movieverse/model'
scp -i "$KEY" -o BatchMode=yes "$ROOT/deploy/docker-compose.prod.yml" "$HOST:movieverse/docker-compose.yml"
scp -i "$KEY" -o BatchMode=yes "$ROOT"/../MovieverseAI/model/* "$HOST:movieverse/model/"

echo "› Writing settings (first deploy only)"
scp -i "$KEY" -o BatchMode=yes "$ROOT/deploy/env.production.example" "$HOST:movieverse/env.production.example"
"${SSH[@]}" 'cd ~/movieverse && [ -f .env ] || {
  umask 077
  sed -e "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$(openssl rand -hex 24)/" \
      -e "s/^JWT_SECRET=.*/JWT_SECRET=$(openssl rand -hex 32)/" \
      -e "s/^COOKIE_SECRET=.*/COOKIE_SECRET=$(openssl rand -hex 32)/" \
      -e "s/^AI_SERVICE_TOKEN=.*/AI_SERVICE_TOKEN=$(openssl rand -hex 32)/" \
      env.production.example > .env
}'

echo "› Starting"
"${SSH[@]}" 'cd ~/movieverse && docker compose up -d --remove-orphans && docker image prune -f >/dev/null'

echo "› Checking"
for _ in $(seq 1 45); do
  if "${SSH[@]}" 'curl -fsS localhost:8080/health' >/dev/null 2>&1; then
    echo "✓ API is up on $HOST"
    if [ "$INGEST" = "--ingest" ]; then
      "${SSH[@]}" 'cd ~/movieverse && docker compose exec -T backend npm run --silent db:ingest:prod'
    fi
    exit 0
  fi
  sleep 2
done
echo "✗ Not up yet. Logs:"
"${SSH[@]}" 'cd ~/movieverse && docker compose ps && docker compose logs --tail 40 backend'
exit 1
