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

class Movie(models.Model):
    title = models.CharField(max_length=255, db_index=True)
    # genre handled through Genre model
    director = models.CharField(max_length=255, null=True, blank=True)
    star1 = models.CharField(max_length=255, null=True, blank=True)
    star2 = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    poster_url = models.URLField(max_length=500, null=True, blank=True)
    release_date = models.DateField(null=True, blank=True)  

    def __str__(self):
        return self.title

class Genre(models.Model):
    movie = models.ForeignKey(Movie, related_name='genres', on_delete=models.CASCADE, null=True)
    name = models.CharField(max_length=100)

    class Meta:
        unique_together = ('movie', 'name')

    def __str__(self):
        return f"{self.movie.title} - {self.name}"

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
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)  
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