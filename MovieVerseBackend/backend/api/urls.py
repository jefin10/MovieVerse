from django.urls import path
from . import views
from .views import (
   trending_movies, view_watchlist, add_movie_to_watchlist,
    remove_movie_from_watchlist, tinder_movies, search_movie, view_watchlist, add_movie_to_watchlist, remove_movie_from_watchlist
)

urlpatterns = [
    path('hello/', views.hello),
    path('get_movies/', views.get_movies),
    path('register', views.register_user),
    path('login', views.login_user),
    #API ROUTES
    path('Trending/', trending_movies, name='trending_movies'),
   
    path('TinderMovies/', tinder_movies, name='tinder_movies'),
    path('searchMovie/<str:query>/', search_movie, name='search_movie'),
    path('fetchMovieInfo/<str:query>/', views.fetch_movie_info, name='fetch_movie_info'),
    path('getMoviePoster/<str:query>/', views.get_movie_poster, name='get_movie_poster'),
    path('watchlist/', view_watchlist, name='view_watchlist'),
    path('watchlist/add/', add_movie_to_watchlist, name='add_to_watchlist'),
    path('watchlist/remove/<int:pk>/', remove_movie_from_watchlist, name='remove_from_watchlist'),
    #END OF ROUTES
]