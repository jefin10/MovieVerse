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
from django.views.decorators.csrf import ensure_csrf_cookie

# Load model and vectorizer once
model_path = os.path.join(settings.BASE_DIR, 'ai', 'model', 'mood_genre_model.pkl')
vectorizer_path = os.path.join(settings.BASE_DIR, 'ai', 'model', 'vectorizer.pkl')
csv_path = os.path.join(settings.BASE_DIR, 'ai', 'model', 'movies.csv')

model = joblib.load(model_path)
vectorizer = joblib.load(vectorizer_path)
movies_df = pd.read_csv(csv_path)

@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
@ensure_csrf_cookie
def predict_genre_and_recommend(request):
    user_mood = request.data.get("mood")

    if not user_mood:
        return JsonResponse({"error": "Mood is required"}, status=400)

    mood_input = vectorizer.transform([user_mood])
    predicted_genre = model.predict(mood_input)[0]

    matched = movies_df[movies_df['Genre'].str.contains(predicted_genre, case=False, na=False)]
    if not matched.empty:
        recommendations = matched.sample(n=5)[['Series_Title', 'Genre', 'IMDB_Rating']]
        movies = recommendations.to_dict(orient='records')
    else:
        movies = []

    return JsonResponse({
        "genre": predicted_genre,
        "recommendations": movies
    })


MODEL_DIR = os.path.join(settings.BASE_DIR, 'ai', 'model')
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

    liked_df = X[df['Series_Title'].isin(liked)]
    disliked_df = X[df['Series_Title'].isin(disliked)]

    if liked_df.empty:
        return Response({"error": "None of the liked movies were found in the dataset"}, status=400)

    profile = liked_df.mean()
    if not disliked_df.empty:
        profile -= disliked_df.mean()

    sim = cosine_similarity(X, profile.values.reshape(1, -1)).flatten()
    df['sim'] = sim

    unseen = df[~df['Series_Title'].isin(liked + disliked)]
    recs = unseen.sort_values(by='sim', ascending=False).head(10)

    return Response(recs[['Series_Title', 'sim']].to_dict(orient='records'))
