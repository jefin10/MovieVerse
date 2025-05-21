import React from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

interface LoadingMessageProps {
  show: boolean;
  opacity: Animated.Value;
  dots: string;
}

const LoadingMessage = ({ show, opacity, dots }: LoadingMessageProps) => {
  return (
    <View style={styles.messageContainer}>
      {show && (
        <Animated.Text 
          style={[
            styles.loadingMessage,
            { opacity }
          ]}
        >
          Taking longer than expected. Please wait{dots}
        </Animated.Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    height: 20,
    marginTop: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMessage: {
    color: '#CCCCCC',
    fontSize: 14,
  },
});

export default LoadingMessage;