from django.urls import path
from .views import RegisterUser, logout_user, test, login_user,get_csrf_token

urlpatterns = [
    path('register/', RegisterUser.as_view(), name='register'),
    path('login/', login_user, name='login'),
    path('logout/', logout_user, name='logout'),
    path('test/', test, name='test'),   
    path('csrf/', get_csrf_token),
]
