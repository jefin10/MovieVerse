# ai/urls.py
from django.urls import path
from .views import predict_genre_and_recommend
from .views import get_recommendations

urlpatterns = [
    path('recommend/', predict_genre_and_recommend),
    path('rec/', get_recommendations),

]
