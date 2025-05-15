import os
import django
import pandas as pd
import ast

# Set up Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")  # Replace with your project name
django.setup()

from api.models import Movie, Genre  # Replace 'backend' with your app name

# Load Excel file
df = pd.read_excel("movies.xlsx")  # Change filename if needed

for _, row in df.iterrows():
    try:
        movie = Movie.objects.create(
            title=row['title'],
            our_rating=row['our_rating'],
            imdb_rating=row['imdb_rating'],
            director=row['director'] or "",
            star1=row['star1'] or "",
            star2=row['star2'] or "",
            poster_url=row['poster_url'] or "",
            description=row['description'] or "",
        )

        # Parse genres (expected as a string representation of a list, like "[1, 2, 3]")
        genre_ids = ast.literal_eval(str(row['genres']))
        genres = Genre.objects.filter(id__in=genre_ids)
        movie.genres.set(genres)

        print(f"Inserted: {movie.title} with genres {[g.id for g in genres]}")
    except Exception as e:
        print(f"Error inserting row: {row['title']}, Error: {e}")
