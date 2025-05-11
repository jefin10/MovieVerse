import { StyleSheet, Text, View, Image, ImageBackground, Dimensions, Modal, Animated } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import styles from '@/styles/tinder'
import { ArrowRight, CheckCircle } from 'lucide-react-native'
import Swiper from 'react-native-deck-swiper'
import tinderMovieCard from '../components/tinderMovieCard'
import ProtectedRoute from '../auth/protectedRoute';

const tinder = () => {
  const swiperRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
  const [currentMovie, setCurrentMovie] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const movies = [
    {
      title: 'The Dark Knight',
      description: 'The Dark Knight was the first comic book movie to win an Oscar for acting—thanks to Heath Ledger\'s Joker.',
      image: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkC8Y2j3v4t1zX2a.jpg',
      imRating: '8.4',
      ourRating: '9.0',
      genre: 'Action, Crime, Drama'
    },
    {
      title: 'Inception',
      description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.',
      image: 'https://image.tmdb.org/t/p/w500/8hP9c4g2j3v4t1zX2a.jpg',
      imRating: '8.8',
      ourRating: '9.5',
      genre: 'Action, Adventure, Science Fiction'
    },
    {
      title: 'Interstellar',
      description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
      image: 'https://image.tmdb.org/t/p/w500/8hP9c4g2j3v4t1zX2a.jpg',
      imRating: '8.6',
      ourRating: '9.2',
      genre: 'Adventure, Drama, Science Fiction'
    }
  ];

  // Handler for when a card is swiped
  const handleSwiped = (cardIndex, direction) => {
    console.log(`Swiped ${direction} on card at index ${cardIndex}`);
    
    if (direction === 'right') {
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
        <Swiper
          ref={swiperRef}
          cards={movies}
          renderCard={tinderMovieCard}
          onSwiped={(cardIndex) => {console.log(`Swiped card at index ${cardIndex}`)}}
          onSwipedRight={(cardIndex) => handleSwiped(cardIndex, 'right')}
          onSwipedLeft={(cardIndex) => handleSwiped(cardIndex, 'left')}
          onSwipedAll={() => {console.log('All cards swiped!')}}
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