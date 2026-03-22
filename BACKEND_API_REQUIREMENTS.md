# Backend API Requirements for MovieVerse

This document outlines the required backend API endpoints that need to be implemented or fixed for the MovieVerse mobile app and website to function correctly.

## Base URL
- Development (Android Emulator): `http://10.0.2.2:8000/`
- Development (iOS Simulator/Physical Device): `http://<YOUR_LOCAL_IP>:8000/`
- Production: Configure via environment variable

## Required Endpoints

### Authentication Endpoints

#### 1. Get CSRF Token
```
GET /api/auth/csrf/
Response: Set-Cookie header with csrftoken
```

#### 2. Validate Session (NEW - REQUIRED)
```
GET /api/auth/validate-session/
Headers:
  - X-CSRFToken: <token>
  - Cookie: sessionid=<id>; csrftoken=<token>
Response:
  {
    "valid": true/false
  }
```
**Purpose**: Validates if the current session is still active. Called by AuthContext on app resume.

#### 3. Login
```
POST /api/auth/login/
Headers:
  - X-CSRFToken: <token>
Body:
  {
    "username": "string",
    "password": "string"
  }
Response: Set-Cookie with sessionid
```

#### 4. Register
```
POST /api/auth/register/
Body:
  {
    "email": "string",
    "username": "string",
    "password": "string"
  }
```

#### 5. Check Username Availability
```
GET /api/auth/check-username/?username=<username>
Response:
  {
    "available": true/false
  }
```

### Movie Endpoints

#### 6. Get Trending Movies
```
GET /api/Trending/
Response:
  [
    {
      "id": number,
      "title": "string",
      "poster_url": "string",
      "description": "string",
      "genres": ["string"],
      ...
    }
  ]
```

#### 7. Get Tinder Movies (Random Movies for Swiping)
```
GET /api/TinderMovies/
Response: Array of movie objects
```

#### 8. Get Random Trailers for Shorts (NEW - REQUIRED)
```
GET /api/shorts/random-trailers/
Response:
  [
    {
      "id": number,
      "title": "string",
      "poster_url": "string",
      "trailer_key": "string",  // YouTube video ID
      "trailer_url": "string",  // Full YouTube URL
      "trailer_name": "string",
      "description": "string"
    }
  ]
```
**Purpose**: Returns randomized movies that have valid trailer data. This endpoint should:
- Filter movies where `trailer_key` or `trailer_url` is not null/empty
- Return 20-30 random movies with trailers
- Ensure trailer URLs are valid YouTube links
- Prioritize movies with `trailer_key` (direct YouTube video ID)

**Implementation Notes**:
- Extract YouTube video ID from various URL formats:
  - `https://www.youtube.com/watch?v=VIDEO_ID`
  - `https://youtu.be/VIDEO_ID`
  - `https://www.youtube.com/embed/VIDEO_ID`
- Store as `trailer_key` for easier embedding

#### 9. Get Movie Details
```
GET /api/fetchMovieInfo/<movie_id>/
Response:
  {
    "id": number,
    "title": "string",
    "movie_info": "string",  // description
    "poster_url": "string",
    "director": "string",
    "star1": "string",
    "star2": "string",
    "release_date": "string",
    "imdb_rating": number,
    "genres": ["string"]
  }
```

#### 10. Search Movies
```
GET /api/web/search/<query>/
Response: Array of movie objects
```

#### 11. Get Catalog (All Movies)
```
GET /api/web/catalog/
Response: Array of movie objects
```

### Recommendation Endpoints

#### 12. Get Recommendations from Ratings
```
GET /api/recommendations/from-ratings/?username=<username>
Response: Array of recommended movie objects
```

#### 13. AI Mood-Based Recommendations
```
POST /ai/recommend/
Headers:
  - X-CSRFToken: <token>
Body:
  {
    "mood": "string"  // e.g., "I want to laugh", "feeling sad"
  }
Response:
  {
    "genre": "string",  // predicted genre
    "recommendations": [
      {
        "id": number,
        "title": "string",
        "poster_url": "string",
        ...
      }
    ]
  }
```

### Watchlist Endpoints

#### 14. Get User Watchlist (CHANGED TO GET)
```
GET /api/watchlist/?username=<username>
Headers:
  - X-CSRFToken: <token>
  - Cookie: sessionid=<id>; csrftoken=<token>
Response:
  [
    {
      "id": number,  // watchlist item ID
      "movie_id": number,
      "title": "string",
      "poster_url": "string",
      "description": "string",
      "genres": ["string"],
      "added_on": "datetime"
    }
  ]
```
**Note**: Changed from POST to GET for semantic correctness.

#### 15. Add to Watchlist
```
POST /api/watchlist/add/
Headers:
  - X-CSRFToken: <token>
Body:
  {
    "username": "string",
    "movie_id": number
  }
Response:
  {
    "id": number,  // watchlist item ID
    "message": "Added to watchlist"
  }
```

#### 16. Remove from Watchlist
```
POST /api/watchlist/remove/<watchlist_item_id>/
Headers:
  - X-CSRFToken: <token>
Body:
  {
    "username": "string"
  }
```
**OR**
```
DELETE /api/watchlist/remove/<watchlist_item_id>/
Headers:
  - X-CSRFToken: <token>
Body:
  {
    "username": "string"
  }
```

### Rating Endpoints

#### 17. Add/Update Movie Rating
```
POST /api/addRatings/
Headers:
  - X-CSRFToken: <token>
Body:
  {
    "username": "string",
    "movie_id": number,
    "rating": number  // 1-5
  }
```

#### 18. Get User Rating for Movie
```
GET /api/getRatings/<username>/<movie_id>/
Response:
  {
    "rating": number  // 1-5, or null if not rated
  }
```

#### 19. Get User Rating (Alternative Endpoint)
```
GET /api/movie/<movie_id>/rating/?username=<username>
Headers:
  - X-CSRFToken: <token>
Response:
  {
    "rating": number  // 1-5, or null if not rated
  }
```

## CORS Configuration

Ensure your backend allows:
- Credentials (cookies)
- Headers: `X-CSRFToken`, `Content-Type`, `Accept`
- Methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- Origins: Your mobile app and website domains

## Session Management

- Sessions should expire after reasonable inactivity (e.g., 7 days)
- CSRF tokens should be refreshed on each request
- Return 401 for expired sessions
- Return 403 for invalid CSRF tokens

## Error Response Format

All error responses should follow this format:
```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",  // optional
  "details": {}  // optional additional info
}
```

## Status Codes

- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 401: Unauthorized (session expired)
- 403: Forbidden (CSRF token invalid)
- 404: Not Found
- 500: Internal Server Error

## Priority Implementation Order

1. **CRITICAL**: `/api/auth/validate-session/` - Required for proper auth flow
2. **CRITICAL**: `/api/shorts/random-trailers/` - Required to fix YouTube shorts
3. **HIGH**: Change `/api/watchlist/` from POST to GET
4. **MEDIUM**: Ensure all endpoints return consistent error formats
5. **LOW**: Add rate limiting to prevent abuse
