import { View, Text, StyleSheet, Animated } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import styles from '@/styles/loadingPage'
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import { useRouter } from 'expo-router';
import { facts } from './data/loadingFact';  // Import the facts array

const LoadingPage = () => {
  const fillHeight = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const [randomFact, setRandomFact] = useState(''); // State to hold the current fact
  const [factIndex, setFactIndex] = useState(0); // State to track current fact index
  const factOpacity = useRef(new Animated.Value(1)).current;
  const [showLongerMessage, setShowLongerMessage] = useState(false);
  const messageOpacity = useRef(new Animated.Value(0)).current;
  
  // Add state for animated dots
  const [dots, setDots] = useState('.');
  
  const [fontsLoaded] = useFonts({
    'StickNoBills-SemiBold': require('../assets/fonts/StickNoBills-Regular.ttf'),
  });

  // Effect for cycling through dot patterns
  useEffect(() => {
    if (showLongerMessage) {
      const dotsInterval = setInterval(() => {
        setDots(currentDots => {
          if (currentDots === '.') return '..';
          if (currentDots === '..') return '...';
          return '.';
        });
      }, 500); // Change dots every 500ms
      
      return () => clearInterval(dotsInterval);
    }
  }, [showLongerMessage]);

  // Select initial random fact and start cycling
  useEffect(() => {
    if (fontsLoaded) {
      // Select a random starting index
      const startIndex = Math.floor(Math.random() * facts.length);
      setFactIndex(startIndex);
      setRandomFact(facts[startIndex]);
      
      // Start the loading bar animation
      Animated.timing(fillHeight, {
        toValue: 220, 
        duration: 15000, 
        useNativeDriver: false, 
      }).start();
      
      // Set up the interval to change facts every 10 seconds
      const factInterval = setInterval(() => {
        // Fade out current fact
        Animated.timing(factOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true
        }).start(() => {
          // Change to next fact
          setFactIndex(prevIndex => (prevIndex + 1) % facts.length);
          // Fade in new fact
          Animated.timing(factOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
          }).start();
        });
      }, 10000); // 10 seconds
      
      // Check online status
      checkOnlineStatus();
      
      // Set a timeout to show the "taking longer" message after 6 seconds
      const messageTimer = setTimeout(() => {
        setShowLongerMessage(true);
        // Fade in the message
        Animated.timing(messageOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true
        }).start();
      }, 6000);
      
      // Clean up interval and timer when component unmounts
      return () => {
        clearInterval(factInterval);
        clearTimeout(messageTimer);
      };
    }
  }, [fontsLoaded]);

  // Update the fact whenever factIndex changes
  useEffect(() => {
    setRandomFact(facts[factIndex]);
  }, [factIndex]);

  const checkOnlineStatus = async () => {
    try {
      // Fix URL - remove the trailing '/s'
      const response = await fetch('https://mvbackend-6fr8.onrender.com/api/auth/csrf/');
      if(response.ok){
        router.replace('/(tabs)/');
      }
    } catch (error) {
      console.log('Offline');
    }
  }
  
  if (!fontsLoaded) {
    return <AppLoading />;
  }
  
  return (
    
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <View style={styles.squareContainer}>
          <View style={styles.square}>
            <Animated.View 
              style={[
                styles.fill, 
                { height: fillHeight }
              ]} 
            />
          </View>
          <Text style={[styles.rotate, { fontFamily: 'StickNoBills-SemiBold' }]}>MV</Text>
        </View>
        <Text style={styles.text}>MovieVerse</Text>
        
        {/* Message container that's always rendered to prevent layout shift */}
        <View style={styles.messageContainer}>
          {showLongerMessage && (
            <Animated.Text 
              style={[
                styles.loadingMessage,
                { opacity: messageOpacity }
              ]}
            >
              Taking longer than expected. Please wait{dots}
            </Animated.Text>
          )}
        </View>
      </View>
  
      <View style={styles.factContainer}>
        <Text style={styles.factTitle}>Fact of the Day</Text>
        {/* Use Animated.Text for smooth fade transition */}
        <Animated.Text style={[styles.factText, { opacity: factOpacity }]}>
          {randomFact}
        </Animated.Text>
      </View>
    </View>
  );
}

export default LoadingPage