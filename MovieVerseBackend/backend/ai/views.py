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

# Load model and vectorizer once
model_path = os.path.join(settings.BASE_DIR, 'ai', 'model', 'mood_genre_model.pkl')
vectorizer_path = os.path.join(settings.BASE_DIR, 'ai', 'model', 'vectorizer.pkl')
csv_path = os.path.join(settings.BASE_DIR, 'ai', 'model', 'movies.csv')

model = joblib.load(model_path)
vectorizer = joblib.load(vectorizer_path)
movies_df = pd.read_csv(csv_path)
@csrf_exempt
def predict_genre_and_recommend(request):
    if request.method == 'POST':
        body = json.loads(request.body)
        user_mood = body.get("mood")

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

    return JsonResponse({"error": "Only POST allowed"}, status=405)


MODEL_DIR = os.path.join(settings.BASE_DIR, 'ai', 'model')
X = joblib.load(os.path.join(MODEL_DIR, 'features.pkl'))
df = pd.read_csv(os.path.join(MODEL_DIR, 'cleaned_movies.csv'))

@api_view(['POST'])
def get_recommendations(request):
    data = request.data
    liked = data.get('liked', [])
    disliked = data.get('disliked', [])
    
    liked_df = X[df['Series_Title'].isin(liked)]
    disliked_df = X[df['Series_Title'].isin(disliked)]

    if liked_df.empty:
        return Response({"error": "Liked list is empty or invalid"}, status=400)

    profile = liked_df.mean()
    if not disliked_df.empty:
        profile -= disliked_df.mean()

    sim = cosine_similarity(X, profile.values.reshape(1, -1)).flatten()
    df['sim'] = sim

    unseen = df[~df['Series_Title'].isin(liked + disliked)]
    recs = unseen.sort_values(by='sim', ascending=False).head(10)
    
    return Response(recs[['Series_Title', 'sim']].to_dict(orient='records'))
