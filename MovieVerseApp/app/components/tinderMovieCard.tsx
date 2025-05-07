import { View, Text, ImageBackground } from 'react-native'
import React from 'react'
import styles from '@/styles/tinder'
const tinderMovieCard = (movie) => {
    return (
        <View style={styles.movieCard}>
          <ImageBackground 
            source={{ uri: movie.image }} 
            style={styles.movieImage}
            resizeMode="cover"
          >
            <View style={styles.movieContentOverlay}>
              <Text style={styles.movieTitle}>{movie.title}</Text>
              <Text style={styles.movieDescription}>{movie.description}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.movieRating}>IMDB: {movie.imRating}</Text>
                <Text style={styles.movieOurRating}>Our: {movie.ourRating}</Text>
              </View>
              <Text style={styles.movieGenre}>{movie.genre}</Text>
            </View>
          </ImageBackground>
        </View>
      );
}

export default tinderMovieCard