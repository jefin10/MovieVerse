import { Text, View, Animated, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import styles from '@/styles/tinder'
import { Feather } from '@expo/vector-icons'
import ProtectedRoute from '../auth/protectedRoute';
import api from '../auth/api'
import TinderMovieCard from '../components/tinderMovieCard'
import AsyncStorage from '@react-native-async-storage/async-storage'
import CustomSwiper from '../components/CustomSwiper'
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTinderMovies, invalidateWatchlistCache, type AppMovie } from '../services/movieData';

type SwipeDirection = 'left' | 'right';

const Tinder = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [currentMovie, setCurrentMovie] = useState<AppMovie | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [movies, setMovies] = useState<AppMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const isFetchingMoviesRef = useRef(false);
  
  // Create a ref to store processed IDs
  const processedMovieIdsRef = useRef<Set<number>>(new Set());
  
  // Track the current card index separately
  const currentIndexRef = useRef(0);
  
  // Debug flag
  const DEBUG = true;
  
  // Debug log function
  const debug = (...args: unknown[]) => {
    if (DEBUG) console.log(...args);
  };

  const getMovies = async (forceRefresh = false) => {
    if (isFetchingMoviesRef.current) {
      return;
    }

    isFetchingMoviesRef.current = true;
    try {
      setIsLoading(true);

      // Try multiple fresh batches before concluding the unseen pool is exhausted.
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const fetchedMovies = await getTinderMovies({ forceRefresh: forceRefresh || attempt > 0 });

        const processedIds = processedMovieIdsRef.current;
        debug("Currently processed IDs:", [...processedIds]);

        const filteredMovies = fetchedMovies.filter((movie) => {
          const isProcessed = processedIds.has(movie.id);
          debug(`Movie ${movie.id} (${movie.title}) processed? ${isProcessed}`);
          return !isProcessed;
        });

        debug(`Filtered ${fetchedMovies.length - filteredMovies.length} movies, showing ${filteredMovies.length}`);

        if (filteredMovies.length > 0) {
          currentIndexRef.current = 0;
          setMovies(filteredMovies);
          return;
        }
      }

      // If all fetched cards were already seen, reset and show a fresh deck.
      debug('No unseen movies left. Resetting processed IDs for a fresh deck.');
      processedMovieIdsRef.current = new Set();
      const refreshedMovies = await getTinderMovies({ forceRefresh: true });
      currentIndexRef.current = 0;
      setMovies(refreshedMovies);
    }
    catch (error) {
      console.error('Error fetching movies:', error);
      setMovies([]);
    } finally {
      setIsLoading(false);
      isFetchingMoviesRef.current = false;
    }
  };

  useEffect(() => {
    const getUsername = async () => {
      let user2 = await AsyncStorage.getItem('username');
      setUsername(user2);
    }

    getUsername();
    getMovies();
    
    // Reset processed movies when component unmounts
    return () => {
      processedMovieIdsRef.current = new Set();
      currentIndexRef.current = 0;
    };
  }, []);

  const addToWatchlist = async (movie: AppMovie) => {
    if (!movie || !movie.id) {
      debug('Invalid movie object');
      return;
    }
    
    if (processedMovieIdsRef.current.has(movie.id)) {
      debug(`Movie ${movie.id} (${movie.title}) already processed`);
      return;
    }
    
    try {
      processedMovieIdsRef.current.add(movie.id);
      debug(`Marking movie ${movie.id} (${movie.title}) as processed`);
      
      await api.post('api/watchlist/add/', 
        { 
          username, 
          movie_id: movie.id 
        }
      );

      if (username) {
        await invalidateWatchlistCache(username);
      }
      
      debug(`Successfully added movie ${movie.id} - ${movie.title} to watchlist`);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      processedMovieIdsRef.current.delete(movie.id);
    }
  };

  // Core fix: use the event's cardIndex to advance our tracker
  const handleSwiped = (direction: SwipeDirection) => {
    // Get the movie at the current index (before advancing)
    const movieIndex = currentIndexRef.current;
    const swipedMovie = movies[movieIndex];
    
    // Advance the index immediately after getting the current movie
    currentIndexRef.current += 1;
    debug(`Advanced current index to ${currentIndexRef.current}`);
    
    if (!swipedMovie) {
      debug(`No movie found at index ${movieIndex}`);
      return;
    }
    
    debug(`Swiped ${direction} on movie ${swipedMovie.id} (${swipedMovie.title}) at index ${movieIndex}`);
    
    if (direction === 'right') {
      // Make a local copy of the movie
      const movieToAdd = {...swipedMovie};
      
      // Show popup
      setCurrentMovie(movieToAdd);
      setShowPopup(true);
      
      // Add to watchlist
      addToWatchlist(movieToAdd);
      
      // Animate popup
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Auto hide popup after 2 seconds
      setTimeout(() => {
        hidePopup();
      }, 2000);
    } else {
      // Mark left-swiped movies as processed too
      processedMovieIdsRef.current.add(swipedMovie.id);
      debug(`Marked left-swiped movie ${swipedMovie.id} (${swipedMovie.title}) as processed`);
    }
  };
  
  const hidePopup = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowPopup(false);
    });
  };

  const handleAllSwiped = () => {
    debug("All cards swiped, getting more movies");
    getMovies(true);
  };

  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.label}>Feel a Match?</Text>
          <View style={styles.swipeIndicator}>
            <Text style={styles.label_desc}>Swipe right</Text>
            <Feather name="arrow-right" color="#999999" size={24}/>
          </View>
        </View>
        
        <View style={styles.swiperContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.loadingText}>Loading movies...</Text>
            </View>
          ) : movies && movies.length > 0 ? (
            <CustomSwiper
              cards={movies}
              renderCard={(card: AppMovie) => {
                if (!card) return null;
                return <TinderMovieCard {...card} />;
              }}
              onSwiped={(cardIndex) => {
                debug(`Card ${cardIndex} was swiped, current internal index: ${currentIndexRef.current}`);
              }}
              onSwipedRight={() => handleSwiped('right')}
              onSwipedLeft={() => handleSwiped('left')}
              onSwipedAll={handleAllSwiped}
              cardIndex={0}
              backgroundColor={'transparent'}
              stackSize={3}
              stackSeparation={15}
              cardVerticalMargin={10}
              animateCardOpacity
              overlayLabels={{
                left: {
                  title: 'REJECT',
                  style: {
                    label: {
                      backgroundColor: '#FF0000',
                      color: '#FFFFFF',
                      fontSize: 24,
                      borderRadius: 5,
                      padding: 10,
                      fontWeight: 'bold',
                      textAlign: 'center',
                    },
                    wrapper: {
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      justifyContent: 'flex-start',
                      marginTop: 30,
                      marginLeft: -30
                    }
                  }
                },
                right: {
                  title: 'Add to Watchlist',
                  style: {
                    label: {
                      backgroundColor: '#00FF00',
                      color: '#FFFFFF',
                      fontSize: 24,
                      borderRadius: 5,
                      padding: 10,
                      fontWeight: 'bold',
                      textAlign: 'center',
                    },
                    wrapper: {
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'flex-start',
                      marginTop: 30,
                      marginLeft: 30
                    }
                  }
                }
              }}
            />
          ) : (
            <View style={styles.noMoviesContainer}>
              <Text style={styles.noMoviesText}>No more movies available</Text>
              <TouchableOpacity 
                style={styles.refreshButton} 
                onPress={() => {
                  processedMovieIdsRef.current = new Set(); // Clear processed IDs
                  debug("Reset processed movies and refreshing list");
                  getMovies(true);
                }}
              >
                <Text style={styles.refreshButtonText}>Find More Movies</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Popup notification */}
        {showPopup && currentMovie && (
          <Animated.View 
            style={[
              styles.simplifiedPopup, 
              { opacity: fadeAnim }
            ]}
          >
            <View style={styles.simplifiedPopupContent}>
              <Feather name="check-circle" color="#00FF00" size={24} />
              <Text style={styles.simplifiedPopupText}>
                Added {currentMovie.title} to watchlist
              </Text>
            </View>
          </Animated.View>
        )}
      </View>
      </SafeAreaView>
    </ProtectedRoute>
  )
}

export default Tinder