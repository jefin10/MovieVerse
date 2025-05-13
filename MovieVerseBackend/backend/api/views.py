import json
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

from rest_framework.authentication import SessionAuthentication
import requests
from .models import Ratings
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
    
    # Separate into liked and disliked movies based on rating threshold
    # Assuming ratings >= 3.5 are liked, < 2.5 are disliked, and others neutral
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


