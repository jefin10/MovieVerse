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

const Tinder = () => {
  const swiperRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
  const [currentMovie, setCurrentMovie] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState(null);
  const [sessionid, setSessionid] = useState(null);
  const [csrftoken, setCsrfToken] = useState(null);
  
  // Create a ref to store processed IDs
  const processedMovieIdsRef = useRef(new Set());
  
  // Track the current card index separately
  const currentIndexRef = useRef(0);
  
  // Debug flag
  const DEBUG = true;
  
  // Debug log function
  const debug = (...args) => {
    if (DEBUG) console.log(...args);
  };

  const getMovies = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('api/TinderMovies/');
      
      // Get all processed IDs
      const processedIds = processedMovieIdsRef.current;
      debug("Currently processed IDs:", [...processedIds]);
      
      // Filter out movies that have already been processed
      const filteredMovies = response.data.filter(movie => {
        const isProcessed = processedIds.has(movie.id);
        debug(`Movie ${movie.id} (${movie.title}) processed? ${isProcessed}`);
        return !isProcessed;
      });
      
      debug(`Filtered ${response.data.length - filteredMovies.length} movies, showing ${filteredMovies.length}`);
      
      // Reset current index when loading new movies
      currentIndexRef.current = 0;
      setMovies(filteredMovies);
    }
    catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getUsername = async () => {
      let user2 = await AsyncStorage.getItem('username');
      setUsername(user2);
    }
    const getSessionCookie = async () => {
      const sessionid = await AsyncStorage.getItem('sessionid');
      const csrftoken = await AsyncStorage.getItem('csrftoken');
      setSessionid(sessionid);
      setCsrfToken(csrftoken);
    }
    getSessionCookie();
    getUsername();
    getMovies();
    
    // Reset processed movies when component unmounts
    return () => {
      processedMovieIdsRef.current = new Set();
      currentIndexRef.current = 0;
    };
  }, []);

  const addToWatchlist = async (movie) => {
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
        },
        { 
          headers: {
            'X-CSRFToken': csrftoken,
            'Cookie': `sessionid=${sessionid}; csrftoken=${csrftoken}`
          }
        }
      );
      
      debug(`Successfully added movie ${movie.id} - ${movie.title} to watchlist`);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      processedMovieIdsRef.current.delete(movie.id);
    }
  };

  // Core fix: use the event's cardIndex to advance our tracker
  const handleSwiped = (direction) => {
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
    getMovies();
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
              ref={swiperRef}
              cards={movies}
              renderCard={(card) => {
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
                  getMovies();
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