"""Lazy, cached loading of trained model artifacts."""
import functools
from pathlib import Path

import joblib

from config import Config


@functools.lru_cache(maxsize=1)
def _load():
    model_dir: Path = Config.MODEL_DIR
    artifacts = {}
    try:
        artifacts["mood_model"] = joblib.load(model_dir / "mood_genre_model.pkl")
        artifacts["vectorizer"] = joblib.load(model_dir / "vectorizer.pkl")
    except Exception as exc:  # noqa: BLE001
        print(f"[ai] mood model not loaded: {exc}")
    return artifacts


def get_mood_model():
    return _load().get("mood_model"), _load().get("vectorizer")


def models_ready() -> bool:
    model, vectorizer = get_mood_model()
    return model is not None and vectorizer is not None
