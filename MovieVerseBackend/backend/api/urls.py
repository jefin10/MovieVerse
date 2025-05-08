from django.urls import path
from . import views
urlpatterns = [
    path('hello/', views.hello),
    path('get_movies/', views.get_movies),
    path('register', views.register_user),
    path('login', views.login_user),
        # Add more API endpoints here
]