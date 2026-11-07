import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { moodStyles } from '@/styles/mood'
import { useRouter } from 'expo-router'

const MovieGrid = ({ movies = [], mood  }) => {
  const router = useRouter();

  // Movie data object organized by mood (fallback if API returns no results)
  const moviesByMood = {
    Happy: [
      { id: 1, title: 'The Intouchables', image: require('@/assets/placeholder-movie.png') },
      { id: 2, title: 'Legally Blonde', image: require('@/assets/placeholder-movie.png') },
      { id: 3, title: 'School of Rock', image: require('@/assets/placeholder-movie.png') },
      { id: 4, title: 'Mamma Mia!', image: require('@/assets/placeholder-movie.png') },
      { id: 5, title: 'Little Miss Sunshine', image: require('@/assets/placeholder-movie.png') },
      { id: 6, title: 'Sister Act', image: require('@/assets/placeholder-movie.png') },
    ],
    Sad: [
      { id: 1, title: 'The Notebook', image: require('@/assets/placeholder-movie.png') },
      { id: 2, title: 'Eternal Sunshine', image: require('@/assets/placeholder-movie.png') },
      { id: 3, title: 'The Fault in Our Stars', image: require('@/assets/placeholder-movie.png') },
      { id: 4, title: 'Marley & Me', image: require('@/assets/placeholder-movie.png') },
      { id: 5, title: 'A Star is Born', image: require('@/assets/placeholder-movie.png') },
      { id: 6, title: 'Titanic', image: require('@/assets/placeholder-movie.png') },
    ],
    Romantic: [
      { id: 1, title: 'Pride & Prejudice', image: require('@/assets/placeholder-movie.png') },
      { id: 2, title: 'Before Sunrise', image: require('@/assets/placeholder-movie.png') },
      { id: 3, title: 'The Proposal', image: require('@/assets/placeholder-movie.png') },
      { id: 4, title: 'La La Land', image: require('@/assets/placeholder-movie.png') },
      { id: 5, title: '10 Things I Hate About You', image: require('@/assets/placeholder-movie.png') },
      { id: 6, title: 'Crazy Rich Asians', image: require('@/assets/placeholder-movie.png') },
    ],
    Horror: [
      { id: 1, title: 'The Conjuring', image: require('@/assets/placeholder-movie.png') },
      { id: 2, title: 'Hereditary', image: require('@/assets/placeholder-movie.png') },
      { id: 3, title: 'Get Out', image: require('@/assets/placeholder-movie.png') },
      { id: 4, title: 'The Shining', image: require('@/assets/placeholder-movie.png') },
      { id: 5, title: 'It Follows', image: require('@/assets/placeholder-movie.png') },
      { id: 6, title: 'A Quiet Place', image: require('@/assets/placeholder-movie.png') },
    ],
    Adventurous: [
      { id: 1, title: 'Indiana Jones', image: require('@/assets/placeholder-movie.png') },
      { id: 2, title: 'The Mummy', image: require('@/assets/placeholder-movie.png') },
      { id: 3, title: 'Jurassic Park', image: require('@/assets/placeholder-movie.png') },
      { id: 4, title: 'Pirates of the Caribbean', image: require('@/assets/placeholder-movie.png') },
      { id: 5, title: 'The Lord of the Rings', image: require('@/assets/placeholder-movie.png') },
      { id: 6, title: 'Mad Max: Fury Road', image: require('@/assets/placeholder-movie.png') },
    ],
    // Default for custom moods or moods not in the predefined list
    default: [
      { id: 1, title: 'The Shawshank Redemption', image: require('@/assets/placeholder-movie.png') },
      { id: 2, title: 'The Godfather', image: require('@/assets/placeholder-movie.png') },
      { id: 3, title: 'Pulp Fiction', image: require('@/assets/placeholder-movie.png') },
      { id: 4, title: 'The Dark Knight', image: require('@/assets/placeholder-movie.png') },
      { id: 5, title: 'Inception', image: require('@/assets/placeholder-movie.png') },
      { id: 6, title: 'Forrest Gump', image: require('@/assets/placeholder-movie.png') },
    ]
  };

const ensureSixMovies = (movieList) => {
  if (movieList.length === 0) return [];
  
  // If we have less than 6, duplicate some movies
  if (movieList.length < 6) {
    const extraNeeded = 6 - movieList.length;
    const extraMovies = [...Array(extraNeeded)].map((_, i) => 
      movieList[i % movieList.length]
    );
    return [...movieList, ...extraMovies];
  }
  
  // If we have more than 6, take 6 random movies
  if (movieList.length > 6) {
    const shuffled = [...movieList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  }
  
  // Exactly 6 movies
  return movieList;
};
  // Determine which movies to show - use API data if available, otherwise use static data
  const processMovies = movies.length > 0 
    ? movies.map(movie => ({
        id: movie.id || movie.movie_id,
        title: movie.title || movie.Series_Title,
        poster_url: movie.poster_url,
        description: movie.description || movie.overview,
        imdb_rating: movie.imdb_rating || movie.rating,
        director: movie.director,
        genres: movie.genres || (movie.genre ? [movie.genre] : [])
      }))
    : (moviesByMood[mood] || moviesByMood.default);
  
  // Ensure exactly 6 movies
  const moviesToShow = ensureSixMovies(processMovies);

  const handleMoviePress = (movie) => {
    // Navigate to movie details page with the movie ID
    router.push({
      pathname: '/pages/MovieDetailPage',
      params: { movieId: movie.id }
    });
  };

  return (
    <View style={moodStyles.movieGrid}>
      {moviesToShow.map((movie, index) => (
        <TouchableOpacity 
          key={`${movie.id}-${index}`}
          style={moodStyles.movieGridItem}
          onPress={() => handleMoviePress(movie)}
        >
          <View style={moodStyles.movieThumbnail}>
            {movie.poster_url ? (
              <Image 
                source={{ uri: movie.poster_url.startsWith('http') ? 
                  movie.poster_url : 
                  `https://image.tmdb.org/t/p/w500${movie.poster_url}` }} 
                style={moodStyles.movieImage}
                resizeMode="cover"
              />
            ) : (
              <Image 
                source={require('@/assets/placeholder-movie.png')} 
                style={moodStyles.movieImage}
                resizeMode="cover"
              />
            )}
          </View>
          <Text style={moodStyles.movieTitle}>{movie.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

export default MovieGrid;