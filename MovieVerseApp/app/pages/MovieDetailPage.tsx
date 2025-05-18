import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar, 
  StyleSheet,
  Dimensions,
  ActivityIndicator, 
  Animated,
  ImageBackground,
  Linking,
  Alert
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../auth/api';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

interface MovieDetail {
  id: number;
  title: string;
  description: string;
  poster_url: string;
  director?: string;
  star1?: string;
  star2?: string;
  release_date?: string;
  imdb_rating?: number;
  genres?: string[];
  inWatchlist?: boolean;
}

const { width, height } = Dimensions.get('window');

export default function MovieDetailPage() {
  const { movieId } = useLocalSearchParams();
  const router = useRouter();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistItemId, setWatchlistItemId] = useState<number | null>(null);
  const scrollY = new Animated.Value(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);


  // Fetch movie details and check if in watchlist

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const storedUsername = await AsyncStorage.getItem('username');
        setUsername(storedUsername || '');
        
        // Fetch movie details
        const response = await api.get(`api/fetchMovieInfo/${movieId}`);
        
        if (response.data) {
          const movieData: MovieDetail = {
            id: Number(movieId),
            title: response.data.title || 'Unknown Title',
            description: response.data.movie_info || 'No description available',
            poster_url: response.data.poster_url || '',
            director: response.data.director,
            star1: response.data.star1,
            star2: response.data.star2,
            release_date: response.data.release_date,
            imdb_rating: response.data.imdb_rating,
            genres: response.data.genres || []
          };
          
          setMovie(movieData);
          
          // Check if movie is in user's watchlist
          if (storedUsername) {
            checkWatchlist(Number(movieId), storedUsername);
            checkUserRating(Number(movieId), storedUsername);
          }
        }
      } catch (error) {
        console.error('Error fetching movie details:', error);
        Alert.alert('Error', 'Failed to load movie details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    getUserRating();
    fetchData();
  }, [movieId]);

  // Check if movie is in user's watchlist
  const checkWatchlist = async (movieId: number, username: string) => {
    try {
      const sessionid = await AsyncStorage.getItem('sessionid');
      const csrftoken = await AsyncStorage.getItem('csrftoken');
      
      if (!sessionid || !csrftoken) {
        console.warn('Missing authentication tokens');
        return;
      }
      
      const response = await api.post(
        'api/watchlist/',
        { username },
        {
          headers: {
            'X-CSRFToken': csrftoken,
            Cookie: `sessionid=${sessionid}; csrftoken=${csrftoken}`,
          },
        }
      );
      
      // Check if current movie is in watchlist
      const watchlistItem = response.data.find(item => item.movie_id === movieId);
      if (watchlistItem) {
        setInWatchlist(true);
        setWatchlistItemId(watchlistItem.id);
      } else {
        setInWatchlist(false);
        setWatchlistItemId(null);
      }
    } catch (error) {
      console.error('Error checking watchlist:', error);
    }
  };

  // Check if user has already rated this movie
  const checkUserRating = async (movieId: number, username: string) => {
    try {
      const sessionid = await AsyncStorage.getItem('sessionid');
      const csrftoken = await AsyncStorage.getItem('csrftoken');
      
      if (!sessionid || !csrftoken) {
        console.warn('Missing authentication tokens');
        return;
      }
      
      const response = await api.get(
        `api/movie/${movieId}/rating/`,
        {
          headers: {
            'X-CSRFToken': csrftoken,
            Cookie: `sessionid=${sessionid}; csrftoken=${csrftoken}`,
          },
          params: { username }
        }
      );
      
      if (response.data && response.data.rating) {
        setUserRating(response.data.rating);
        setRatingSubmitted(true);
      }
    } catch (error) {
      console.log('Error checking user rating:', error);
    }
  };

  // Add movie to watchlist
  const addToWatchlist = async () => {
    if (!movie || !username) return;
    
    try {
      const sessionid = await AsyncStorage.getItem('sessionid');
      const csrftoken = await AsyncStorage.getItem('csrftoken');
      
      if (!sessionid || !csrftoken) {
        Alert.alert('Error', 'Authentication required. Please login again.');
        return;
      }
      
      const response = await api.post(
        'api/watchlist/add/',
        {
          username: username,
          movie_id: movie.id
        },
        {
          headers: {
            'X-CSRFToken': csrftoken,
            Cookie: `sessionid=${sessionid}; csrftoken=${csrftoken}`,
          },
        }
      );
      
      setInWatchlist(true);
      setWatchlistItemId(response.data.id);
      Alert.alert('Success', 'Added to watchlist');
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      Alert.alert('Error', 'Failed to add to watchlist. Please try again.');
    }
  };

  // Remove movie from watchlist
  const removeFromWatchlist = async () => {
    if (!watchlistItemId) return;
    
    try {
      const sessionid = await AsyncStorage.getItem('sessionid');
      const csrftoken = await AsyncStorage.getItem('csrftoken');
      
      if (!sessionid || !csrftoken) {
        Alert.alert('Error', 'Authentication required. Please login again.');
        return;
      }
      
      await api.delete(
        `api/watchlist/remove/${watchlistItemId}/`,
        {
          data: { username },
          headers: {
            'X-CSRFToken': csrftoken,
            Cookie: `sessionid=${sessionid}; csrftoken=${csrftoken}`,
          },
        }
      );
      
      setInWatchlist(false);
      setWatchlistItemId(null);
      Alert.alert('Success', 'Removed from watchlist');
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      Alert.alert('Error', 'Failed to remove from watchlist. Please try again.');
    }
  };

  // Rate movie
  const rateMovie = async (rating: number) => {
    if (!movie || !username) return;
    
    try {
      const sessionid = await AsyncStorage.getItem('sessionid');
      const csrftoken = await AsyncStorage.getItem('csrftoken');
      
      if (!sessionid || !csrftoken) {
        Alert.alert('Error', 'Authentication required. Please login again.');
        return;
      }
      
      const response = await api.post(
        `api/addRatings/`,
        {
          username: username,
          rating: rating,
          movie_id: movie.id
        },
        {
          headers: {
            'X-CSRFToken': csrftoken,
            Cookie: `sessionid=${sessionid}; csrftoken=${csrftoken}`,
          },
        }
      );
      
      setUserRating(rating);
      setRatingSubmitted(true);
      Alert.alert('Thank You!', 'Your rating has been submitted.');
    } catch (error) {
      console.error('Error rating movie:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    }
  };

  const getUserRating= async()=>{
    try{
      console.log(username)
      const username2= await AsyncStorage.getItem('username');
      const result= await api.get(`api/getRatings/${username2}/${movieId}/`);
      if(result.data){
        setUserRating(result.data.rating);
      }
    }catch(error){
      console.error('Error fetching user rating:', error);
    }
  }
  // Open YouTube to search for movie trailer
  const watchTrailer = () => {
    if (!movie) return;
    
    const searchQuery = encodeURIComponent(`${movie.title} trailer`);
    const youtubeUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
    
    Linking.canOpenURL(youtubeUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(youtubeUrl);
        } else {
          Alert.alert('Error', 'Cannot open YouTube');
        }
      })
      .catch((error) => {
        console.error('Error opening YouTube:', error);
        Alert.alert('Error', 'Failed to open YouTube');
      });
  };

  // Dynamic header opacity based on scroll position
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100, 150],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  // Parallax effect for poster image
  const imageTranslateY = scrollY.interpolate({
    inputRange: [-300, 0, 300],
    outputRange: [50, 0, -50],
    extrapolate: 'clamp',
  });

  // Configure onScroll handler for Animated ScrollView
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }
  
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Animated header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {movie?.title}
        </Text>
        <View style={{ width: 40 }} />
      </Animated.View>
      
      <Animated.ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Hero Section with Poster */}
        <View style={styles.heroContainer}>
          {movie?.poster_url ? (
            <Animated.View style={[styles.posterContainer, { transform: [{ translateY: imageTranslateY }] }]}>
              <ImageBackground
                source={{ uri: movie.poster_url }}
                style={styles.posterBackground}
                blurRadius={3}
              >
                <LinearGradient
                  colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.9)']}
                  style={styles.gradient}
                >
                  <Image 
                    source={{ uri: movie.poster_url }} 
                    style={styles.poster}
                    resizeMode="cover"
                  />
                </LinearGradient>
              </ImageBackground>
            </Animated.View>
          ) : (
            <View style={styles.noPoster} />
          )}
        </View>
        
        {/* Movie Details */}
        <View style={styles.detailsContainer}>
          {/* Title and Rating */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{movie?.title}</Text>
            {movie?.imdb_rating && (
              <View style={styles.ratingContainer}>
                <FontAwesome name="star" size={16} color="#FFD700" />
                <Text style={styles.rating}>{movie.imdb_rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
          
          {/* Release Date */}
          {movie?.release_date && (
            <Text style={styles.releaseDate}>
              Released: {new Date(movie.release_date).getFullYear()}
            </Text>
          )}
          
          {/* Genres */}
          {movie?.genres && movie.genres.length > 0 && (
            <View style={styles.genresContainer}>
              {movie.genres.map((genre, index) => (
                <View key={index} style={styles.genreTag}>
                  <Text style={styles.genreText}>{genre}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Action Buttons - Removed Share button */}
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={inWatchlist ? removeFromWatchlist : addToWatchlist}
            >
              {inWatchlist ? (
                <Feather name="check" color="#fff" size={20} />
              ) : (
                <Feather name="plus" color="#fff" size={20} />
              )}
              <Text style={styles.actionText}>
                {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={watchTrailer}
            >
              <Feather name="play" color="#fff" size={20} />
              <Text style={styles.actionText}>Watch Trailer</Text>
            </TouchableOpacity>
          </View>
          
          {/* Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.description}>{movie?.description}</Text>
          </View>
          
          {/* Cast & Crew */}
          {(movie?.director || movie?.star1 || movie?.star2) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cast & Crew</Text>
              
              {movie?.director && (
                <View style={styles.personRow}>
                  <Text style={styles.personRole}>Director:</Text>
                  <Text style={styles.personName}>{movie.director}</Text>
                </View>
              )}
              
              {movie?.star1 && (
                <View style={styles.personRow}>
                  <Text style={styles.personRole}>Starring:</Text>
                  <Text style={styles.personName}>{movie.star1}</Text>
                </View>
              )}
              
              {movie?.star2 && (
                <View style={styles.personRow}>
                  <Text style={styles.personRole}></Text>
                  <Text style={styles.personName}>{movie.star2}</Text>
                </View>
              )}
            </View>
          )}
          
          {/* Rate this movie section */}

          <View style={styles.rateContainer}>
            <Text style={styles.rateTitle}>How would you rate this movie?</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity 
                  key={star} 
                  style={styles.starButton}
                  onPress={() => rateMovie(star)}
                >
                  <FontAwesome 
                    name="star" 
                    size={32} 
                    color={userRating && star <= userRating ? "#FFD700" : "transparent"} 
                    solid={userRating && star <= userRating}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {ratingSubmitted && (
              <Text style={styles.ratingSubmitted}>
                Thanks for rating!
              </Text>
            )}
          </View>

          
          {/* Space at bottom */}
          <View style={{ height: 40 }} />
        </View>
      </Animated.ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  userRatingText: {
  color: '#999',
  fontSize: 14,
  textAlign: 'center',
  marginTop: 12,
},
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#000',
    zIndex: 1000,
    paddingTop: StatusBar.currentHeight,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  heroContainer: {
    width: '100%',
    height: height * 0.65,
    overflow: 'hidden',
  },
  posterContainer: {
    width: '100%',
    height: '100%',
  },
  posterBackground: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  poster: {
    width: width * 0.7,
    height: height * 0.5,
    borderRadius: 12,
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15,
  },
  noPoster: {
    width: '100%',
    height: '100%',
    backgroundColor: '#222',
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: '#000',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: -40,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rating: {
    color: '#FFD700',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  releaseDate: {
    color: '#999',
    fontSize: 14,
    marginBottom: 16,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  genreTag: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  genreText: {
    color: '#fff',
    fontSize: 12,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Modified to fit two buttons
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  actionText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: '#ccc',
    fontSize: 15,
    lineHeight: 22,
  },
  personRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  personRole: {
    color: '#999',
    fontSize: 14,
    width: 70,
  },
  personName: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  rateContainer: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  rateTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  starButton: {
    marginHorizontal: 8,
  },
  ratingSubmitted: {
    color: '#4CAF50',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  }
});