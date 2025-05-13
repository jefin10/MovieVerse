from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.authentication import SessionAuthentication
from django.contrib.auth.forms import UserCreationForm
from django.views.decorators.csrf import csrf_exempt
from users.models import CustomUser
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)

@ensure_csrf_cookie
def get_csrf_token(request):
    print("CSRF token requested")
    csrf_token = request.META.get('CSRF_COOKIE')
    print("CSRF token:", csrf_token)
    return JsonResponse({"message": "CSRF cookie set"})

@ensure_csrf_cookie
@api_view(['POST'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def register_user(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    
    # Create a user using the CustomUser model
    user = CustomUser.objects.create_user(username=username, email=email, password=password)
    user.save()
    
    return Response({"message": "User created successfully!"}, status=status.HTTP_201_CREATED)


# Login View

@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    logger.info(f"Attempting to authenticate: {username}")

    print(username, password)
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        login(request, user)
        return Response({"message": "Login successful"}, status=status.HTTP_200_OK)
    else:
        logger.warning(f"Failed login attempt: {username}")
        return Response({"error": "Invalid credentials!"}, status=status.HTTP_400_BAD_REQUEST)

# Logout View
@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def logout_user(request):
    from django.contrib.auth import logout
    logout(request)
    response = Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)  
    response.delete_cookie('sessionid')
    response.delete_cookie('csrftoken')
    return Response({"message": "Logout successful!"}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Ensures only authenticated users can access
def test(request):
    return Response({"message": "This is a protected resource"})

User = get_user_model()

@api_view(['GET'])
def check_username_availability(request):
    username = request.GET.get('username')
    if not username:
        return JsonResponse({'error': 'Username not provided'}, status=400)

    exists = User.objects.filter(username=username).exists()
    return JsonResponse({'available': not exists})