import { View, Text, StyleSheet, Animated } from 'react-native'
import React, { useEffect, useRef } from 'react'

const LoadingPage = () => {
  // Create an animated value for the fill height
  const fillHeight = useRef(new Animated.Value(0)).current;
  
  // Start the animation when component mounts
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
          {/* Base gray square */}
          <View style={styles.square}>
            {/* Direct fill without wrapper - simpler approach */}
            <Animated.View 
              style={[
                styles.fill, 
                { height: fillHeight }
              ]} 
            />
          </View>
          {/* Text stays on top */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'space-between', 
    paddingVertical: 50, 
  },
  mainContent: {
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center', 
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 40, 
    
  },
  squareContainer: {
    width: 140,
    height: 140,
    marginTop: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  square: {
    width: 140,
    height: 140,
    backgroundColor: '#999999',
    position: 'absolute',
    transform: [{ rotate: '45deg' }], // Rotation is back
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    bottom: 0,
    left: -20,
    right: 0, 
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }, { scale: 1.5 }, { translateY: 60 }], // Counter-rotate and scale to ensure full coverage
  },
  rotate: {
    fontSize: 70,
    fontWeight: 'bold',
    zIndex: 2,
    //transform: [{ rotate: '-45deg' }], // Counter-rotate text to appear straight
  },
  factContainer: {
    width: '80%',
    alignItems: 'center',
    marginBottom: 30, 
    padding: 15,
  },
  factTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  factText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 24,
  }
})