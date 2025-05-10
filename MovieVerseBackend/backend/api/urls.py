from django.urls import path
from . import views
urlpatterns = [
    path('hello/', views.hello),
    path('get_movies/', views.get_movies),
        # Add more API endpoints here
]