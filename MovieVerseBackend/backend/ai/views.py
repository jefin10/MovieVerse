import joblib
import pandas as pd
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os 
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from sklearn.metrics.pairwise import cosine_similarity
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import SessionAuthentication

# Load model and vectorizer once
MODEL_DIR = os.path.join(settings.BASE_DIR, 'ai', 'model')
model_path = os.path.join(MODEL_DIR, 'mood_genre_model.pkl')
vectorizer_path = os.path.join(MODEL_DIR, 'vectorizer.pkl')
movies_path = os.path.join(MODEL_DIR, 'cleaned_movies.csv')

model = joblib.load(model_path)
vectorizer = joblib.load(vectorizer_path)
movies_df = pd.read_csv(movies_path)

@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def predict_genre_and_recommend(request):
    user_mood = request.data.get("mood")

    if not user_mood:
        return JsonResponse({"error": "Mood is required"}, status=400)
        
    # Add randomness with time-based seed
    import random
    import time
    random.seed(int(time.time()))

    mood_input = vectorizer.transform([user_mood])
    predicted_genre = model.predict(mood_input)[0]

    # First try to find movies matching the predicted genre
    matching_description = movies_df[movies_df['description'].str.contains(predicted_genre, case=False, na=False)]
    
    # If we don't have at least 50 matches, include more movies
    if len(matching_description) < 50:
        # Sample random movies to fill the gap
        remaining_needed = 50 - len(matching_description)
        non_matching = movies_df[~movies_df.index.isin(matching_description.index)]
        
        if len(non_matching) >= remaining_needed:
            # Randomly sample from non-matching movies
            additional = non_matching.sample(n=remaining_needed)
            matched = pd.concat([matching_description, additional])
        else:
            # If we still don't have enough, just use what we have
            matched = pd.concat([matching_description, non_matching])
    else:
        # If we have enough matches, randomly sample from top rated movies
        top_matches = matching_description.nlargest(min(100, len(matching_description)), 'imdb_rating')
        matched = top_matches.sample(min(50, len(top_matches)))

    # Get all available movies (up to 50)
    final_count = min(50, len(matched))
    matched = matched.head(final_count)
    
    if not matched.empty:
        # Include all relevant fields, especially poster_url
        recommendations = matched[['id', 'title', 'director', 'imdb_rating', 'poster_url', 'description']].head(final_count)
        
        # Ensure poster URLs are complete
        movies = []
        for _, movie in recommendations.iterrows():
            poster_url = movie['poster_url']
            if poster_url and not (str(poster_url).startswith('http://') or str(poster_url).startswith('https://')):
                poster_url = f"https://image.tmdb.org/t/p/w500{poster_url}"
                
            movies.append({
                'id': int(movie['id']),
                'title': movie['title'],
                'director': movie['director'],
                'imdb_rating': float(movie['imdb_rating']) if pd.notna(movie['imdb_rating']) else 0,
                'poster_url': poster_url,
                'description': movie['description']
            })
    else:
        movies = []

    return JsonResponse({
        "genre": predicted_genre,
        "recommendations": movies
    })
# Load movie features for recommendation system
X = joblib.load(os.path.join(MODEL_DIR, 'features.pkl'))
df = pd.read_csv(os.path.join(MODEL_DIR, 'cleaned_movies.csv'))

@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def get_recommendations(request):
    data = request.data
    liked = data.get('liked', [])
    disliked = data.get('disliked', [])

    if not isinstance(liked, list) or not liked:
        return Response({"error": "Liked list must be a non-empty list"}, status=400)

    # Filter features for liked and disliked movies
    liked_df = X[df['title'].isin(liked)]
    disliked_df = X[df['title'].isin(disliked)]

    if liked_df.empty:
        return Response({"error": "None of the liked movies were found in the dataset"}, status=400)

    # Create user profile
    profile = liked_df.mean()
    if not disliked_df.empty:
        profile -= disliked_df.mean()

    # Calculate similarity
    sim = cosine_similarity(X, profile.values.reshape(1, -1)).flatten()
    df['sim'] = sim

    # Filter out movies user has already rated
    unseen = df[~df['title'].isin(liked + disliked)]
    recs = unseen.sort_values(by='sim', ascending=False).head(10)

    # Return recommendations with similarity scores
    recommendations = []
    for _, movie in recs.iterrows():
        recommendations.append({
            'title': movie['title'],
            'similarity': float(movie['sim']),
            'poster_url': movie.get('poster_url', ''),
            'description': movie.get('description', ''),
            'imdb_rating': movie.get('imdb_rating', 0)
        })

    return Response(recommendations)

from api.models import Movie
from api.models import Genre
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
    """Test endpoint to verify recommendation system works"""
    try:
        sample_movies = df['title'].sample(3).tolist()
        return JsonResponse({
            "status": "success",
            "message": "Recommendation system is working",
            "sample_movies": sample_movies
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)