import pandas as pd
import numpy as np
import joblib
import os
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MultiLabelBinarizer, MinMaxScaler
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

# Create model directory if it doesn't exist
MODEL_DIR = 'model'
os.makedirs(MODEL_DIR, exist_ok=True)

print("Loading movie data...")
# Load the updated dataset
df = pd.read_csv('api_movie.csv')

# ================= MOVIE RECOMMENDATION MODEL =================
print("Processing movie features...")
# Clean up and process the data
df['title'] = df['title'].fillna('')
df['director'] = df['director'].fillna('')
df['star1'] = df['star1'].fillna('')
df['star2'] = df['star2'].fillna('')
df['imdb_rating'] = pd.to_numeric(df['imdb_rating'], errors='coerce').fillna(0)

# Extract genres from description (since api_movie.csv doesn't have explicit genres)
# Let's create a placeholder - in reality you might have a more sophisticated approach
df['genres'] = df['description'].apply(lambda x: [])  # Empty list as placeholder

# One-hot encode categorical features
print("Creating feature matrices...")
dir_dummies = pd.get_dummies(df['director'], prefix='Dir')
star1_dummies = pd.get_dummies(df['star1'], prefix='S1')
star2_dummies = pd.get_dummies(df['star2'], prefix='S2')

# Normalize ratings
scaler = MinMaxScaler()
ratings = pd.DataFrame(scaler.fit_transform(df[['imdb_rating']]), 
                       columns=['imdb_rating'], index=df.index)

# Combine all features
X = pd.concat([dir_dummies, star1_dummies, star2_dummies, ratings], axis=1)

# Save the feature matrix and processed dataframe
print("Saving movie recommendation model...")
joblib.dump(X, os.path.join(MODEL_DIR, 'features.pkl'))
df.to_csv(os.path.join(MODEL_DIR, 'cleaned_movies.csv'), index=False)

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