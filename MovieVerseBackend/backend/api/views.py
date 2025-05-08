from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password,check_password

@api_view(['GET'])
def hello(request):
    return Response({"message": "Hello from Django!"})
# Add more API view functions here

@api_view(['GET'])
def get_movies(request):
    return Response({"movies": ["Movie 1", "Movie 2", "Movie 3"]})

@api_view(['POST'])
def register_user(request):
    # Logic to register a user
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    dob = request.data.get('dob')
    
    hashed_password = make_password(password)  
    
    if not username or not password or not dob:
        return Response({"error": "All fields are required!"}, status=400)
    
    try:
        # Assuming you have a User model defined in your models.py
        from .models import User
        user = User(username=username,email=email, password=hashed_password, dob=dob)
        user.save()
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    # If registration is successful
    return Response({"message": "User registered successfully!"})

@api_view(['POST'])
def login_user(request):
    # Logic to log in a user
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({"error": "Username and password are required!"}, status=400)
    
    try:
        from .models import User
        user = User.objects.get(username=username)
        if check_password(password,user.password):
            return Response({"message": "Login successful!"})
        else:
            return Response({"error": "Invalid credentials!"}, status=401)
    except User.DoesNotExist:
        return Response({"error": "User does not exist!"}, status=404)