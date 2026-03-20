from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth.hashers import make_password
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import CustomUser

class UserProfile(models.Model):
    username = models.CharField(max_length=150, unique=True, db_index=True)
    password = models.CharField(max_length=255)  # Will be stored as a hashed password
    email = models.CharField(max_length=255)
    def save(self, *args, **kwargs):
        if not self.password.startswith('pbkdf2_sha256$'):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

# Update your Movie model as follows

class Genre(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Language(models.Model):
    iso_639_1 = models.CharField(max_length=10, primary_key=True)
    english_name = models.CharField(max_length=150, blank=True, default="")
    name = models.CharField(max_length=150, blank=True, default="")

    def __str__(self):
        return self.english_name or self.name or self.iso_639_1


class Country(models.Model):
    iso_3166_1 = models.CharField(max_length=10, primary_key=True)
    name = models.CharField(max_length=150)

    def __str__(self):
        return self.name



class Movie(models.Model):
    tmdb_id = models.IntegerField(unique=True, null=True, blank=True, db_index=True)
    title = models.CharField(max_length=255)
    original_title = models.CharField(max_length=255, blank=True, default="")
    description = models.TextField(blank=True,default="")
    director = models.CharField(max_length=255, blank=True,default="")
    star1 = models.CharField(max_length=255, blank=True,default="")
    star2 = models.CharField(max_length=255, blank=True,default="")
    poster_url = models.URLField(max_length=1000, blank=True,default="")
    backdrop_url = models.URLField(max_length=1000, blank=True, default="")
    release_date = models.DateField(null=True, blank=True,default=None)
    original_language = models.ForeignKey(Language, null=True, blank=True, on_delete=models.SET_NULL, related_name='movies_original_language')
    spoken_languages = models.ManyToManyField(Language, blank=True, related_name='movies_spoken_language')
    origin_countries = models.ManyToManyField(Country, blank=True, related_name='movies_origin_country')
    production_countries = models.ManyToManyField(Country, blank=True, related_name='movies_production_country')
    adult = models.BooleanField(default=False)
    popularity = models.FloatField(default=0.0)
    vote_count = models.IntegerField(default=0)
    tmdb_vote_average = models.FloatField(default=0.0, validators=[MinValueValidator(0.0), MaxValueValidator(10.0)])
    runtime = models.IntegerField(null=True, blank=True, default=None)
    status = models.CharField(max_length=100, blank=True, default="")
    tagline = models.TextField(blank=True, default="")
    homepage = models.URLField(max_length=1000, blank=True, default="")
    imdb_id = models.CharField(max_length=30, blank=True, default="")
    trailer_key = models.CharField(max_length=100, blank=True, default="")
    trailer_url = models.URLField(max_length=1000, blank=True, default="")
    trailer_name = models.CharField(max_length=255, blank=True, default="")
    budget = models.BigIntegerField(default=0)
    revenue = models.BigIntegerField(default=0)
    imdb_rating = models.FloatField(default=0.0, validators=[MinValueValidator(0.0), MaxValueValidator(10.0)])
    our_rating = models.FloatField(default=0, validators=[MinValueValidator(0), MaxValueValidator(10)])
    genres = models.ManyToManyField(Genre)
    tmdb_payload = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return self.title


class Watchlist(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    added_on = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)  # Changed from UserProfile

    class Meta:
        indexes = [
            models.Index(fields=['user', 'movie']), 
        ]

    def __str__(self):
        return f"{self.user.username} - {self.movie.title}"

class Ratings(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    rating = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(5.0)])
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'movie') 
        indexes = [
            models.Index(fields=['movie']), 
            models.Index(fields=['user']),  
        ]

    def __str__(self):
        return f"{self.user.username} rated {self.movie.title} {self.rating}/5"

class RecommendedMovies(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)  
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE) 
    recommended_on = models.DateTimeField(auto_now_add=True)  

    class Meta:
        unique_together = ('user', 'movie')  
        indexes = [
            models.Index(fields=['user']), 
            models.Index(fields=['movie']),
        ]

    def __str__(self):
        return f"{self.user.username} recommended {self.movie.title}"
    

class Actor(models.Model):
    name = models.CharField(max_length=255)
    
    def __str__(self):
        return self.name

class Director(models.Model):
    name = models.CharField(max_length=255)
    
    def __str__(self):
        return self.name