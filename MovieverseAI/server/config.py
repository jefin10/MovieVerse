"""Runtime configuration loaded from environment variables."""
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
# Trained artifacts live in MovieverseAI/model (one level up from server/).
MODEL_DIR = Path(os.getenv("MODEL_DIR", BASE_DIR.parent / "model"))


class Config:
    DEBUG = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    PORT = int(os.getenv("PORT", "5001"))
    CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",") if o.strip()]
    MODEL_DIR = MODEL_DIR
    # Shared secret so only the Node backend may call this service.
    SERVICE_TOKEN = os.getenv("AI_SERVICE_TOKEN", "")
