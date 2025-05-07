import { View, Text, StyleSheet, Animated } from 'react-native'
import React, { useEffect, useRef } from 'react'
import styles from '@/styles/loadingPage'

const LoadingPage = () => {
  const fillHeight = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fillHeight, {
      toValue: 220, 
      duration: 10000, 
      useNativeDriver: false, 
    }).start();
  }, []);
  
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
          <Text style={styles.rotate}>MV</Text>
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

