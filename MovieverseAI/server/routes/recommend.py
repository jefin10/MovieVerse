"""Content-based recommendations.

Node sends liked/disliked titles plus a candidate movie pool (so the AI
service stays stateless and database-free). The service returns ranked ids.
"""
from flask import Blueprint, jsonify, request

from services.recommender import rank_candidates

recommend_bp = Blueprint("recommend", __name__)


@recommend_bp.post("/recommend")
def recommend():
    payload = request.get_json(silent=True) or {}
    liked = payload.get("liked", [])
    disliked = payload.get("disliked", [])
    candidates = payload.get("candidates", [])
    limit = int(payload.get("limit", 10))

    if not isinstance(liked, list) or not liked:
        return jsonify({"error": "liked must be a non-empty list"}), 400

    ranked = rank_candidates(liked, disliked, candidates, limit)
    return jsonify({"recommendations": ranked})
