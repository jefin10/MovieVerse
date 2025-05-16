import { View, Text, ImageBackground, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import styles from '@/styles/tinder'

// Fix: Make the component a proper function that receives card as a parameter
const TinderMovieCard = (card) => {
    const [expanded, setExpanded] = useState(false);
    
    // Early return if no card provided
    if (!card) return null;
    
    // Character limit for truncated description
    const MAX_CHARS = 100;
    
    // Check if description needs truncation
    const needsTruncation = card.description && card.description.length > MAX_CHARS;
    
    // Get the display text based on expanded state
    const getDisplayText = () => {
        if (!card.description) return "";
        
        if (needsTruncation && !expanded) {
            return `${card.description.substring(0, MAX_CHARS).trim()}...`;
        }
        
        return card.description;
    };
    
    // Format genres with a separator
    const getFormattedGenres = () => {
        if (!card.genres) return 'Unknown Genre';
        
        // If genres is an array, join with a separator
        if (Array.isArray(card.genres)) {
            return card.genres.join(' · '); // Using dot separator for elegant look
        }
        
        // If it's already a string, return as is
        return card.genres;
    };
    
    // Toggle expanded state
    const toggleReadMore = () => {
        setExpanded(!expanded);
    };

    return (
        <View style={styles.movieCard}>
          <ImageBackground 
            source={{ uri: card.poster_url ? `https://image.tmdb.org/t/p/original${card.poster_url}` : 'https://via.placeholder.com/300x450?text=No+Image' }} 
            style={styles.movieImage}
            resizeMode="cover"
          >
            <View style={styles.movieContentOverlay}>
              <Text style={styles.movieTitle}>{card.title || 'Unknown Title'}</Text>
              
              <TouchableOpacity 
                onPress={toggleReadMore} 
                activeOpacity={needsTruncation ? 0.7 : 1}
                disabled={!needsTruncation}
              >
                <View>
                  <Text style={styles.movieDescription}>
                    {getDisplayText()}
                  </Text>
                  
                  {needsTruncation && (
                    <Text style={styles.readMoreText}>
                      {expanded ? 'Show Less' : 'Read More'}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
              
              <View style={styles.ratingContainer}>
                <Text style={styles.movieRating}>IMDB: {card.imdb_rating || 'N/A'}</Text>
                <Text style={styles.movieOurRating}>Our Rating: {card.our_rating || 'N/A'}</Text>
              </View>
              <Text style={styles.movieGenre}>{getFormattedGenres()}</Text>
            </View>
          </ImageBackground>
        </View>
    );
}

export default TinderMovieCard;