import { StyleSheet, Text, View, Image, ImageBackground, Dimensions, Modal, Animated, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import styles from '@/styles/tinder'
import { ArrowRight, CheckCircle } from 'lucide-react-native'
import Swiper from 'react-native-deck-swiper'
import ProtectedRoute from '../auth/protectedRoute';
import api from '../auth/api'
import TinderMovieCard from '../components/tinderMovieCard'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry'
import CustomSwiper from '../components/CustomSwiper'

const tinder = () => {
  const swiperRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
  const [currentMovie, setCurrentMovie] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState(null);
  const [sessionid, setSessionid] = useState(null);
  const [csrftoken, setCsrfToken] = useState(null);

  const getMovies = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('api/TinderMovies/');
      
      setMovies(response.data);

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
  }, []);

  // Add movie to watchlist
  const addToWatchlist = async (movieId) => {
    try {

      await api.post('api/watchlist/add/', { username,movie_id: movieId },
       { headers: {
          'X-CSRFToken': csrftoken,
          'Cookie': `sessionid=${sessionid}; csrftoken=${csrftoken}`
        }}
      );
     
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  // Handler for when a card is swiped
  const handleSwiped = (cardIndex, direction) => {
    
    if (direction === 'right') {
      // Add to watchlist
      const swipedMovie = movies[cardIndex];
      if (swipedMovie && swipedMovie.id) {
        addToWatchlist(swipedMovie.id);
      }
      
      // Show popup when swiped right
      setCurrentMovie(movies[cardIndex]);
      setShowPopup(true);
      
      // Animate the popup
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Auto hide after 2 seconds
      setTimeout(() => {
        hidePopup();
      }, 2000);
    }
  };
  
  // Hide popup with animation
  const hidePopup = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowPopup(false);
    });
  };

  // Handle when all cards are swiped
  const handleAllSwiped = () => {
    getMovies(); // Fetch new movies when all cards are swiped
  };

  return (
    <ProtectedRoute>
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Feel a Match?</Text>
        <View style={styles.swipeIndicator}>
          <Text style={styles.label_desc}>Swipe right</Text>
          <ArrowRight color="#FFFFFF" size={24}/>
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
              // This ensures card is defined before passing to TinderMovieCard
              if (!card) return null;
              return <TinderMovieCard {...card} />;
            }}
            onSwiped={(cardIndex) => {}}
            onSwipedRight={(cardIndex) => handleSwiped(cardIndex, 'right')}
            onSwipedLeft={(cardIndex) => handleSwiped(cardIndex, 'left')}
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
            <Text style={styles.noMoviesText}>No movies available</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={getMovies}>
              <Text style={styles.refreshButtonText}>Try Again</Text>
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
            <CheckCircle color="#00FF00" size={24} />
            <Text style={styles.simplifiedPopupText}>
              Added {currentMovie.title} to watchlist
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
    </ProtectedRoute>
  )
}

export default tinder