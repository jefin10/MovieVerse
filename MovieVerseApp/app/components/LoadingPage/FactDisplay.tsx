import React from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

interface FactDisplayProps {
  fact: string;
  opacity: Animated.Value;
}

const FactDisplay = ({ fact, opacity }: FactDisplayProps) => {
  return (
    <View style={styles.factContainer}>
      <Text style={styles.factTitle}>Fact of the Day</Text>
      <Animated.Text style={[styles.factText, { opacity }]}>
        {fact}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  factContainer: {
    padding: 20,
    maxWidth: '90%',
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
  },
});

export default FactDisplay;