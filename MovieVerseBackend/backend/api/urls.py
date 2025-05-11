from django.urls import path
from . import views
from .views import (
   trending_movies, view_watchlist, add_movie_to_watchlist,
    remove_movie_from_watchlist, tinder_movies, search_movie
)

urlpatterns = [
    path('hello/', views.hello),
    path('get_movies/', views.get_movies),
    path('register', views.register_user),
    path('login', views.login_user),
    #API ROUTES
    path('Trending/', trending_movies, name='trending_movies'),
    path('viewWatchlist/<int:user_id>/', view_watchlist, name='view_watchlist'),
    path('addMovietoWatchlist/', add_movie_to_watchlist, name='add_to_watchlist'),
    path('removeMoviefromWatchlist/<int:pk>/', remove_movie_from_watchlist, name='remove_from_watchlist'),
    path('TinderMovies/', tinder_movies, name='tinder_movies'),
    path('searchMovie/<str:query>/', search_movie, name='search_movie'),
    #END OF ROUTES
