# MovieVerse Website - Quick Start Guide

## Overview
The MovieVerse website is a simple, no-authentication movie browsing experience with a clean black and white theme matching the mobile app.

## Features
- ✅ Browse movies without authentication
- ✅ Search movies by title
- ✅ View detailed movie information
- ✅ Black and white theme (matches mobile app)
- ✅ Responsive design
- ✅ Download app button

## Prerequisites
1. Node.js 18+ installed
2. Backend server running on `http://127.0.0.1:8000`

## Setup

### 1. Install Dependencies
```bash
cd movieverse-website
npm install
```

### 2. Configure Environment
The `.env.local` file is already configured:
```
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

If your backend runs on a different URL, update this file.

### 3. Start Development Server
```bash
npm run dev
```

The website will be available at: `http://localhost:3000`

## Pages

### Home Page (`/`)
- Simple landing page with two buttons:
  - **Browse Movies** - Opens the catalog
  - **Download App** - Links to app download (currently Expo.dev)

### Browse Page (`/browse`)
- Displays all movies in a grid
- Search functionality
- No authentication required
- Click any movie to view details

### Movie Details Page (`/movie/[id]`)
- Full movie information
- Poster, description, ratings
- Cast and director info
- Trailer link (if available)

## API Endpoints Used

The website uses these backend endpoints (all without authentication):

1. **GET /api/web/catalog/** - Get all movies
2. **GET /api/web/search/{query}/** - Search movies
3. **GET /api/web/movie/{id}/** - Get movie details

## Backend Requirements

Make sure these endpoints exist in your Django backend (`MovieVerseBackend/backend/api/views.py`):

```python
@api_view(['GET'])
@permission_classes([AllowAny])
def web_catalog(request):
    movies = list(Movie.objects.all())
    random.shuffle(movies)
    serializer = MovieSerializer(movies[:50], many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def web_search_catalog(request, query):
    movies = Movie.objects.filter(title__icontains=query).order_by('-release_date')
    serializer = MovieSerializer(movies[:100], many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def web_fetch_movie_info(request, query):
    # ... movie details logic
```

These endpoints should be registered in `urls.py`:
```python
path('web/catalog/', views.web_catalog, name='web_catalog'),
path('web/search/<str:query>/', views.web_search_catalog, name='web_search_catalog'),
path('web/movie/<str:query>/', views.web_fetch_movie_info, name='web_fetch_movie_info'),
```

## Theme

The website uses a pure black and white theme matching the mobile app:

- **Background**: `#000000` (pure black)
- **Text**: `#ffffff` (white) and `#888888` (gray)
- **Cards**: `#0d0d0d` (dark gray)
- **Borders**: `rgba(255, 255, 255, 0.1)` (subtle white)

## Build for Production

```bash
npm run build
npm start
```

The production build will be optimized and ready to deploy.

## Troubleshooting

### "Could not load movie catalog"
- Ensure backend is running: `cd MovieVerseBackend/backend && python manage.py runserver`
- Check backend URL in `.env.local`
- Verify CORS is enabled in Django settings

### Movies not displaying
- Check if movies exist in database
- Verify API endpoints return data: `curl http://127.0.0.1:8000/api/web/catalog/`

### Search not working
- Ensure search endpoint exists in backend
- Check for typos in movie titles

### Poster images not loading
- Posters use TMDB image URLs
- Check if `poster_url` field is populated in database
- Verify TMDB image base URL: `https://image.tmdb.org/t/p/w500`

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variable: `NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com`
4. Deploy

### Other Platforms
- Netlify
- AWS Amplify
- Railway
- Render

Make sure to set the `NEXT_PUBLIC_API_BASE_URL` environment variable to your production backend URL.

## Notes

- No authentication is required for the website
- All endpoints use `@permission_classes([AllowAny])`
- The website is read-only (no ratings, watchlist, etc.)
- For full features, users should download the mobile app
