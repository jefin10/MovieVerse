import os
import random
import time

import joblib
import pandas as pd
from django.conf import settings
from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import Genre, Movie

# Load only mood model artifacts at startup; movie retrieval is DB-first.
MODEL_DIR = os.path.join(settings.BASE_DIR, 'ai', 'model')
model_path = os.path.join(MODEL_DIR, 'mood_genre_model.pkl')
vectorizer_path = os.path.join(MODEL_DIR, 'vectorizer.pkl')

model = joblib.load(model_path)
vectorizer = joblib.load(vectorizer_path)


def _serialize_movie(movie, similarity=None):
    poster_url = movie.poster_url or ""
    if poster_url and not (poster_url.startswith('http://') or poster_url.startswith('https://')):
        poster_url = f"https://image.tmdb.org/t/p/w500{poster_url}"

    payload = {
        'id': movie.id,
        'title': movie.title,
        'director': movie.director,
        'imdb_rating': float(movie.imdb_rating or 0),
        'poster_url': poster_url,
        'description': movie.description,
    }
    if similarity is not None:
        payload['similarity'] = float(similarity)
    return payload


def _movie_signature(movie):
    return {
        'genres': {genre.name.lower().strip() for genre in movie.genres.all() if genre.name},
        'director': (movie.director or '').lower().strip(),
        'stars': {
            (movie.star1 or '').lower().strip(),
            (movie.star2 or '').lower().strip(),
        } - {''},
        'imdb_rating': float(movie.imdb_rating or 0),
    }


def _score_candidate(candidate_sig, liked_sigs, disliked_sigs, movie):
    liked_score = 0.0
    for liked_sig in liked_sigs:
        current = 0.0
        if liked_sig['genres'] and candidate_sig['genres']:
            overlap = len(liked_sig['genres'] & candidate_sig['genres'])
            current += 2.0 * (overlap / max(1, len(liked_sig['genres'])))
        if liked_sig['director'] and liked_sig['director'] == candidate_sig['director']:
            current += 1.2
        if liked_sig['stars'] and candidate_sig['stars']:
            current += 0.7 * len(liked_sig['stars'] & candidate_sig['stars'])
        current += 0.6 * (1 - min(abs(liked_sig['imdb_rating'] - candidate_sig['imdb_rating']) / 10.0, 1.0))
        liked_score = max(liked_score, current)

    dislike_penalty = 0.0
    for disliked_sig in disliked_sigs:
        penalty = 0.0
        if disliked_sig['genres'] and candidate_sig['genres']:
            overlap = len(disliked_sig['genres'] & candidate_sig['genres'])
            penalty += 1.3 * (overlap / max(1, len(disliked_sig['genres'])))
        if disliked_sig['director'] and disliked_sig['director'] == candidate_sig['director']:
            penalty += 0.8
        if disliked_sig['stars'] and candidate_sig['stars']:
            penalty += 0.45 * len(disliked_sig['stars'] & candidate_sig['stars'])
        dislike_penalty = max(dislike_penalty, penalty)

    quality_boost = (
        0.25 * float(movie.our_rating or 0)
        + 0.08 * float(movie.imdb_rating or 0)
        + 0.0002 * float(movie.popularity or 0)
    )
    return liked_score - dislike_penalty + quality_boost


def build_recommendations_from_titles(liked_titles, disliked_titles=None, limit=10):
    disliked_titles = disliked_titles or []

    liked_titles = [title.strip() for title in liked_titles if isinstance(title, str) and title.strip()]
    disliked_titles = [title.strip() for title in disliked_titles if isinstance(title, str) and title.strip()]

    liked_movies = list(
        Movie.objects.filter(title__in=liked_titles)
        .prefetch_related('genres')
    )
    disliked_movies = list(
        Movie.objects.filter(title__in=disliked_titles)
        .prefetch_related('genres')
    )

    if not liked_movies:
        return []

    excluded_ids = {movie.id for movie in liked_movies + disliked_movies}
    candidates = list(
        Movie.objects.exclude(id__in=excluded_ids)
        .prefetch_related('genres')
        .order_by('-our_rating', '-imdb_rating', '-tmdb_vote_average', '-popularity')[:1500]
    )

    liked_sigs = [_movie_signature(movie) for movie in liked_movies]
    disliked_sigs = [_movie_signature(movie) for movie in disliked_movies]

    scored = []
    for movie in candidates:
        candidate_sig = _movie_signature(movie)
        score = _score_candidate(candidate_sig, liked_sigs, disliked_sigs, movie)
        scored.append((score, movie))

    scored.sort(key=lambda item: item[0], reverse=True)
    top_items = scored[:limit]
    return [_serialize_movie(movie, similarity=score) for score, movie in top_items]

@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def predict_genre_and_recommend(request):
    user_mood = request.data.get("mood")

    if not user_mood:
        return JsonResponse({"error": "Mood is required"}, status=400)
        
    # Add randomness with time-based seed
    random.seed(int(time.time()))

    mood_input = vectorizer.transform([user_mood])
    predicted_genre = model.predict(mood_input)[0]

    genre = Genre.objects.filter(name__iexact=predicted_genre).first()

    if genre:
        matching_movies = list(
            Movie.objects.filter(genres=genre)
            .prefetch_related('genres')
            .order_by('-our_rating', '-imdb_rating', '-popularity')[:200]
        )
    else:
        matching_movies = list(
            Movie.objects.filter(
                Q(description__icontains=predicted_genre) |
                Q(title__icontains=predicted_genre)
            )
            .prefetch_related('genres')
            .order_by('-our_rating', '-imdb_rating', '-popularity')[:200]
        )

    if len(matching_movies) >= 50:
        selected = random.sample(matching_movies, 50)
    else:
        selected = list(matching_movies)
        seen_ids = {movie.id for movie in selected}
        remaining = 50 - len(selected)
        if remaining > 0:
            fallback_pool = list(
                Movie.objects.exclude(id__in=seen_ids)
                .order_by('-our_rating', '-imdb_rating', '-popularity')[:400]
            )
            if fallback_pool:
                selected.extend(random.sample(fallback_pool, min(remaining, len(fallback_pool))))

    movies = [_serialize_movie(movie) for movie in selected[:50]]

    return JsonResponse({
        "genre": predicted_genre,
        "recommendations": movies
    })

@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def get_recommendations(request):
    data = request.data
    liked = data.get('liked', [])
    disliked = data.get('disliked', [])

    if not isinstance(liked, list) or not liked:
        return Response({"error": "Liked list must be a non-empty list"}, status=400)

    recommendations = build_recommendations_from_titles(liked, disliked, limit=10)
    if not recommendations:
        return Response({"error": "None of the liked movies were found in the live database"}, status=400)

    return Response(recommendations)


@csrf_exempt
def import_movies_from_csv(request):
    """One-time function to import movies from CSV file"""
    if request.method != 'POST':
        return JsonResponse({"error": "Only POST method allowed"}, status=405)
    
    try:
        # Path to CSV file
        csv_path = os.path.join(settings.BASE_DIR, 'ai', 'model', 'api_movie.csv')
        
        # Read CSV file using pandas
        df = pd.read_csv(csv_path)
        
        # Counter for success and failures
        success_count = 0
        failure_count = 0
        
        # Process each row in the CSV
        for index, row in df.iterrows():
            try:
                # Create Movie record
                movie = Movie.objects.create(
                    title=row['title'],
                    director=row['director'] if 'director' in row else None,
                    star1=row['star1'] if 'star1' in row else None,
                    star2=row['star2'] if 'star2' in row else None,
                    description=row['description'] if 'description' in row else "",
                    poster_url=row['poster_url'] if 'poster_url' in row else None,
                )
                
                # Extract genres from description using NLP or other methods
                # This is a placeholder - you'd need a more sophisticated approach
                
                success_count += 1
            except Exception as e:
                print(f"Error importing movie {row.get('title', 'Unknown')}: {e}")
                failure_count += 1
        
        return JsonResponse({
            "success": True,
            "imported_count": success_count,
            "failed_count": failure_count
        })
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def test_recommendation(request):
    """Test endpoint to verify DB-backed recommendation system works"""
    try:
        sample_movies = list(Movie.objects.values_list('title', flat=True).order_by('?')[:3])
        return JsonResponse({
            "status": "success",
            "message": "Recommendation system is working",
            "sample_movies": sample_movies
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)