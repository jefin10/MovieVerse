# load_genres_from_excel.py

import os
import django
import pandas as pd

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")  # replace with your project name
django.setup()

from api.models import Genre  # replace with your app name

# Load the Excel file
df = pd.read_excel("normalized_movies.xlsx")  # Replace with your actual filename

for _, row in df.iterrows():
    genre, created = Genre.objects.update_or_create(
        id=row['Genre_ID'],  # Assuming 'Genre ID' is the column name in your Excel file
        defaults={'name': row['Genre_Name']}
    )
    print(f"{'Created' if created else 'Updated'}: {genre}")
