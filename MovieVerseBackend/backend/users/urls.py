from django.urls import path
from .views import RegisterUser, LoginUser, logout_user,test

urlpatterns = [
    path('register/', RegisterUser.as_view(), name='register'),
    path('login/', LoginUser.as_view(), name='login'),
    path('logout/', logout_user, name='logout'),
    path('test/', test, name='test')
]
