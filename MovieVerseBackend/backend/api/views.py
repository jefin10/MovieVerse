import json
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def hello(request):
    return Response({"message": "Hello from Django!"})
# Add more API view functions here

@api_view(['GET'])
def get_movies(request):
    return Response({"movies": ["Movie 1", "Movie 2", "Movie 3"]})

