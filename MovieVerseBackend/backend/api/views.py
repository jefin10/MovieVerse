import json
import os
import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password,check_password
from rest_framework.decorators import api_view
from .models import Movie, Watchlist, Genre
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
from .models import Ratings,RecommendedMovies

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
    Get trending movies based on recent ratings
    """
    # Get distinct movies from recent ratings, ordered by most recent
    rated_movies = Movie.objects.filter(
        id__in=Ratings.objects.values_list('movie', flat=True)
    ).distinct().order_by('-ratings__created_at')[:10]
    
    # If we don't have enough rated movies, supplement with random movies
    if rated_movies.count() < 10:
        # Get IDs of movies we already have
        existing_ids = [movie.id for movie in rated_movies]
        
        # Get random movies excluding the ones we already have
        remaining_needed = 10 - rated_movies.count()
        random_movies = Movie.objects.exclude(id__in=existing_ids).order_by('?')[:remaining_needed]
        
        # Combine both querysets
        from itertools import chain
        movies_list = list(chain(rated_movies, random_movies))
    else:
        movies_list = rated_movies
    
    serializer = MovieSerializer(movies_list, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def add_temp_recommendations(request):
    """
    Temporary route to add first 5 movies in the database to a user's recommendations
    """
    try:
        # Get username from request
        username = request.data.get('username')
        
        if not username:
            return Response({"error": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find the user
        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            return Response({"error": f"User '{username}' not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Get first 5 movies
        movies = Movie.objects.all()[:5]
        
        if not movies:
            return Response({"error": "No movies found in database"}, status=status.HTTP_404_NOT_FOUND)
        
        # Add movies to recommendations
        added_movies = []
        for movie in movies:
            # Check if recommendation already exists
            rec, created = RecommendedMovies.objects.get_or_create(user=user, movie=movie)
            if created:
                added_movies.append({
                    'id': movie.id,
                    'title': movie.title,
                    'description': movie.description,
                    'poster_url': movie.poster_url
                })
            else:
                added_movies.append({
                    'id': movie.id,
                    'title': movie.title,
                    'status': 'already exists'
                })
        
        return Response({
            "message": f"Added {len(added_movies)} movies to recommendations",
            "movies": added_movies
        })
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def add_rating(request):
    username=request.data.get('username')
    rating=float(request.data.get('rating'))
    movie_id=request.data.get('movie_id')
    userid=CustomUser.objects.get(username=username).id

    try:
        movie=Movie.objects.get(id=movie_id)
        if Ratings.objects.filter(user_id=userid,movie_id=movie_id).exists():
            rating_obj=Ratings.objects.get(user_id=userid,movie_id=movie_id)
            oldRating=rating_obj.rating
            rating_obj.rating=rating
            rating_obj.save()
            noOfRaters=Ratings.objects.filter(movie=movie).count()
            movie.our_rating=(movie.our_rating+rating-oldRating)/(noOfRaters)
            movie.save()
            return Response({"message":"Rating updated successfully"},status=200)
        else:
            rating_obj=Ratings(user_id=userid,movie=movie,rating=rating)
            rating_obj.save()
            noOfRaters=Ratings.objects.filter(movie=movie).count()
            movie.our_rating=(movie.our_rating+rating)/(noOfRaters)
            movie.save()
            return Response({"message":"Rating added successfully"},status=200)
    except Movie.DoesNotExist:
        return Response({"error":"Movie not found"},status=404)
    except Ratings.DoesNotExist:
        return Response({"error":"Rating not found"},status=404)

@api_view(['GET'])
def get_rating(request,username, movie_id):

    userid=CustomUser.objects.get(username=username).id

    try:
        if Ratings.objects.filter(user_id=userid,movie_id=movie_id).exists():
            rating_obj=Ratings.objects.get(user_id=userid,movie_id=movie_id)
            return Response({"rating":(rating_obj.rating)/2},status=200)
        else:
            return Response({"rating":0},status=200)
    except Movie.DoesNotExist:
        return Response({"error":"Movie not found"},status=404)


@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def get_user_recommendations(request):
    """
    Get recommended movies for a user
    """
    try:
        # Get username from request
        username = request.data.get('username')
        
        if not username:
            return Response({"error": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find the user
        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            return Response({"error": f"User '{username}' not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Get user's recommended movies
        recommended = RecommendedMovies.objects.filter(user=user).select_related('movie').order_by('-recommended_on')
        
        # If no recommendations, add some temporary ones
        if not recommended.exists():
            movies = Movie.objects.all().order_by('?')[:5]
            for movie in movies:
                RecommendedMovies.objects.create(user=user, movie=movie)
            
            # Get the newly created recommendations
            recommended = RecommendedMovies.objects.filter(user=user).select_related('movie')
        
        # Format the response
        result = []
        for rec in recommended:
            movie = rec.movie
            result.append({
                'id': movie.id,
                'title': movie.title,
                'description': movie.description,
                'poster_url': "https://image.tmdb.org/t/p/original" + movie.poster_url or '',
                'recommended_on': rec.recommended_on,
                'genres': [genre.name for genre in movie.genres.all()]
            })
        
        return Response(result)
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def fetch_movie_info(request, query):
    """
    Fetch detailed information about a specific movie by ID or title
    """
    try:
        # Check if query is a movie ID
        try:
            movie_id = int(query)
            is_id_query = True
        except ValueError:
            is_id_query = False
            
        if is_id_query:
            # Try to get the movie from our database by ID
            try:
                movie = Movie.objects.get(id=movie_id)
                
                # Prepare response data
                response_data = {
                    'id': movie.id,
                    'title': movie.title,
                    'movie_info': movie.description,
                    'director': movie.director,
                    'star1': movie.star1,
                    'star2': movie.star2,
                    'poster_url': "https://image.tmdb.org/t/p/original/" + movie.poster_url,
                    'release_date': movie.release_date,
                    'imdb_rating': movie.imdb_rating,
                    'our_rating': movie.our_rating,
                    'genres': [genre.name for genre in movie.genres.all()]
                }
                
                return Response(response_data)
                
            except Movie.DoesNotExist:
                # If not in our DB, try TMDB API
                TMDB_API_KEY = os.getenv("TMDB_API_KEY")
                TMDB_BASE_URL = "https://api.themoviedb.org/3"
                TMDB_BEARER_TOKEN = os.getenv("TMDB_BEARER_TOKEN")
                
                headers = {
                    "Authorization": f"Bearer {TMDB_BEARER_TOKEN}",
                    "accept": "application/json"
                }
                
                # Get movie details from TMDB
                movie_url = f"{TMDB_BASE_URL}/movie/{movie_id}?api_key={TMDB_API_KEY}"
                movie_response = requests.get(movie_url, headers=headers)
                
                if movie_response.status_code != 200:
                    return Response({"error": "Movie not found"}, status=status.HTTP_404_NOT_FOUND)
                    
                movie_data = movie_response.json()
                
                # Get credits to find director and actors
                credits_url = f"{TMDB_BASE_URL}/movie/{movie_id}/credits?api_key={TMDB_API_KEY}"
                credits_response = requests.get(credits_url, headers=headers)
                credits_data = credits_response.json() if credits_response.status_code == 200 else {"crew": [], "cast": []}
                
                # Find director
                director = next((person["name"] for person in credits_data.get("crew", []) 
                               if person.get("job", "").lower() == "director"), "Unknown")
                
                # Get top actors
                cast = credits_data.get("cast", [])
                star1 = cast[0]["name"] if len(cast) > 0 else "Unknown"
                star2 = cast[1]["name"] if len(cast) > 1 else "Unknown"
                
                # Get poster URL
                poster_path = movie_data.get("poster_path")
                poster_url = f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else ""
                
                # Get genres
                genres = [genre["name"] for genre in movie_data.get("genres", [])]
                
                # Create a new Movie object in our database
                new_movie = Movie(
                    id=movie_id,
                    title=movie_data.get("title", "Unknown"),
                    description=movie_data.get("overview", ""),
                    director=director,
                    star1=star1,
                    star2=star2,
                    poster_url=poster_url,
                    release_date=movie_data.get("release_date"),
                    imdb_rating=movie_data.get("vote_average", 0.0)
                )
                new_movie.save()
                
                # Add genres
                for genre_name in genres:
                    genre, created = Genre.objects.get_or_create(name=genre_name)
                    new_movie.genres.add(genre)
                
                # Prepare response data
                response_data = {
                    'id': movie_id,
                    'title': movie_data.get("title", "Unknown"),
                    'movie_info': movie_data.get("overview", ""),
                    'director': director,
                    'star1': star1,
                    'star2': star2,
                    'poster_url': poster_url,
                    'release_date': movie_data.get("release_date"),
                    'imdb_rating': movie_data.get("vote_average", 0.0),
                    'our_rating': 0,
                    'genres': genres
                }
                
                return Response(response_data)
                
        else:
            # Search by title
            # First check our database
            movie = Movie.objects.filter(title__icontains=query).first()
            if movie:
                response_data = {
                    'id': movie.id,
                    'title': movie.title,
                    'movie_info': movie.description,
                    'director': movie.director,
                    'star1': movie.star1,
                    'star2': movie.star2,
                    'poster_url': movie.poster_url,
                    'release_date': movie.release_date,
                    'imdb_rating': movie.imdb_rating,
                    'our_rating': movie.our_rating,
                    'genres': [genre.name for genre in movie.genres.all()]
                }
                
                return Response(response_data)
                
            # If not found locally, search TMDB
            TMDB_API_KEY = os.getenv("TMDB_API_KEY")
            TMDB_BASE_URL = "https://api.themoviedb.org/3"
            TMDB_BEARER_TOKEN = os.getenv("TMDB_BEARER_TOKEN")
            
            headers = {
                "Authorization": f"Bearer {TMDB_BEARER_TOKEN}",
                "accept": "application/json"
            }
            
            # Search for movies by title
            search_url = f"{TMDB_BASE_URL}/search/movie?api_key={TMDB_API_KEY}&query={query}"
            search_response = requests.get(search_url, headers=headers)
            
            if search_response.status_code != 200 or not search_response.json().get('results'):
                return Response({"error": f"Movie '{query}' not found"}, status=status.HTTP_404_NOT_FOUND)
                
            # Get first matching movie
            first_result = search_response.json()['results'][0]
            movie_id = first_result['id']
            
            # Now get detailed info using the movie ID
            movie_url = f"{TMDB_BASE_URL}/movie/{movie_id}?api_key={TMDB_API_KEY}"
            movie_response = requests.get(movie_url, headers=headers)
            
            if movie_response.status_code != 200:
                return Response({"error": "Failed to get movie details"}, status=status.HTTP_404_NOT_FOUND)
                
            movie_data = movie_response.json()
            
            # Get credits to find director and actors
            credits_url = f"{TMDB_BASE_URL}/movie/{movie_id}/credits?api_key={TMDB_API_KEY}"
            credits_response = requests.get(credits_url, headers=headers)
            credits_data = credits_response.json() if credits_response.status_code == 200 else {"crew": [], "cast": []}
            
            # Find director
            director = next((person["name"] for person in credits_data.get("crew", []) 
                           if person.get("job", "").lower() == "director"), "Unknown")
            
            # Get top actors
            cast = credits_data.get("cast", [])
            star1 = cast[0]["name"] if len(cast) > 0 else "Unknown"
            star2 = cast[1]["name"] if len(cast) > 1 else "Unknown"
            
            # Get poster URL
            poster_path = movie_data.get("poster_path")
            poster_url = f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else ""
            
            # Get genres
            genres = [genre["name"] for genre in movie_data.get("genres", [])]
            
            # Create a new Movie in our DB
            new_movie = Movie(
                id=movie_id,
                title=movie_data.get("title", "Unknown"),
                description=movie_data.get("overview", ""),
                director=director,
                star1=star1,
                star2=star2,
                poster_url=poster_url,
                release_date=movie_data.get("release_date"),
                imdb_rating=movie_data.get("vote_average", 0.0)
            )
            new_movie.save()
            
            # Add genres
            for genre_name in genres:
                genre, created = Genre.objects.get_or_create(name=genre_name)
                new_movie.genres.add(genre)
            
            # Prepare response data
            response_data = {
                'id': movie_id,
                'title': movie_data.get("title", "Unknown"),
                'movie_info': movie_data.get("overview", ""),
                'director': director,
                'star1': star1,
                'star2': star2,
                'poster_url': poster_url,
                'release_date': movie_data.get("release_date"),
                'imdb_rating': movie_data.get("vote_average", 0.0),
                'our_rating': 0,
                'genres': genres
            }
            
            return Response(response_data)
                
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
# Add these two new views to your views.py file

@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def rate_movie(request, movie_id):
    """
    Rate a movie (add or update rating)
    """
    try:
        username = request.data.get('username')
        rating_value = request.data.get('rating')
        
        if not username or rating_value is None:
            return Response({"error": "Username and rating are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            rating_value = float(rating_value)
            if rating_value < 0 or rating_value > 5:
                return Response({"error": "Rating must be between 0 and 5"}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({"error": "Rating must be a number"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            return Response({"error": f"User '{username}' not found"}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            movie = Movie.objects.get(id=movie_id)
        except Movie.DoesNotExist:
            return Response({"error": f"Movie with ID {movie_id} not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user already rated this movie
        rating, created = Ratings.objects.get_or_create(
            user=user,
            movie=movie,
            defaults={'rating': rating_value}
        )
        
        if not created:
            rating.rating = rating_value
            rating.save()
        
        # Update movie's overall rating
        all_ratings = Ratings.objects.filter(movie=movie)
        if all_ratings.exists():
            avg_rating = sum(r.rating for r in all_ratings) / all_ratings.count()
            movie.our_rating = round(avg_rating, 1)
            movie.save()
        
        return Response({
            "id": rating.id,
            "movie_id": movie.id,
            "rating": rating.rating,
            "movie_title": movie.title,
            "created": created
        })
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def get_movie_rating(request, movie_id):
    """
    Get a user's rating for a specific movie
    """
    try:
        username = request.query_params.get('username')
        
        if not username:
            return Response({"error": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            return Response({"error": f"User '{username}' not found"}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            movie = Movie.objects.get(id=movie_id)
        except Movie.DoesNotExist:
            return Response({"error": f"Movie with ID {movie_id} not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user rated this movie
        try:
            rating = Ratings.objects.get(user=user, movie=movie)
            return Response({
                "id": rating.id,
                "movie_id": movie.id,
                "rating": rating.rating,
                "created_at": rating.created_at
            })
        except Ratings.DoesNotExist:
            return Response({"message": "No rating found for this movie"}, status=status.HTTP_404_NOT_FOUND)
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def search_movies(request,query):
    """
    Search for movies by title
    """
    #query = request.query_params.get('query')
    
    if not query:
        return Response({"error": "Query parameter 'query' is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    movies = Movie.objects.filter(title__icontains=query).order_by('-release_date')
    
    if not movies.exists():
        return Response({"message": "No movies found"}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = MovieSerializer(movies, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def get_ratings_based_recommendations(request):
    """
    Get movie recommendations based on a user's movie ratings
    """
    try:
        username = request.query_params.get('username')
        
        if not username:
            return Response({"error": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            return Response({"error": f"User '{username}' not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Get all user ratings
        user_ratings = Ratings.objects.filter(user=user)
        
        if not user_ratings.exists():
            # Fall back to trending movies if no ratings exist
            movies = Movie.objects.all().order_by('?')[:10]
            serializer = MovieSerializer(movies, many=True)
            return Response({
                "info": "No ratings found, showing trending movies instead",
                "recommendations": serializer.data
            })
        
        # Split into liked (≥ 5) and disliked (< 5) movies
        liked_movie_ids = [rating.movie.id for rating in user_ratings if rating.rating >= 5]
        disliked_movie_ids = [rating.movie.id for rating in user_ratings if rating.rating < 5]
        
        # Get the movie titles for the AI recommendation engine
        liked_movies = []
        disliked_movies = []
        
        if liked_movie_ids:
            liked_movies = list(Movie.objects.filter(id__in=liked_movie_ids).values_list('title', flat=True))
        
        if disliked_movie_ids:
            disliked_movies = list(Movie.objects.filter(id__in=disliked_movie_ids).values_list('title', flat=True))
        
        # If no liked movies, fall back to trending
        if not liked_movies:
            movies = Movie.objects.all().order_by('?')[:10]
            serializer = MovieSerializer(movies, many=True)
            return Response({
                "info": "No liked movies found, showing trending movies instead",
                "recommendations": serializer.data
            })
        
        # Use AI recommendation model
        try:
            # Import feature matrix and movie data
            MODEL_DIR = os.path.join(settings.BASE_DIR, 'ai', 'model')
            X = joblib.load(os.path.join(MODEL_DIR, 'features.pkl'))
            df = pd.read_csv(os.path.join(MODEL_DIR, 'cleaned_movies.csv'))
            
            # Filter features for liked and disliked movies
            liked_df = X[df['title'].isin(liked_movies)]
            disliked_df = X[df['title'].isin(disliked_movies)]
            
            if liked_df.empty:
                movies = Movie.objects.all().order_by('?')[:10]
                serializer = MovieSerializer(movies, many=True)
                return Response({
                    "info": "No matching liked movies in model, showing trending instead",
                    "recommendations": serializer.data
                })
            
            # Create user profile
            profile = liked_df.mean()
            if not disliked_df.empty:
                profile -= disliked_df.mean()
            
            # Calculate similarity
            sim = cosine_similarity(X, profile.values.reshape(1, -1)).flatten()
            df['sim'] = sim
            
            # Filter out movies user has already rated
            all_rated_ids = liked_movie_ids + disliked_movie_ids
            df_filtered = df[~df['title'].isin(liked_movies + disliked_movies)]
            
            # Sort by similarity and get top recommendations
            recommendations_df = df_filtered.sort_values(by='sim', ascending=False).head(10)
            
            # Get our Movie objects for these recommendations
            recommended_titles = recommendations_df['title'].tolist()
            recommended_movies = Movie.objects.filter(title__in=recommended_titles)
            
            # Return as serialized data
            serializer = MovieSerializer(recommended_movies, many=True)
            return Response({
                "recommendations": serializer.data
            })
            
        except Exception as e:
            # If ML fails, fall back to trending
            movies = Movie.objects.all().order_by('?')[:10]
            serializer = MovieSerializer(movies, many=True)
            return Response({
                "error": f"Error generating recommendations: {str(e)}",
                "recommendations": serializer.data
            })
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)