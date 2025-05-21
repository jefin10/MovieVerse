import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { facts } from '../data/loadingFact';
import { useRouter } from 'expo-router';

export const useLoadingLogic = (fontsLoaded: boolean) => {
  const fillHeight = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const [randomFact, setRandomFact] = useState(''); 
  const [factIndex, setFactIndex] = useState(0); 
  const factOpacity = useRef(new Animated.Value(1)).current;
  const [showLongerMessage, setShowLongerMessage] = useState(false);
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const [dots, setDots] = useState('.');

  // Handle dots animation
  useEffect(() => {
    if (showLongerMessage) {
      const dotsInterval = setInterval(() => {
        setDots(currentDots => {
          if (currentDots === '.') return '..';
          if (currentDots === '..') return '...';
          return '.';
        });
      }, 500);
      
      return () => clearInterval(dotsInterval);
    }
  }, [showLongerMessage]);

  // Initialize loading process
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
      
      // Set up the interval to change facts
      const factInterval = setInterval(() => {
        fadeFactsTransition();
      }, 10000);
      

      checkOnlineStatus();
      

      const messageTimer = setTimeout(() => {
        setShowLongerMessage(true);
        Animated.timing(messageOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true
        }).start();
      }, 10000);
      
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

  // Fade transition between facts
  const fadeFactsTransition = () => {
    Animated.timing(factOpacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true
    }).start(() => {
      setFactIndex(prevIndex => (prevIndex + 1) % facts.length);
      Animated.timing(factOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }).start();
    });
  };

  // Check if backend is online
  const checkOnlineStatus = async () => {
    try {
      const response = await fetch('https://mvbackend-6fr8.onrender.com/api/auth/csrf/');
      if(response.ok){
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.log('Offline');
    }
  };

  return {
    fillHeight,
    randomFact,
    factOpacity,
    showLongerMessage,
    messageOpacity,
    dots
  };
};