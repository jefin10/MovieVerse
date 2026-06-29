"""Mood -> genre prediction.

Node sends the user's mood text; the service returns the predicted genre.
The Node backend resolves the genre to movies in the database.
"""
from flask import Blueprint, jsonify, request

from services.mood_classifier import predict_genre

mood_bp = Blueprint("mood", __name__)


@mood_bp.post("/mood")
def mood():
    payload = request.get_json(silent=True) or {}
    text = (payload.get("mood") or "").strip()
    if not text:
        return jsonify({"error": "Mood is required"}), 400

    genre = predict_genre(text)
    return jsonify({"genre": genre})
