# MovieverseAI — Flask AI service

Small stateless ML microservice. The Node backend (`MovieVerse-Backend`) owns
the database; this service only does ML: mood→genre prediction and content-based
ranking using the trained artifacts in `../model`.

## Endpoints
- `GET  /health` — liveness + whether model artifacts loaded
- `POST /mood` — body `{ "mood": "..." }` → `{ "genre": "..." }`
- `POST /recommend` — body `{ liked[], disliked[], candidates[], limit }` → `{ recommendations:[{id,score}] }`

## Run locally
```bash
cd server
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python wsgi.py
```

## Docker
```bash
docker build -t movieverse-ai ./server
docker run -p 5001:5001 -v "%cd%/model:/model" -e MODEL_DIR=/model movieverse-ai
```

Training scripts (`mood.py`, `Movierecom.py`) stay at the repo root and produce
the `.pkl` files under `model/`.
