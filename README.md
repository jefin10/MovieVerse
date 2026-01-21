# 🎬 MovieVerse

A comprehensive movie recommendation and discovery platform built with React Native (Expo) and Django. MovieVerse offers personalized movie recommendations based on user ratings, mood-based suggestions using machine learning, and an innovative Tinder-style movie discovery interface.

![MovieVerse](https://img.shields.io/badge/Platform-React%20Native-blue)
![Backend](https://img.shields.io/badge/Backend-Django-green)
![Python](https://img.shields.io/badge/Python-3.8+-yellow)
![License](https://img.shields.io/badge/License-MIT-purple)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Architecture Overview](#-architecture-overview)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Machine Learning Models](#-machine-learning-models)
- [App Screens & Features](#-app-screens--features)
- [Database Schema](#-database-schema)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Features
- 🔐 **User Authentication System**
  - Registration with email verification
  - Secure login/logout with session management
  - Password reset with OTP verification
  - Protected routes for authenticated users

- 🎯 **Personalized Recommendations**
  - AI-powered recommendations based on user ratings
  - Collaborative filtering using cosine similarity
  - Content-based filtering using movie metadata
  - Dynamic recommendation updates

- 😊 **Mood-Based Discovery**
  - Natural language mood processing using Naive Bayes
  - Genre prediction from mood text
  - Predefined mood categories (Happy, Sad, Romantic, Adventurous, etc.)
  - Custom mood input support

- 💳 **Tinder-Style Movie Discovery**
  - Swipeable movie cards
  - Quick add to watchlist with right swipe
  - Skip movies with left swipe
  - Instant visual feedback

- 📚 **Personal Watchlist**
  - Add/remove movies from watchlist
  - Swipe-to-delete functionality
  - Persistent storage across sessions
  - Visual movie grid display

- ⭐ **Movie Rating System**
  - 5-star rating interface
  - Real-time rating updates
  - User rating history tracking
  - Rating-based recommendation refinement

- 🔍 **Movie Search & Details**
  - Real-time search functionality
  - Detailed movie information pages
  - TMDB integration for posters and metadata
  - Cast and crew information
  - Genre tagging

### Additional Features
- 🌓 Dark mode optimized UI
- 📱 Cross-platform support (iOS/Android)
- 🎨 Beautiful gradients and animations
- 🔄 Real-time data synchronization
- 📊 Loading states with engaging movie facts
- 🎭 Genre-based browsing

---

## 🛠 Tech Stack

### Frontend (MovieVerseApp)
- **Framework:** React Native (v0.79.2)
- **Navigation:** Expo Router (v5.0.5)
- **State Management:** React Context API
- **UI Components:**
  - Expo Vector Icons
  - React Native Reanimated Carousel
  - React Native Swipe List View
  - Expo Linear Gradient
  - React Native Gesture Handler
- **HTTP Client:** Axios
- **Storage:** AsyncStorage
- **Development Tools:**
  - TypeScript (v5.8.3)
  - ESLint
  - Expo Dev Tools

### Backend (MovieVerseBackend)
- **Framework:** Django (v5.2.1)
- **API:** Django REST Framework (v3.16.0)
- **Database:** PostgreSQL (via psycopg2)
- **Authentication:** Django Session Authentication & Token Auth
- **Email Service:** SMTP (Gmail)
- **Environment Management:** python-dotenv

### Machine Learning (Movie recomm)
- **Libraries:**
  - scikit-learn (v1.6.1) - ML algorithms
  - pandas (v2.2.3) - Data manipulation
  - numpy (v2.2.5) - Numerical operations
  - joblib - Model serialization
- **Models:**
  - Multinomial Naive Bayes (mood-to-genre prediction)
  - Cosine Similarity (collaborative filtering)
  - Content-based filtering

### External APIs
- **TMDB API:** Movie metadata, posters, and information
- **PostgreSQL:** Production database (hosted)

---

## 📁 Project Structure

```
MovieVerse/
│
├── MovieVerseApp/                 # React Native Frontend
│   ├── app/                       # Application screens and logic
│   │   ├── (tabs)/               # Main tab navigation screens
│   │   │   ├── index.tsx         # Home screen with recommendations
│   │   │   ├── mood.tsx          # Mood-based recommendations
│   │   │   ├── tinder.tsx        # Swipeable movie discovery
│   │   │   ├── watchlist.tsx     # User watchlist
│   │   │   └── _layout.tsx       # Tab navigation layout
│   │   ├── auth/                 # Authentication logic
│   │   │   ├── api.ts            # API configuration & interceptors
│   │   │   ├── AuthContext.tsx   # Authentication context
│   │   │   └── protectedRoute.js # Route protection HOC
│   │   ├── components/           # Reusable UI components
│   │   │   ├── CustomSwiper.tsx  # Custom swiper component
│   │   │   ├── tinderMovieCard.tsx # Movie card for Tinder
│   │   │   ├── MovieGrid.tsx     # Grid display for movies
│   │   │   └── CustomTabBar.tsx  # Custom tab bar
│   │   ├── pages/                # Additional screens
│   │   │   ├── LoginPage.tsx     # Login screen
│   │   │   ├── RegisterPage.tsx  # Registration screen
│   │   │   ├── ProfilePage.tsx   # User profile
│   │   │   ├── MovieDetailPage.tsx # Movie details
│   │   │   ├── SearchResults.tsx # Search results
│   │   │   ├── ForgotPassUsername.tsx # Password recovery
│   │   │   ├── VerifyOtpPage.tsx # OTP verification
│   │   │   └── NewPasswordPage.tsx # Password reset
│   │   ├── services/             # API services
│   │   ├── hooks/                # Custom React hooks
│   │   └── _layout.tsx           # Root layout with auth provider
│   ├── assets/                   # Images, fonts, icons
│   ├── components/               # Shared components
│   ├── constants/                # App constants and themes
│   ├── helper/                   # Helper functions
│   ├── styles/                   # StyleSheet definitions
│   ├── package.json              # Dependencies
│   ├── app.json                  # Expo configuration
│   └── tsconfig.json             # TypeScript configuration
│
├── MovieVerseBackend/            # Django Backend
│   └── backend/
│       ├── api/                  # Main API app
│       │   ├── models.py         # Database models (Movie, Watchlist, Ratings)
│       │   ├── views.py          # API view functions
│       │   ├── serializers.py    # DRF serializers
│       │   ├── urls.py           # API routes
│       │   └── migrations/       # Database migrations
│       ├── users/                # User authentication app
│       │   ├── models.py         # CustomUser model
│       │   ├── views.py          # Auth views (login, register, logout)
│       │   ├── urls.py           # Auth routes
│       │   └── migrations/       # User migrations
│       ├── ai/                   # AI/ML recommendation app
│       │   ├── views.py          # ML prediction endpoints
│       │   ├── urls.py           # AI routes
│       │   └── model/            # Trained ML models
│       │       ├── mood_genre_model.pkl    # Mood classification model
│       │       ├── vectorizer.pkl          # Text vectorizer
│       │       ├── features.pkl            # Movie feature matrix
│       │       └── cleaned_movies.csv      # Processed movie data
│       ├── backend/              # Project settings
│       │   ├── settings.py       # Django settings
│       │   ├── urls.py           # URL routing
│       │   └── wsgi.py           # WSGI configuration
│       ├── manage.py             # Django management script
│       ├── requirements.txt      # Python dependencies
│       └── load_movies_from_excel.py # Data import script
│
└── Movie recomm/                 # ML Model Training
    ├── Movierecom.py             # Main training script
    ├── mood.py                   # Mood model training
    ├── remom.py                  # Recommendation utilities
    ├── movies.csv                # Raw movie dataset
    └── model/                    # Output models
        ├── api_movie.csv         # API-ready movie data
        └── cleaned_movies.csv    # Cleaned dataset
```

---

## 🏗 Architecture Overview

### System Architecture

```
┌─────────────────┐
│  React Native   │
│   Mobile App    │
└────────┬────────┘
         │
         │ HTTPS/REST API
         │
┌────────▼────────────────────────────────────┐
│          Django Backend                     │
│  ┌──────────────────────────────────────┐  │
│  │  API Layer (Django REST Framework)   │  │
│  └──────────┬───────────────────────────┘  │
│             │                               │
│  ┌──────────▼───────────┐  ┌────────────┐  │
│  │  Authentication      │  │   AI/ML    │  │
│  │  (Session & Token)   │  │  Service   │  │
│  └──────────┬───────────┘  └─────┬──────┘  │
│             │                     │         │
│  ┌──────────▼─────────────────────▼──────┐  │
│  │        Business Logic Layer           │  │
│  │  - User Management                    │  │
│  │  - Movie Operations                   │  │
│  │  - Recommendation Engine              │  │
│  └──────────┬────────────────────────────┘  │
│             │                               │
│  ┌──────────▼────────────────────────────┐  │
│  │      PostgreSQL Database              │  │
│  │  - Users, Movies, Ratings, Watchlist  │  │
│  └───────────────────────────────────────┘  │
└──────────────┬──────────────────────────────┘
               │
        ┌──────▼──────┐
        │  TMDB API   │
        │ (External)  │
        └─────────────┘
```

### Data Flow

1. **Authentication Flow:**
   ```
   User Input → Login API → Django Auth → Session Creation 
   → Cookie Storage (AsyncStorage) → Protected Routes
   ```

2. **Recommendation Flow:**
   ```
   User Ratings → ML Model → Feature Extraction 
   → Cosine Similarity → Ranked Movies → API Response
   ```

3. **Mood-Based Flow:**
   ```
   Mood Text → Vectorization → Naive Bayes Classifier 
   → Genre Prediction → Movie Filtering → Recommendations
   ```

---

## 🚀 Installation

### Prerequisites
- **Node.js:** v16 or higher
- **Python:** 3.8 or higher
- **PostgreSQL:** 12 or higher
- **Expo CLI:** `npm install -g expo-cli`
- **Git:** For cloning the repository

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/MovieVerse.git
cd MovieVerse
```

### Step 2: Frontend Setup (MovieVerseApp)

```bash
cd MovieVerseApp

# Install dependencies
npm install

# or using yarn
yarn install
```

### Step 3: Backend Setup (MovieVerseBackend)

```bash
cd ../MovieVerseBackend/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 4: ML Models Setup (Movie recomm)

```bash
cd "../../Movie recomm"

# Install ML dependencies (if not in backend requirements)
pip install scikit-learn pandas numpy joblib

# Train the models (optional - pre-trained models included)
python Movierecom.py
python mood.py
```

---

## ⚙ Configuration

### Backend Configuration

1. **Create `.env` file** in `MovieVerseBackend/backend/`:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/movieverse_db

# Django Secret Key
SECRET_KEY=your-secret-key-here

# Email Configuration
EMAIL_HOST_PASSWORD=your-app-specific-password

# TMDB API (for movie data)
TMDB_API_KEY=your-tmdb-api-key
TMDB_BEARER_TOKEN=your-tmdb-bearer-token
```

2. **Database Setup:**

```bash
# Create PostgreSQL database
createdb movieverse_db

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (admin)
python manage.py createsuperuser

# Load initial movie data
python load_movies_from_excel.py
python load_genres_from_excel.py
```

3. **TMDB API Setup:**
   - Visit [TMDB API](https://www.themoviedb.org/settings/api)
   - Create an account and get API key
   - Add to `.env` file

### Frontend Configuration

1. **Update API Base URL** in `MovieVerseApp/app/auth/api.ts`:

```typescript
const api = axios.create({
  baseURL: 'http://your-backend-url:8000/',  // Update this
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

2. **Expo Configuration** (optional) in `app.json`:
   - Update `package` name for Android
   - Update `bundleIdentifier` for iOS
   - Change app icon if desired

---

## 🏃 Running the Application

### Start Backend Server

```bash
cd MovieVerseBackend/backend
python manage.py runserver

# Server will start at: http://127.0.0.1:8000/
```

### Start Frontend App

```bash
cd MovieVerseApp

# Start Expo development server
npm start
# or
expo start

# Scan QR code with Expo Go app (iOS/Android)
# Or press 'a' for Android emulator
# Or press 'i' for iOS simulator
```

### Access Admin Panel
Navigate to: `http://127.0.0.1:8000/admin`
Login with superuser credentials

---

## 📚 API Documentation

### Base URL
```
http://your-backend-url:8000/
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register/
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string"
}

Response: 201 Created
{
  "message": "User created successfully!"
}
```

#### Login
```http
POST /api/auth/login/
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

Response: 200 OK
{
  "message": "Login successful"
}
```

#### Logout
```http
POST /api/auth/logout/
Headers: Cookie: sessionid=xxx

Response: 200 OK
{
  "message": "Logout successful!"
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password/
Content-Type: application/json

{
  "username": "string"
}

Response: 200 OK
{
  "message": "OTP sent to email"
}
```

#### Verify OTP
```http
POST /api/auth/verify-otp/
Content-Type: application/json

{
  "username": "string",
  "otp": "string"
}

Response: 200 OK
{
  "message": "OTP verified"
}
```

#### Reset Password
```http
POST /api/auth/reset-password/
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

Response: 200 OK
{
  "message": "Password updated"
}
```

### Movie Endpoints

#### Get Trending Movies
```http
GET /api/Trending/
Headers: Cookie: sessionid=xxx

Response: 200 OK
[
  {
    "id": 1,
    "title": "Movie Title",
    "description": "Movie description...",
    "poster_url": "https://...",
    "genres": ["Action", "Thriller"],
    "imdb_rating": 8.5,
    "director": "Director Name",
    "star1": "Actor 1",
    "star2": "Actor 2",
    "release_date": "2024-01-01"
  }
]
```

#### Search Movies
```http
GET /api/searchMovie/{query}/

Response: 200 OK
[
  {
    "id": 1,
    "title": "Matching Movie",
    ...
  }
]
```

#### Get Movie Details
```http
GET /api/fetchMovieInfo/{movie_id}/

Response: 200 OK
{
  "title": "Movie Title",
  "movie_info": "Description",
  "poster_url": "https://...",
  "director": "Director Name",
  "star1": "Actor 1",
  "star2": "Actor 2",
  "genres": ["Genre1", "Genre2"],
  "imdb_rating": 8.5,
  "release_date": "2024-01-01"
}
```

#### Get Tinder Movies
```http
GET /api/TinderMovies/

Response: 200 OK
[
  {
    "id": 1,
    "title": "Movie Title",
    "poster_url": "https://...",
    ...
  }
]
```

### Watchlist Endpoints

#### Get User Watchlist
```http
POST /api/watchlist/
Content-Type: application/json
Headers: Cookie: sessionid=xxx

{
  "username": "string"
}

Response: 200 OK
[
  {
    "id": 1,
    "movie_id": 123,
    "title": "Movie Title",
    "poster_url": "https://...",
    "added_on": "2024-01-01T12:00:00Z"
  }
]
```

#### Add to Watchlist
```http
POST /api/watchlist/add/
Content-Type: application/json
Headers: Cookie: sessionid=xxx

{
  "username": "string",
  "movie_id": 123
}

Response: 201 Created
{
  "message": "Added to watchlist"
}
```

#### Remove from Watchlist
```http
POST /api/watchlist/remove/{watchlist_item_id}/
Content-Type: application/json
Headers: Cookie: sessionid=xxx

{
  "username": "string"
}

Response: 204 No Content
```

### Rating Endpoints

#### Rate Movie
```http
POST /api/movie/{movie_id}/rate/
Content-Type: application/json
Headers: Cookie: sessionid=xxx

{
  "username": "string",
  "rating": 4.5
}

Response: 200 OK
{
  "message": "Rating saved successfully"
}
```

#### Get Movie Rating
```http
GET /api/movie/{movie_id}/rating/?username={username}
Headers: Cookie: sessionid=xxx

Response: 200 OK
{
  "rating": 4.5
}
```

### Recommendation Endpoints

#### Get Recommendations from Ratings
```http
GET /api/recommendations/from-ratings/?username={username}
Headers: Cookie: sessionid=xxx

Response: 200 OK
{
  "recommendations": [
    {
      "id": 1,
      "title": "Recommended Movie",
      "poster_url": "https://...",
      "imdb_rating": 8.5,
      ...
    }
  ]
}
```

### AI/ML Endpoints

#### Mood-Based Recommendations
```http
POST /ai/recommend/
Content-Type: application/json
Headers: Cookie: sessionid=xxx

{
  "mood": "I want to laugh"
}

Response: 200 OK
{
  "genre": "Comedy",
  "recommendations": [
    {
      "id": 1,
      "title": "Comedy Movie",
      "poster_url": "https://...",
      "description": "...",
      "imdb_rating": 7.8,
      "director": "Director Name"
    }
  ]
}
```

#### Content-Based Recommendations
```http
POST /ai/rec/
Content-Type: application/json
Headers: Cookie: sessionid=xxx

{
  "liked": ["Movie Title 1", "Movie Title 2"],
  "disliked": ["Movie Title 3"]
}

Response: 200 OK
{
  "recommendations": [
    {
      "id": 1,
      "title": "Similar Movie",
      ...
    }
  ]
}
```

---

## 🤖 Machine Learning Models

### 1. Mood-to-Genre Classification Model

**Algorithm:** Multinomial Naive Bayes

**Purpose:** Predicts movie genre based on user's mood description

**Training Data:**
- 100+ mood phrases mapped to genres
- Genres: Comedy, Drama, Romance, Action, Thriller, Mystery, Horror, Fantasy, Sci-Fi, Animation, Family, Biography, Musical, Adventure, War, History

**Features:**
- Text vectorization using CountVectorizer
- Bag-of-words representation
- Case-insensitive matching

**Performance:**
- Training accuracy: ~95%
- Real-time prediction: <100ms

**Files:**
- `mood_genre_model.pkl` - Trained model
- `vectorizer.pkl` - Fitted vectorizer

**Usage Flow:**
```
User Mood Input → Vectorization → Naive Bayes → Genre Prediction
→ Filter Movies by Description → Return Top 50 Movies
```

### 2. Collaborative Filtering Model

**Algorithm:** Cosine Similarity

**Purpose:** Recommends movies based on user rating patterns

**Features Used:**
- User-movie rating matrix
- Item-item similarity
- User preference vectors

**Process:**
1. Build user-item rating matrix
2. Calculate movie similarity using cosine similarity
3. For each highly-rated movie by user:
   - Find similar movies
   - Weight by rating
4. Rank and return top recommendations

**Performance:**
- Cold start handling: Falls back to content-based
- Recommendation generation: <500ms

### 3. Content-Based Filtering Model

**Algorithm:** Feature-based Similarity

**Features:**
- Director (one-hot encoded)
- Actors (star1, star2 - one-hot encoded)
- IMDB Rating (normalized)
- Genres (multi-label binary)

**Files:**
- `features.pkl` - Feature matrix (X)
- `cleaned_movies.csv` - Processed movie metadata

**Process:**
1. Extract features for liked/disliked movies
2. Calculate average feature vectors
3. Compute similarity with all movies
4. Penalize disliked movie features
5. Return top N similar movies

**Performance:**
- Feature extraction: <200ms
- Similarity computation: <300ms

### Model Training

To retrain models:

```bash
cd "Movie recomm"

# Train all models
python Movierecom.py

# Train only mood model
python mood.py
```

**Training Requirements:**
- `movies.csv` or `api_movie.csv` with columns:
  - id, title, director, star1, star2, imdb_rating, poster_url, description

**Model Output:**
- Saved in `model/` directory
- Must be copied to `MovieVerseBackend/backend/ai/model/`

---

## 📱 App Screens & Features

### 1. Authentication Screens

#### Login Page (`LoginPage.tsx`)
- Email/username and password input
- Session cookie management
- "Forgot Password" link
- Keyboard-aware scrolling
- Loading states

#### Register Page (`RegisterPage.tsx`)
- Username, email, password fields
- Real-time username availability check
- Password confirmation
- Email validation
- Automatic login after registration

#### Forgot Password Flow
- `ForgotPassUsername.tsx` - Username input
- `VerifyOtpPage.tsx` - OTP verification
- `NewPasswordPage.tsx` - New password setup
- Email-based OTP delivery

### 2. Main Tabs (Bottom Navigation)

#### Home Tab (`index.tsx`)
**Features:**
- Personalized greeting (Good Morning/Afternoon/Evening)
- User profile access
- Search bar with debounced queries
- "Recommended For You" section (rating-based ML)
- "Trending Now" section
- Horizontal scrollable movie cards
- Pull-to-refresh functionality

**Interactions:**
- Tap movie → Movie Detail Page
- Tap profile icon → Profile Page
- Type in search → Search Results Page

#### Watchlist Tab (`watchlist.tsx`)
**Features:**
- Grid display of saved movies
- Swipe-to-delete functionality
- Empty state message
- Movie count indicator
- Tap to view details

**Interactions:**
- Swipe left → Reveal delete button
- Tap delete → Remove from watchlist
- Tap movie card → Movie Detail Page

#### Tinder Tab (`tinder.tsx`)
**Features:**
- Swipeable movie cards
- Large poster display
- Movie title and rating overlay
- Swipe right → Add to watchlist
- Swipe left → Skip movie
- Auto-refresh when cards run out
- Visual feedback (checkmark/cross icons)
- Prevents duplicate processing

**Interactions:**
- Swipe right → Add to watchlist (visual confirmation)
- Swipe left → Skip to next movie
- Tap card → Movie Detail Page

#### Mood Tab (`mood.tsx`)
**Features:**
- Predefined mood buttons:
  - 😊 Happy
  - 😢 Sad
  - 💕 Romantic
  - 🚀 Adventurous
  - 😰 Scary
  - 😴 Bored
  - 🤔 Thoughtful
  - Other (custom input)
- Custom mood text input
- AI-predicted genre display
- Grid view of mood-matched movies
- Loading states with animations

**Interactions:**
- Tap mood button → Get recommendations
- Tap "Other" → Enter custom mood
- View predicted genre
- Tap movie → Movie Detail Page

### 3. Detail Screens

#### Movie Detail Page (`MovieDetailPage.tsx`)
**Features:**
- Full-screen poster with gradient overlay
- Movie title and year
- Genre tags
- IMDB rating display
- Director and cast information
- Full plot description
- Add/Remove from watchlist button
- 5-star rating interface
- Similar movies section (optional)
- Parallax scrolling effect

**Interactions:**
- Tap watchlist icon → Add/remove from watchlist
- Tap stars → Rate movie (1-5 stars)
- Scroll → Parallax poster effect
- Back button → Return to previous screen

#### Profile Page (`ProfilePage.tsx`)
**Features:**
- User avatar placeholder
- Username display
- Email display
- Edit profile option
- Change password button
- Logout button
- Settings section

**Interactions:**
- Tap "Reset Password" → Send OTP → Verify → New Password
- Tap "Logout" → Clear session → Return to login

#### Search Results (`SearchResults.tsx`)
**Features:**
- Real-time search results
- Movie grid display
- Empty state handling
- Loading indicators

**Interactions:**
- Tap movie → Movie Detail Page
- No results → Show "No movies found" message

### 4. Components

#### Custom Components
- **ScreenWrapper** - Provides consistent screen padding and layout
- **CustomSwiper** - Swipeable card interface for Tinder feature
- **TinderMovieCard** - Individual movie card with poster and info
- **MovieGrid** - Responsive grid layout for movie lists
- **CustomTabBar** - Bottom tab bar with icons and labels
- **LoadingPage** - Loading screen with random movie facts
- **ProtectedRoute** - HOC for authentication-required screens

---

## 🗄 Database Schema

### Users App

#### CustomUser Model
```python
class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    
    # Inherited from AbstractUser:
    # - password (hashed)
    # - first_name, last_name
    # - is_active, is_staff, is_superuser
    # - date_joined, last_login
```

### API App

#### Movie Model
```python
class Movie(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    director = models.CharField(max_length=255, blank=True)
    star1 = models.CharField(max_length=255, blank=True)
    star2 = models.CharField(max_length=255, blank=True)
    poster_url = models.URLField(blank=True)
    release_date = models.DateField(null=True, blank=True)
    imdb_rating = models.FloatField(default=0.0)  # 0-10 scale
    our_rating = models.FloatField(default=0)      # Internal rating
    genres = models.ManyToManyField(Genre)         # Many-to-many
```

#### Genre Model
```python
class Genre(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    
    # Genres: Action, Comedy, Drama, Horror, Sci-Fi, etc.
```

#### Watchlist Model
```python
class Watchlist(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    added_on = models.DateTimeField(auto_now_add=True)
    
    # Indexes on (user, movie) for fast queries
```

#### Ratings Model
```python
class Ratings(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    rating = models.FloatField()  # 0-5 scale (0.5 increments)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Unique constraint on (user, movie)
```

#### RecommendedMovies Model
```python
class RecommendedMovies(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    recommended_on = models.DateTimeField(auto_now_add=True)
    
    # Unique constraint on (user, movie)
    # Stores temporarily recommended movies
```

#### Actor & Director Models
```python
class Actor(models.Model):
    name = models.CharField(max_length=255)

class Director(models.Model):
    name = models.CharField(max_length=255)
```

### Database Relationships

```
CustomUser ─┬─ 1:N ─> Watchlist ─> N:1 ─ Movie
            ├─ 1:N ─> Ratings ─> N:1 ─ Movie
            └─ 1:N ─> RecommendedMovies ─> N:1 ─ Movie

Movie ─> M:N ─ Genre
```

### Database Indexes
- `(user, movie)` on Watchlist
- `user` on Ratings
- `movie` on Ratings
- `user` on RecommendedMovies
- `movie` on RecommendedMovies

---

## 🔧 Key Implementation Details

### Authentication Flow

1. **Login Process:**
   - User submits credentials
   - Django authenticates and creates session
   - Session ID stored in cookie
   - Frontend saves `sessionid` and `csrftoken` to AsyncStorage
   - Protected routes check for session existence

2. **Request Authentication:**
   ```typescript
   // API interceptor adds cookies to every request
   api.interceptors.request.use(async (config) => {
     const sessionid = await AsyncStorage.getItem('sessionid');
     const csrftoken = await AsyncStorage.getItem('csrftoken');
     
     if (sessionid && csrftoken) {
       config.headers.Cookie = `sessionid=${sessionid}; csrftoken=${csrftoken}`;
       config.headers['X-CSRFToken'] = csrftoken;
     }
     return config;
   });
   ```

3. **Protected Routes:**
   ```typescript
   // ProtectedRoute HOC
   export default function ProtectedRoute({ children }) {
     const { authenticated } = useAuth();
     
     useEffect(() => {
       if (authenticated === false) {
         router.replace('/pages/LoginPage');
       }
     }, [authenticated]);
     
     return authenticated ? children : <LoadingPage />;
   }
   ```

### Recommendation Algorithm Details

#### Rating-Based Recommendations
```python
# Simplified algorithm flow
def get_ratings_based_recommendations(user):
    # 1. Get user's highly rated movies (rating >= 4)
    liked_movies = Ratings.objects.filter(user=user, rating__gte=4)
    
    # 2. For each liked movie, find similar movies
    similar_movies = []
    for movie in liked_movies:
        # Calculate cosine similarity with all movies
        similarities = cosine_similarity(movie.features, all_movies.features)
        # Weight by user's rating
        weighted_scores = similarities * movie.user_rating
        similar_movies.extend(weighted_scores)
    
    # 3. Aggregate and rank
    aggregated = aggregate_scores(similar_movies)
    
    # 4. Filter out already watched/rated
    filtered = exclude_watched(aggregated, user)
    
    # 5. Return top N
    return filtered.order_by('-score')[:20]
```

#### Mood-Based Algorithm
```python
# Mood to genre prediction
def predict_genre_and_recommend(mood_text):
    # 1. Vectorize mood text
    mood_vector = vectorizer.transform([mood_text])
    
    # 2. Predict genre using Naive Bayes
    predicted_genre = model.predict(mood_vector)[0]
    
    # 3. Filter movies by genre in description
    matching_movies = Movie.objects.filter(
        description__icontains=predicted_genre
    )
    
    # 4. If insufficient matches, add random movies
    if matching_movies.count() < 50:
        additional = Movie.objects.exclude(
            id__in=matching_movies
        ).order_by('?')[:50 - matching_movies.count()]
        
        movies = list(matching_movies) + list(additional)
    else:
        # Sample from top rated
        movies = matching_movies.order_by('-imdb_rating')[:50]
    
    return {
        'genre': predicted_genre,
        'recommendations': movies
    }
```

### Tinder Swipe Mechanics

```typescript
// Swipe detection
const onSwipe = (direction: 'left' | 'right', cardIndex: number) => {
  const movie = movies[cardIndex];
  
  // Prevent duplicate processing
  if (processedMovieIds.has(movie.id)) {
    return;
  }
  
  if (direction === 'right') {
    // Add to watchlist
    addToWatchlist(movie);
    showFeedback('✓', 'green');
  } else {
    // Just skip
    showFeedback('✗', 'red');
  }
  
  // Mark as processed
  processedMovieIds.add(movie.id);
  
  // Load more movies if running low
  if (cardIndex >= movies.length - 3) {
    loadMoreMovies();
  }
};
```

### Search Implementation

```typescript
// Debounced search
const debouncedSearch = useCallback(
  debounce(async (query: string) => {
    if (query.length < 2) return;
    
    try {
      const response = await api.get(`api/searchMovie/${query}/`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
    }
  }, 500),
  []
);

// Usage
<TextInput
  value={searchQuery}
  onChangeText={(text) => {
    setSearchQuery(text);
    debouncedSearch(text);
  }}
  placeholder="Search movies..."
/>
```

---

## 🎨 UI/UX Design Principles

### Color Scheme
- **Primary Background:** `#000000` (Black)
- **Secondary Background:** `rgba(0, 0, 0, 0.5)` (Semi-transparent black)
- **Primary Text:** `#FFFFFF` (White)
- **Accent Color:** `#E50914` (Netflix-inspired red)
- **Button Colors:**
  - Primary: `#E50914`
  - Secondary: `#333333`
  - Success: `#4CAF50`
  - Warning: `#FF9800`

### Typography
- **Headings:** Bold, 24-32px
- **Body Text:** Regular, 14-16px
- **Captions:** Light, 12-14px

### Gradients
- **Poster Overlay:** `linear-gradient(transparent, rgba(0,0,0,0.8))`
- **Button Hover:** `linear-gradient(135deg, #E50914, #CB020C)`

### Animations
- **Page Transitions:** Slide animations (200ms)
- **Card Swipes:** Smooth transform with rotation
- **Loading States:** Fade in/out (300ms)
- **Button Press:** Scale feedback (haptic)

### Responsive Design
- Grid layouts adjust to screen width
- Minimum 2 columns on mobile
- Maximum 4 columns on tablet
- Safe area insets for notched devices

---

## 🔐 Security Considerations

### Backend Security
- **Password Hashing:** PBKDF2 with SHA256
- **CSRF Protection:** Django CSRF middleware
- **Session Security:** HTTP-only cookies
- **SQL Injection:** Django ORM prevents injection
- **Input Validation:** DRF serializers validate input
- **Email Security:** App-specific passwords for Gmail

### Frontend Security
- **Secure Storage:** AsyncStorage for session tokens
- **HTTPS:** All API calls use HTTPS in production
- **No Hardcoded Secrets:** Environment variables for sensitive data
- **Input Sanitization:** XSS prevention through React escaping

### Best Practices Implemented
- Rate limiting on auth endpoints (recommended)
- Password strength requirements
- Email verification for registration
- OTP expiration for password reset
- Session timeout after inactivity

---

## 🚢 Deployment

### Backend Deployment (Recommended: Railway/Render/Heroku)

1. **Prepare for Production:**
```python
# settings.py changes
DEBUG = False
ALLOWED_HOSTS = ['your-domain.com', 'your-app.herokuapp.com']

# Use production database
DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv('DATABASE_URL')
    )
}

# Static files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
```

2. **Create `Procfile`:**
```
web: gunicorn backend.wsgi --log-file -
```

3. **Install Production Dependencies:**
```bash
pip install gunicorn dj-database-url whitenoise
pip freeze > requirements.txt
```

4. **Deploy to Railway:**
```bash
railway login
railway init
railway up
railway open
```

### Frontend Deployment (Expo Build)

1. **Build for Production:**
```bash
# Android APK
eas build --platform android --profile production

# iOS IPA
eas build --platform ios --profile production
```

2. **Publish to Stores:**
- Google Play Store (Android)
- Apple App Store (iOS)

3. **Over-The-Air Updates:**
```bash
eas update --branch production
```

---

## 🧪 Testing

### Backend Tests
```bash
cd MovieVerseBackend/backend
python manage.py test
```

### Frontend Tests
```bash
cd MovieVerseApp
npm test
```

### Manual Testing Checklist
- [ ] User registration flow
- [ ] Login/logout functionality
- [ ] Password reset with OTP
- [ ] Movie search
- [ ] Add/remove from watchlist
- [ ] Movie rating
- [ ] Tinder swipe functionality
- [ ] Mood-based recommendations
- [ ] Rating-based recommendations
- [ ] Profile updates
- [ ] Protected route access

---

## 🐛 Known Issues & Limitations

1. **Cold Start Recommendations:** Users with no ratings receive generic recommendations
2. **Limited Movie Database:** Currently uses a subset of movies (expandable)
3. **TMDB API Rate Limits:** Consider caching poster URLs
4. **Offline Mode:** App requires internet connection
5. **Performance:** Large watchlists may slow down rendering
6. **Scalability:** Recommendation calculation can be slow with many users

---

## 🔮 Future Enhancements

### Planned Features
- [ ] Social features (friends, shared watchlists)
- [ ] Movie trailers and streaming links
- [ ] User reviews and comments
- [ ] Advanced filters (year, genre, rating range)
- [ ] Notification system for new releases
- [ ] Dark/Light theme toggle
- [ ] Multi-language support
- [ ] Offline mode with local caching
- [ ] Movie trivia and fun facts
- [ ] Watch history tracking
- [ ] Export watchlist functionality

### ML Improvements
- [ ] Deep learning for better recommendations (Neural Collaborative Filtering)
- [ ] Sentiment analysis on user reviews
- [ ] Image-based recommendations (poster similarity)
- [ ] Time-aware recommendations (trending by week/month)
- [ ] Ensemble methods combining multiple algorithms

### Performance Optimizations
- [ ] Redis caching for API responses
- [ ] CDN for movie posters
- [ ] Database query optimization
- [ ] Lazy loading for images
- [ ] Virtual lists for large datasets

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### How to Contribute

1. **Fork the Repository**
```bash
git clone https://github.com/yourusername/MovieVerse.git
cd MovieVerse
git checkout -b feature/your-feature-name
```

2. **Make Changes**
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

3. **Test Your Changes**
```bash
# Backend
python manage.py test

# Frontend
npm test
```

4. **Submit Pull Request**
   - Describe changes clearly
   - Reference any related issues
   - Include screenshots for UI changes

### Code Style Guidelines

**Python (Backend):**
- Follow PEP 8
- Use type hints where applicable
- Document functions with docstrings

**TypeScript (Frontend):**
- Use functional components
- Prefer hooks over class components
- PropTypes or TypeScript interfaces

**Commit Messages:**
- Use conventional commits format
- Examples:
  - `feat: add movie filtering by genre`
  - `fix: resolve login session timeout issue`
  - `docs: update API documentation`

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team & Credits

### Development Team
- **Lead Developer:** [Your Name]
- **Backend Developer:** [Name]
- **Frontend Developer:** [Name]
- **ML Engineer:** [Name]

### Special Thanks
- **TMDB API** for movie data and posters
- **Expo Team** for React Native framework
- **Django Community** for excellent documentation
- **scikit-learn** for ML libraries

---

## 📞 Support & Contact

### Get Help
- **Issues:** [GitHub Issues](https://github.com/yourusername/MovieVerse/issues)
- **Email:** support@movieverse.com
- **Discord:** [Join our server]
- **Documentation:** [Wiki](https://github.com/yourusername/MovieVerse/wiki)

### FAQ

**Q: How do I reset my password?**  
A: Use the "Forgot Password" link on the login page and follow the OTP verification process.

**Q: Why are my recommendations not changing?**  
A: Rate more movies (minimum 5) to improve recommendation accuracy.

**Q: Can I use this app without internet?**  
A: Currently, an internet connection is required for all features.

**Q: How often is the movie database updated?**  
A: Movies are updated weekly via TMDB API.

**Q: Is my data secure?**  
A: Yes, we use industry-standard encryption and secure authentication.

---

## 📊 Project Statistics

- **Total Lines of Code:** ~15,000+
- **Backend Endpoints:** 30+
- **Frontend Components:** 25+
- **ML Models:** 3
- **Database Tables:** 8
- **Supported Platforms:** iOS, Android
- **Languages Used:** TypeScript, Python, JavaScript

---

## 🙏 Acknowledgments

This project was built as a learning experience in full-stack development, mobile app development, and machine learning integration. It demonstrates:
- Modern React Native development with Expo
- RESTful API design with Django
- Machine Learning integration in production
- User authentication and authorization
- Real-time data processing
- Responsive UI/UX design

Thank you for exploring MovieVerse! 🎬🍿

---

**Last Updated:** January 22, 2026  
**Version:** 1.0.0  
**Status:** Active Development
