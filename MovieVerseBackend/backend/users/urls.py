from django.urls import path
from .views import register_user, logout_user, test, login_user,get_csrf_token,check_username_availability
from . import views

urlpatterns = [
    path('register/', register_user, name='register'),
    path('login/', login_user, name='login'),
    path('logout/', logout_user, name='logout'),
    path('test/', test, name='test'),   
    path('csrf/', get_csrf_token),
    path('check-username/', check_username_availability, name='check_username'),
    path('forgot-password/', views.forgot_password),
    path('verify-otp/', views.verify_otp),
    path('reset-password/', views.reset_password),
    path('getEmail/', views.get_email),
]
