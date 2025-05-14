# ai/urls.py
from django.urls import path
from .views import predict_genre_and_recommend
from .views import get_recommendations , import_movies_from_csv 

urlpatterns = [
    path('recommend/', predict_genre_and_recommend),
    path('rec/', get_recommendations),
    path('import-movies/', import_movies_from_csv, name='import_movies'),
    
    
]
