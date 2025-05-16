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
import requests
from django.conf import settings
from rest_framework import status
import random
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import SessionAuthentication
import requests
from .models import Ratings
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
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def trending_movies(request):
    """
    Get trending movies (simplified version that returns recent movies)
    """
    # Get newest movies or a random selection if no sorting criteria
    movies = Movie.objects.all().order_by('?')[:10]  # Random selection
    
    serializer = MovieSerializer(movies, many=True)
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

from rest_framework import serializers
from .models import Movie, Watchlist, Genre

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['name']

# Update the MovieSerializer to include genre names instead of IDs
class MovieSerializer(serializers.ModelSerializer):
    # Add a serialized field for genres that returns the names
    genres = serializers.SerializerMethodField()
    
    class Meta:
        model = Movie
        fields = ['id', 'title', 'description', 'release_date', 'director','star1','star2', 'poster_url', 'genres', 'imdb_rating', 'our_rating']
    
    def get_genres(self, obj):
        """
        Return a list of genre names instead of genre objects or IDs
        """
        return [genre.name for genre in obj.genres.all()]

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


@api_view(['GET'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def get_user_recommendations(request, user_id=None):
    """
    Get personalized movie recommendations for a user based on their ratings.
    If user_id is not provided, it uses the currently authenticated user.
    """
    # Get user_id (either from URL or from authenticated user)
    if not user_id:
        user_id = request.user.id
    
    # Get all ratings for this user
    user_ratings = Ratings.objects.filter(user_id=user_id).select_related('movie')
    
    if not user_ratings.exists():
        return Response({"error": "No ratings found for this user"}, status=status.HTTP_404_NOT_FOUND)

    liked_movies = [rating.movie.title for rating in user_ratings if rating.rating >= 5]
    disliked_movies = [rating.movie.title for rating in user_ratings if rating.rating < 5]
    
    # If no clear preferences, return a message
    if not liked_movies:
        return Response({"error": "No liked movies found to base recommendations on"}, 
                        status=status.HTTP_400_BAD_REQUEST)
    
    # Prepare data for AI recommendation
    data = {
        'liked': liked_movies,
        'disliked': disliked_movies
    }
    
    try:
        # Make an internal request to the AI recommendation endpoint
        # For Django internal communication, we use internal APIs instead of HTTP requests
        from ai.views import get_recommendations
        
        # Create a mock request with the necessary data
        ai_request = request._request
        ai_request.method = 'POST'
        ai_request._body = json.dumps(data).encode('utf-8')
        ai_request.content_type = 'application/json'
        
        # Get the recommendations
        response = get_recommendations(ai_request)
        
        # If successful, return the recommendations
        if response.status_code == 200:
            return Response(response.data)
        else:
            return Response({"error": "Failed to get recommendations", "details": response.data}, 
                           status=response.status_code)
            
    except Exception as e:
        return Response({"error": f"Error getting recommendations: {str(e)}"}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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


from django.contrib.auth import get_user_model
from api.models import UserProfile  # Adjust based on your actual model

# Replace the current view_watchlist function with this:
@api_view(['POST'])  # <-- Changed from GET to POST to match your frontend
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def view_watchlist(request):
    try:
        # Get username from request body
        username = request.data.get('username')
        if not username:
            return Response({"error": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find the user by username - UPDATED to use CustomUser
        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            return Response({"error": f"User '{username}' not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # The rest stays the same
        watchlist_items = Watchlist.objects.filter(user=user).select_related('movie')
        
        result = []
        for item in watchlist_items:
            result.append({
                'id': item.id,
                'movie_id': item.movie.id,
                'title': item.movie.title,
                'added_on': item.added_on,
                'description': item.movie.description,
                'poster_url': item.movie.poster_url,
                'genres': [genre.name for genre in item.movie.genres.all()]
            })
        
        return Response(result)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
from users.models import CustomUser
@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def add_movie_to_watchlist(request):

    try:
        # Get username and movie_id from request
        username = request.data.get('username')
        movie_id = request.data.get('movie_id')
        
        if not username:
            return Response({"error": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not movie_id:
            return Response({"error": "Movie ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find the user and movie
        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            return Response({"error": f"User '{username}' not found"}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            movie = Movie.objects.get(id=movie_id)
        except Movie.DoesNotExist:
            return Response({"error": f"Movie with ID {movie_id} not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if already in watchlist
        if Watchlist.objects.filter(user=user, movie=movie).exists():
            return Response({"message": "Movie already in watchlist"}, status=status.HTTP_200_OK)
        
        # Add to watchlist
        watchlist_item = Watchlist.objects.create(user=user, movie=movie)
        
        # Return movie details in response
        result = {
            'id': watchlist_item.id,
            'movie_id': movie.id,
            'title': movie.title,
            'added_on': watchlist_item.added_on,
            'description': movie.description,
            'poster_url': movie.poster_url
        }
        
        return Response(result, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE', 'POST']) 
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def remove_movie_from_watchlist(request, pk):
    """
    Remove a movie from a user's watchlist
    """
    try:
        username = request.data.get('username')
        if not username:
            return Response({"error": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find the user - UPDATED to use CustomUser
        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            return Response({"error": f"User '{username}' not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Find the watchlist item
        try:
            watchlist_item = Watchlist.objects.get(pk=pk, user=user)
        except Watchlist.DoesNotExist:
            return Response({"error": "Watchlist item not found"}, status=status.HTTP_404_NOT_FOUND)
        
        watchlist_item.delete()
        return Response({"message": "Movie removed from watchlist"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def trending_movies(request):
    """
    Get trending movies (simplified version that returns recent movies)
    """
    # Get newest movies or a random selection if no sorting criteria
    movies = Movie.objects.all().order_by('?')[:10]  # Random selection
    
    serializer = MovieSerializer(movies, many=True)
    return Response(serializer.data)