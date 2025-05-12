import pandas as pd
import requests
import time
from urllib.parse import quote_plus

# --- Configuration ---
CSV_FILE_PATH = 'movies.csv'  # Replace with the actual path to your CSV file
TMDB_API_KEY = '0836abe6c3ba19919db773956631673f'  # Replace with your actual TMDb API key
OUTPUT_CSV_FILE = 'movie_data_with_tmdb_ids.csv'
SEARCH_URL = 'https://api.themoviedb.org/3/search/movie'
MOVIE_URL = 'https://api.themoviedb.org/3/movie/'
HEADERS = {
    'Authorization': f'Bearer {TMDB_API_KEY}',
    'Content-Type': 'application/json'
}
SEARCH_PARAMS = {
    'query': '',
    'api_key': TMDB_API_KEY  # While headers are preferred, some examples use this
}
DELAY_SECONDS = 0.2  # To be mindful of API rate limits

def get_tmdb_id(movie_title):
    """Searches TMDb for a movie and returns the tmdb_id of the first result."""
    encoded_title = quote_plus(movie_title)  # URL encode the movie title
    SEARCH_PARAMS['query'] = encoded_title
    try:
        response = requests.get(SEARCH_URL, headers=HEADERS, params=SEARCH_PARAMS)
        response.raise_for_status()  # Raise an exception for bad status codes
        data = response.json()
        if data and 'results' in data and data['results']:
            return data['results'][0]['id']
        else:
            print(f"No results found for '{movie_title}' (encoded as '{encoded_title}')")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Error searching for '{movie_title}' (encoded as '{encoded_title}'): {e}")
        return None
    time.sleep(DELAY_SECONDS)  # Respect API rate limits

def main():
    """Reads the CSV, fetches tmdb_ids, and saves to a new CSV."""
    try:
        df = pd.read_csv(CSV_FILE_PATH)
        df['tmdb_id'] = None  # Initialize the new column

        for index, row in df.iterrows():
            movie_title = row['Series_Title']  # Assuming 'Series_Title' is the column with movie titles
            tmdb_id = get_tmdb_id(movie_title)
            if tmdb_id:
                df.loc[index, 'tmdb_id'] = tmdb_id

        df.to_csv(OUTPUT_CSV_FILE, index=False)
        print(f"Successfully added tmdb_ids and saved to '{OUTPUT_CSV_FILE}'")

    except FileNotFoundError:
        print(f"Error: CSV file not found at '{CSV_FILE_PATH}'")
    except KeyError:
        print("Error: 'Series_Title' column not found in the CSV file. Please adjust the script.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    main()