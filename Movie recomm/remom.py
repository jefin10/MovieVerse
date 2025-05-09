# save_recommendation_data.py
import pandas as pd
import numpy as np
import joblib
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MultiLabelBinarizer, MinMaxScaler
import os

# Load data
df = pd.read_csv('movies.csv')

# Preprocess
df['genres'] = df['Genre'].apply(lambda x: [g.strip() for g in x.split(',')] if isinstance(x, str) else [])

mlb = MultiLabelBinarizer()
genre = pd.DataFrame(mlb.fit_transform(df['genres']), columns=mlb.classes_, index=df.index)
dir = pd.get_dummies(df['Director'], prefix='Dir')
s1 = pd.get_dummies(df['Star1'], prefix='S1')
s2 = pd.get_dummies(df['Star2'], prefix='S2')

scaler = MinMaxScaler()
rat = pd.DataFrame(scaler.fit_transform(df[['IMDB_Rating']]), columns=['IMDB_Rating'], index=df.index)

X = pd.concat([genre, dir, s1, s2, rat], axis=1)

# Save everything
MODEL_DIR = './'
os.makedirs(MODEL_DIR, exist_ok=True)

joblib.dump(X, os.path.join(MODEL_DIR, 'features.pkl'))
df.to_csv(os.path.join(MODEL_DIR, 'cleaned_movies.csv'), index=False)

print("✅ Features and cleaned data saved.")
