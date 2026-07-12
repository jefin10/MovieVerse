"""Liveness/readiness probe."""
from flask import Blueprint, jsonify

from services.model_loader import models_ready

health_bp = Blueprint("health", __name__)


@health_bp.get("/health")
def health():
    return jsonify({"status": "ok", "models_loaded": models_ready()})
