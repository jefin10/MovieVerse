import { View, Text, StyleSheet, Animated } from 'react-native'
import React, { useEffect, useRef } from 'react'
import styles from '@/styles/loadingPage'
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import { useRouter } from 'expo-router';

const LoadingPage = () => {
  const fillHeight = useRef(new Animated.Value(0)).current;
    const router = useRouter();
  const [fontsLoaded] = useFonts({
    'Cool': require('../../assets/fonts/StickNoBills-VariableFont_wght.ttf'),
  });
    if (!fontsLoaded) {
    return <AppLoading />;
  }
  useEffect(() => {
    Animated.timing(fillHeight, {
      toValue: 220, 
      duration: 15000, 
      useNativeDriver: false, 
    }).start();
     checkOnlineStatus();
  }, []);

    const checkOnlineStatus = async () => {
    try {
      const response = await fetch('https://mvbackend-6fr8.onrender.com/api/auth/csrf/');
     if(response.ok){
      router.push('/(tabs)/');
     }
    } catch (error) {
      console.log('Offline');
    }
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
          <Text style={[styles.rotate,{fontFamily:'Cool',fontWeight:'regular'}]}>MV</Text>
        </View>
        <Text style={styles.text}>MovieVerse</Text>
      </View>
  
      <View style={styles.factContainer}>
        <Text style={styles.factTitle}>Fact of the Day</Text>
        <Text style={styles.factText}>The Dark Knight was the first comic book movie to win an Oscar for acting—thanks to Heath Ledger's Joker.</Text>
      </View>
    </View>
  )
}

export default LoadingPage

