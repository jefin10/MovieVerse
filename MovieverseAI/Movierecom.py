import pandas as pd
import numpy as np
import joblib
import os
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MultiLabelBinarizer, MinMaxScaler
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import sys

# Add Django project to path to access models
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'MovieVerseBackend', 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

try:
    import django
    django.setup()
    from api.models import Movie as DjangoMovie
    USE_DJANGO = True
    print("✓ Django models loaded successfully")
except Exception as e:
    print(f"⚠ Could not load Django models: {e}")
    print("  Will use genre extraction from description as fallback")
    USE_DJANGO = False

# Create model directory if it doesn't exist
MODEL_DIR = 'model'
os.makedirs(MODEL_DIR, exist_ok=True)

print("Loading movie data...")
# Load the updated dataset
df = pd.read_csv('model/api_movie.csv')

# ================= MOVIE RECOMMENDATION MODEL =================
print("Processing movie features...")
# Clean up and process the data
df['title'] = df['title'].fillna('')
df['director'] = df['director'].fillna('')
df['star1'] = df['star1'].fillna('')
df['star2'] = df['star2'].fillna('')
df['description'] = df['description'].fillna('')
df['imdb_rating'] = pd.to_numeric(df['imdb_rating'], errors='coerce').fillna(0)

# Extract genres from Django database or description
print("Extracting genres...")
if USE_DJANGO:
    # Get genres from Django database
    def get_genres_from_db(movie_id):
        try:
            movie = DjangoMovie.objects.get(id=movie_id)
            return list(movie.genres.values_list('name', flat=True))
        except:
            return []
    
    df['genres'] = df['id'].apply(get_genres_from_db)
    print(f"  ✓ Extracted genres from database for {df['genres'].apply(len).sum()} genre assignments")
else:
    # Fallback: Extract genres from description using keywords
    genre_keywords = {
        'Action': ['action', 'fight', 'battle', 'explosion', 'chase', 'combat'],
        'Comedy': ['comedy', 'funny', 'humor', 'laugh', 'hilarious'],
        'Drama': ['drama', 'emotional', 'serious', 'intense'],
        'Horror': ['horror', 'scary', 'terror', 'frightening', 'creepy'],
        'Romance': ['romance', 'love', 'romantic', 'relationship'],
        'Thriller': ['thriller', 'suspense', 'mystery', 'tension'],
        'Sci-Fi': ['sci-fi', 'science fiction', 'space', 'future', 'alien'],
        'Fantasy': ['fantasy', 'magic', 'magical', 'wizard', 'mythical'],
        'Animation': ['animation', 'animated', 'cartoon'],
        'Adventure': ['adventure', 'quest', 'journey', 'expedition'],
    }
    
    def extract_genres_from_description(desc):
        if not isinstance(desc, str):
            return []
        desc_lower = desc.lower()
        found_genres = []
        for genre, keywords in genre_keywords.items():
            if any(keyword in desc_lower for keyword in keywords):
                found_genres.append(genre)
        return found_genres if found_genres else ['Unknown']
    
    df['genres'] = df['description'].apply(extract_genres_from_description)
    print(f"  ✓ Extracted genres from descriptions for {df['genres'].apply(len).sum()} genre assignments")

# One-hot encode genres (MOST IMPORTANT FEATURE!)
print("Creating genre features...")
mlb = MultiLabelBinarizer()
genre_matrix = mlb.fit_transform(df['genres'])
genre_features = pd.DataFrame(
    genre_matrix,
    columns=[f'Genre_{genre}' for genre in mlb.classes_],
    index=df.index
)
print(f"  ✓ Created {len(mlb.classes_)} genre features: {list(mlb.classes_)}")

# One-hot encode categorical features
print("Creating cast/crew features...")
dir_dummies = pd.get_dummies(df['director'], prefix='Dir')
star1_dummies = pd.get_dummies(df['star1'], prefix='S1')
star2_dummies = pd.get_dummies(df['star2'], prefix='S2')

# Normalize ratings
print("Normalizing ratings...")
scaler = MinMaxScaler()
ratings = pd.DataFrame(scaler.fit_transform(df[['imdb_rating']]), 
                       columns=['imdb_rating'], index=df.index)

# Add content-based features (TF-IDF on descriptions)
print("Creating content features from descriptions...")
tfidf = TfidfVectorizer(max_features=50, stop_words='english', min_df=2)
description_matrix = tfidf.fit_transform(df['description'])
description_features = pd.DataFrame(
    description_matrix.toarray(),
    columns=[f'Desc_{i}' for i in range(description_matrix.shape[1])],
    index=df.index
)
print(f"  ✓ Created {description_matrix.shape[1]} content features")

# Combine all features with weights
# Genres get 3x weight (most important!)
# Ratings get 2x weight
# Content features get 1.5x weight
# Cast/crew get 1x weight
print("Combining features with weights...")
X = pd.concat([
    genre_features * 3,           # 3x weight for genres (MOST IMPORTANT)
    description_features * 1.5,   # 1.5x weight for content similarity
    ratings * 2,                  # 2x weight for ratings
    dir_dummies,                  # 1x weight for director
    star1_dummies,                # 1x weight for star1
    star2_dummies,                # 1x weight for star2
], axis=1)

print(f"\n✓ Feature matrix shape: {X.shape}")
print(f"  - Genre features: {len(genre_features.columns)} (weight: 3x)")
print(f"  - Content features: {len(description_features.columns)} (weight: 1.5x)")
print(f"  - Rating features: 1 (weight: 2x)")
print(f"  - Director features: {len(dir_dummies.columns)} (weight: 1x)")
print(f"  - Star1 features: {len(star1_dummies.columns)} (weight: 1x)")
print(f"  - Star2 features: {len(star2_dummies.columns)} (weight: 1x)")
print(f"  - Total features: {X.shape[1]}")

# Save the feature matrix and processed dataframe
print("\nSaving movie recommendation model...")
joblib.dump(X, os.path.join(MODEL_DIR, 'features.pkl'))
joblib.dump(mlb, os.path.join(MODEL_DIR, 'genre_encoder.pkl'))
joblib.dump(tfidf, os.path.join(MODEL_DIR, 'tfidf_vectorizer.pkl'))
df.to_csv(os.path.join(MODEL_DIR, 'cleaned_movies.csv'), index=False)
print("  ✓ Saved features.pkl")
print("  ✓ Saved genre_encoder.pkl")
print("  ✓ Saved tfidf_vectorizer.pkl")
print("  ✓ Saved cleaned_movies.csv")

# ================= MOOD-BASED RECOMMENDATION MODEL =================
print("Training mood-based recommendation model...")
mood_data = {
    "mood_text": [
        # Comedy
        "I want to laugh",
        "I'm in the mood for something funny",
        "I need a comedy",
        "Make me laugh",
        "I want something light-hearted",
        # Drama
        "I feel emotional",
        "I want a deep story",
        "I'm in the mood for drama",
        "I want something serious",
        "I want to watch a dramatic movie",
        # Romance
        "I feel romantic",
        "I want a love story",
        "I'm in the mood for romance",
        "I want to watch something about relationships",
        "I want to be loved",
        # Action
        "I want action",
        "I'm in the mood for a thrilling ride",
        "I want to watch fights and explosions",
        "I need something fast-paced",
        "I want an adrenaline rush",
        # Thriller
        "I want a thriller",
        "I'm craving suspense",
        "I want something suspenseful",
        "I want a psychological thriller",
        "I want to be on the edge of my seat",
        # Mystery
        "I want to solve a mystery",
        "I'm in the mood for a whodunit",
        "I want a detective story",
        "I want something mysterious",
        "I want to watch a mystery movie",
        # Horror
        "I want to be scared",
        "I'm in the mood for horror",
        "I want a scary movie",
        "I want to watch something creepy",
        "I want a horror film",
        # Fantasy
        "I want to escape reality",
        "I'm in the mood for fantasy",
        "I want to watch magic and adventure",
        "I want a fantasy world",
        "I want to see mythical creatures",
        # Sci-Fi
        "I want science fiction",
        "I'm in the mood for sci-fi",
        "I want to watch space adventures",
        "I want futuristic movies",
        "I want to see aliens and robots",
        # Animation
        "I want animation",
        "I'm in the mood for cartoons",
        "I want to watch an animated movie",
        "I want something for kids",
        "I want a family-friendly animation",
        # Family
        "I want a family movie",
        "I'm in the mood for something everyone can watch",
        "I want a wholesome movie",
        "I want to watch with my family",
        "I want a feel-good family film",
        # Biography
        "I want to watch a true story",
        "I'm in the mood for a biography",
        "I want to see real-life heroes",
        "I want a movie based on real events",
        "I want to watch someone's life story",
        # Musical
        "I want a musical",
        "I'm in the mood for music",
        "I want to watch people sing and dance",
        "I want a movie with great songs",
        "I want a musical film",
        # Adventure
        "I want an adventure",
        "I'm in the mood for exploring",
        "I want to watch a journey",
        "I want a movie with quests",
        "I want an adventurous film",
        # War
        "I want a war movie",
        "I'm in the mood for battles",
        "I want to watch soldiers",
        "I want a movie about war",
        "I want a historical war film",
        # History
        "I want a historical movie",
        "I'm in the mood for history",
        "I want to watch something from the past",
        "I want a movie based on history",
        "I want to learn about history",
    ],
    "genre": [
        "Comedy", "Comedy", "Comedy", "Comedy", "Comedy",
        "Drama", "Drama", "Drama", "Drama", "Drama",
        "Romance", "Romance", "Romance", "Romance", "Romance",
        "Action", "Action", "Action", "Action", "Action",
        "Thriller", "Thriller", "Thriller", "Thriller", "Thriller",
        "Mystery", "Mystery", "Mystery", "Mystery", "Mystery",
        "Horror", "Horror", "Horror", "Horror", "Horror",
        "Fantasy", "Fantasy", "Fantasy", "Fantasy", "Fantasy",
        "Sci-Fi", "Sci-Fi", "Sci-Fi", "Sci-Fi", "Sci-Fi",
        "Animation", "Animation", "Animation", "Animation", "Animation",
        "Family", "Family", "Family", "Family", "Family",
        "Biography", "Biography", "Biography", "Biography", "Biography",
        "Musical", "Musical", "Musical", "Musical", "Musical",
        "Adventure", "Adventure", "Adventure", "Adventure", "Adventure",
        "War", "War", "War", "War", "War",
        "History", "History", "History", "History", "History",
    ]
}

df_mood = pd.DataFrame(mood_data)
vectorizer = CountVectorizer()
X_mood = vectorizer.fit_transform(df_mood['mood_text'])
model = MultinomialNB()
model.fit(X_mood, df_mood['genre'])

# Save mood model and vectorizer
print("Saving mood recommendation model...")
joblib.dump(model, os.path.join(MODEL_DIR, 'mood_genre_model.pkl'))
joblib.dump(vectorizer, os.path.join(MODEL_DIR, 'vectorizer.pkl'))

print("✅ All models trained and saved successfully!")