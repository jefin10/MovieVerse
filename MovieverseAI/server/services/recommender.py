"""Stateless signature-based ranking.

`candidates` is the movie pool supplied by the Node backend, each item:
  {id, title, genres:[str], director, star1, star2, imdb_rating, our_rating, popularity}
Returns: [{id, score}] sorted desc. Porting target for the old _score_candidate.
"""
from typing import Any


def _signature(movie: dict[str, Any]) -> dict[str, Any]:
    return {
        "genres": {g.lower().strip() for g in movie.get("genres", []) if g},
        "director": (movie.get("director") or "").lower().strip(),
        "stars": {(movie.get("star1") or "").lower().strip(),
                  (movie.get("star2") or "").lower().strip()} - {""},
        "imdb_rating": float(movie.get("imdb_rating") or 0),
    }


def _score(candidate, liked_sigs, disliked_sigs, movie) -> float:
    liked = 0.0
    for s in liked_sigs:
        cur = 0.0
        if s["genres"] and candidate["genres"]:
            cur += 2.0 * (len(s["genres"] & candidate["genres"]) / max(1, len(s["genres"])))
        if s["director"] and s["director"] == candidate["director"]:
            cur += 1.2
        if s["stars"] and candidate["stars"]:
            cur += 0.7 * len(s["stars"] & candidate["stars"])
        cur += 0.6 * (1 - min(abs(s["imdb_rating"] - candidate["imdb_rating"]) / 10.0, 1.0))
        liked = max(liked, cur)
    quality = 0.25 * float(movie.get("our_rating") or 0) + 0.08 * candidate["imdb_rating"]
    return liked + quality


def rank_candidates(liked, disliked, candidates, limit=10):
    liked_sigs = [_signature(m) for m in candidates if m.get("title") in liked]
    disliked_sigs = [_signature(m) for m in candidates if m.get("title") in disliked]
    scored = [{"id": m["id"], "score": _score(_signature(m), liked_sigs, disliked_sigs, m)}
              for m in candidates]
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:limit]
