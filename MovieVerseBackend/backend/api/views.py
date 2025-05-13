import json
import os
import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password,check_password
from rest_framework.decorators import api_view
from .models import Movie, Watchlist
from .serializers import MovieSerializer, WatchlistSerializer
from django.shortcuts import get_object_or_404
from rest_framework import status
import random

@api_view(['GET'])
def hello(request):
    return Response({"message": "Hello from Django!"})
# Add more API view functions here

@api_view(['GET'])
def get_movies(request):
    return Response({"movies": ["Movie 1", "Movie 2", "Movie 3"]})

@api_view(['POST'])
def register_user(request):
    # Logic to register a user
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    dob = request.data.get('dob')
    
    hashed_password = make_password(password)  
    
    if not username or not password or not dob:
        return Response({"error": "All fields are required!"}, status=400)
    
    try:
        # Assuming you have a User model defined in your models.py
        from .models import User
        user = User(username=username,email=email, password=hashed_password, dob=dob)
        user.save()
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    # If registration is successful
    return Response({"message": "User registered successfully!"})

@api_view(['POST'])
def login_user(request):
    # Logic to log in a user
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({"error": "Username and password are required!"}, status=400)
    
    try:
        from .models import User
        user = User.objects.get(username=username)
        if check_password(password,user.password):
            return Response({"message": "Login successful!"})
        else:
            return Response({"error": "Invalid credentials!"}, status=401)
    except User.DoesNotExist:
        return Response({"error": "User does not exist!"}, status=404)

@api_view(['GET'])
def trending_movies(request):
    movies = Movie.objects.all().order_by('-rating')[:10]
    serializer = MovieSerializer(movies, many = True)
    return Response(serializer.data)

@api_view(['GET'])
def view_watchlist(request, user_id):
    watchlist = Watchlist.objects.filter(user_id = user_id)
    serializer = WatchlistSerializer(watchlist,many = True)
    return Response(serializer.data)

@api_view(['POST'])
def add_movie_to_watchlist(request):
    serializer = WatchlistSerializer(data = request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['DELETE'])
def remove_movie_from_watchlist(request, pk):
    watchlist_item = get_object_or_404(Watchlist, pk=pk)
    watchlist_item.delete()
    return Response(status=204)

@api_view(['GET'])
def tinder_movies(request):
    movies = list(Movie.objects.all())
    random.shuffle(movies)
    serializer = MovieSerializer(movies[:10], many=True)  # Return 10 random movies
    return Response(serializer.data)


@api_view(['GET'])
def search_movie(request, query):
    movies = Movie.objects.filter(title__icontains=query)
    serializer = MovieSerializer(movies, many=True)
    return Response(serializer.data)



TMDB_API_KEY = os.getenv("TMDB_API_KEY")
TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"
TMDB_BEARER_TOKEN = os.getenv("TMDB_BEARER_TOKEN")

@api_view(['GET'])
def fetch_movie_info(request, query):
    if not query:
        return Response({"error": "Movie name (query) is required"}, status=status.HTTP_400_BAD_REQUEST)

    headers = {
        "Authorization": f"Bearer {TMDB_BEARER_TOKEN}"
    }

    local_movie = None
    try:
        local_movie = Movie.objects.filter(title__iexact=query).first()
        if local_movie and local_movie.movie_info:
            return Response({"movie_info": local_movie.movie_info}, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"Error checking local database: {e}")
        pass

    try:
        tmdb_search_url = f"{TMDB_BASE_URL}/search/movie?query={query}"
        tmdb_response = requests.get(tmdb_search_url, headers=headers)
        tmdb_response.raise_for_status()
        tmdb_search_data = tmdb_response.json()

        if tmdb_search_data.get('results'):
            first_result = tmdb_search_data['results'][0]
            tmdb_id = first_result.get('id')

            if tmdb_id:
                tmdb_movie_url = f"{TMDB_BASE_URL}/movie/{tmdb_id}"
                tmdb_movie_response = requests.get(tmdb_movie_url, headers=headers)
                tmdb_movie_response.raise_for_status()
                tmdb_movie_data = tmdb_movie_response.json()

                overview = tmdb_movie_data.get('overview')
                if overview:
                    if local_movie:
                        local_movie.movie_info = overview
                        local_movie.save()
                    return Response({"movie_info": overview}, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "Overview not found for this movie on TMDB"}, status=status.HTTP_404_NOT_FOUND)
            else:
                return Response({"error": "Movie found on TMDB but no ID"}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({"error": f"Movie '{query}' not found on TMDB"}, status=status.HTTP_404_NOT_FOUND)

    except requests.exceptions.RequestException as e:
        return Response({"error": f"Error communicating with TMDB: {e}"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # return Response({"error": f"Could not retrieve movie info for '{query}'"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def get_movie_poster(request, query):
    if not query:
        return Response({"error": "Movie name (query) is required"}, status=status.HTTP_400_BAD_REQUEST)

    headers = {
        "Authorization": f"Bearer {TMDB_BEARER_TOKEN}"
    }

    try:
        local_movie = None
        try:
            local_movie = Movie.objects.get(title__iexact=query)
            if local_movie.poster_url:
                return Response({"poster_url": local_movie.poster_url}, status=status.HTTP_200_OK)
        except Movie.DoesNotExist:
            pass  # Movie not found locally

        # If movie not found locally OR poster_url is missing, search TMDB
        tmdb_search_url = f"{TMDB_BASE_URL}/search/movie?query={query}"
        print(tmdb_search_url)
        tmdb_response = requests.get(tmdb_search_url, headers=headers)
        tmdb_response.raise_for_status()
        tmdb_search_data = tmdb_response.json()

        if tmdb_search_data.get('results'):
            first_result = tmdb_search_data['results'][0]
            tmdb_id = first_result.get('id')

            if tmdb_id:
                # Fetch movie details from TMDB to get the poster path
                tmdb_movie_url = f"{TMDB_BASE_URL}/movie/{tmdb_id}"
                print(tmdb_movie_url)
                tmdb_movie_response = requests.get(tmdb_movie_url, headers=headers)
                tmdb_movie_response.raise_for_status()
                tmdb_movie_data = tmdb_movie_response.json()

                poster_path = tmdb_movie_data.get('poster_path')
                if poster_path:
                    poster_url = f"{TMDB_IMAGE_BASE_URL}{poster_path}"
                    # Update local database if movie exists
                    if local_movie:
                        local_movie.poster_url = poster_url
                        local_movie.save()
                    return Response({"poster_url": poster_url}, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "Poster not found for this movie on TMDB"}, status=status.HTTP_404_NOT_FOUND)
            else:
                return Response({"error": "Movie found on TMDB but no ID"}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({"error": f"Movie '{query}' not found on TMDB"}, status=status.HTTP_404_NOT_FOUND)

    except requests.exceptions.RequestException as e:
        return Response({"error": f"Error communicating with TMDB: {e}"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as e:
        return Response({"error he": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)