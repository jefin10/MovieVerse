import React, { useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

interface LoadingSquareProps {
  fillHeight: Animated.Value;
  fontLoaded: boolean;
}

const LoadingSquare = ({ fillHeight, fontLoaded }: LoadingSquareProps) => {
  return (
    <View style={styles.squareContainer}>
      <View style={styles.square}>
        <Animated.View 
          style={[
            styles.fill, 
            { height: fillHeight }
          ]} 
        />
      </View>
      <Text style={[
        styles.rotate, 
        { fontFamily: fontLoaded ? 'StickNoBills-SemiBold' : undefined }
      ]}>MV</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  squareContainer: {
    position: 'relative',
    width: 80,
    height: 220,
    marginBottom: 20,
  },
  square: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  fill: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
  },
  rotate: {
    position: 'absolute',
    top: 72,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#000',
    fontSize: 40,
    transform: [{ rotate: '-90deg' }],
    zIndex: 10,
  },
});

export default LoadingSquare;