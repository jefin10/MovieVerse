from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.forms import UserCreationForm
from users.models import CustomUser
import logging


logger = logging.getLogger(__name__)
# Registration View
class RegisterUser(APIView):
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        dob = request.data.get('dob') 
        phNo=request.data.get('phNo')
        
        # Create a user using the CustomUser model
        user = CustomUser.objects.create_user(username=username, email=email, password=password,dob=dob, phNo=phNo)
        user.save()
        
        return Response({"message": "User created successfully!"}, status=status.HTTP_201_CREATED)


# Login View
class LoginUser(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        logger.info(f"Attempting to authenticate: {username}")

        print(username, password)
        user = authenticate(request,username=username, password=password)
        
        if user is not None:
            login(request, user)
            return Response({"message": "Login successful"}, status=status.HTTP_200_OK)
        else:
            logger.warning(f"Failed login attempt: {username}")
            return Response({"error": "Invalid credentials!"}, status=status.HTTP_400_BAD_REQUEST)

# Logout View
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    from django.contrib.auth import logout
    logout(request)
    return Response({"message": "Logout successful!"}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Ensures only authenticated users can access
def test(request):
    return Response({"message": "This is a protected resource"})