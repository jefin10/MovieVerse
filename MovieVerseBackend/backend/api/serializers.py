from rest_framework import serializers
from .models import UserProfile, Movie, Watchlist, Ratings,RecommendedMovies,Genre,Actor,Director

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__' 
    
class MovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = '__all__' 

class WatchlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Watchlist
        fields = '__all__' 

class RatingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ratings
        fields = '__all__' 

class RecommendedMovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecommendedMovies
        fields = '__all__' 

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = '__all__' 

class ActorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actor
        fields = '__all__' 

class DirectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Director
        fields = '__all__' 
