from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth.hashers import make_password
from django.core.validators import MinValueValidator, MaxValueValidator

class UserProfile(models.Model):
    username = models.CharField(max_length=150, unique=True, db_index=True)
    password = models.CharField(max_length=255)  # Will be stored as a hashed password
    email = models.CharField(max_length=255)
    def save(self, *args, **kwargs):
        if not self.password.startswith('pbkdf2_sha256$'):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

class Movie(models.Model):
    title = models.CharField(max_length=255, db_index=True)
    genre = models.CharField(max_length=100)
    release_date = models.DateField()

    def __str__(self):
        return self.title

class Watchlist(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)  
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    added_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'movie']), 
        ]

    def __str__(self):
        return f"{self.user.username} - {self.movie.title}"

class Ratings(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
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
    
class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Actor(models.Model):
    name = models.CharField(max_length=255)
    
    def __str__(self):
        return self.name

class Director(models.Model):
    name = models.CharField(max_length=255)
    
    def __str__(self):
        return self.name

