from django.urls import path
from . import views
from .views import (
   trending_movies, view_watchlist, add_movie_to_watchlist,
  remove_movie_from_watchlist,get_ratings_based_recommendations,rate_movie,get_movie_rating,add_temp_recommendations,get_user_recommendations, tinder_movies, search_movie, view_watchlist, add_movie_to_watchlist, remove_movie_from_watchlist,
  web_catalog, web_search_catalog, web_fetch_movie_info,
  mobile_catalog, mobile_search_catalog, mobile_fetch_movie_info,
)

urlpatterns = [
    path('hello/', views.hello),
    path('get_movies/', views.get_movies),
    path('register', views.register_user),
    path('login', views.login_user),
    #API ROUTES
    path('Trending/', trending_movies, name='trending_movies'),
   
    path('TinderMovies/', tinder_movies, name='tinder_movies'),
    path('shorts/random-trailers/', views.random_trailers, name='random_trailers'),
    path('searchMovie/<str:query>/', search_movie, name='search_movie'),
    path('fetchMovieInfo/<str:query>/', views.fetch_movie_info, name='fetch_movie_info'),
    path('getMoviePoster/<str:query>/', views.get_movie_poster, name='get_movie_poster'),
    path('watchlist/', view_watchlist, name='view_watchlist'),
    path('watchlist/add/', add_movie_to_watchlist, name='add_to_watchlist'),
    path('watchlist/remove/<int:pk>/', remove_movie_from_watchlist, name='remove_from_watchlist'),
    path('recommendations/temp-add/', add_temp_recommendations, name='temp_add_recommendations'),
    path('recommendations/', get_user_recommendations, name='get_user_recommendations'),  # Add this line
    path('addRatings/', views.add_rating, name='add_ratings'),
    path('getRatings/<str:username>/<int:movie_id>/', views.get_rating, name='get_ratings'),
    path('movie/<int:movie_id>/rate/', rate_movie, name='rate_movie'),
    path('movie/<int:movie_id>/rating/', get_movie_rating, name='get_movie_rating'),
    path('searchMovie/<str:query>/',views.search_movie, name='search_movie'),
    path('recommendations/from-ratings/', get_ratings_based_recommendations, name='ratings_based_recommendations'),  # Add this line

    # Website routes (no auth)
    path('web/catalog/', web_catalog, name='web_catalog'),
    path('web/search/<str:query>/', web_search_catalog, name='web_search_catalog'),
    path('web/movie/<str:query>/', web_fetch_movie_info, name='web_fetch_movie_info'),

    # Mobile routes (auth)
    path('mobile/catalog/', mobile_catalog, name='mobile_catalog'),
    path('mobile/search/<str:query>/', mobile_search_catalog, name='mobile_search_catalog'),
    path('mobile/movie/<str:query>/', mobile_fetch_movie_info, name='mobile_fetch_movie_info'),

      # Add this line

    #END OF ROUTES
]