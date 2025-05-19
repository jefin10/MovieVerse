import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

interface SwiperProps {
  cards: any[];
  renderCard: (card: any) => React.ReactNode;
  onSwiped?: (cardIndex: number) => void;
  onSwipedLeft?: (cardIndex: number) => void;
  onSwipedRight?: (cardIndex: number) => void;
  onSwipedAll?: () => void;
  cardIndex?: number;
  backgroundColor?: string;
  stackSize?: number;
  stackSeparation?: number;
  cardVerticalMargin?: number;
  animateCardOpacity?: boolean;
  overlayLabels?: {
    left?: {
      title?: string;
      style?: {
        label?: object;
        wrapper?: object;
      };
    };
    right?: {
      title?: string;
      style?: {
        label?: object;
        wrapper?: object;
      };
    };
  };
}

const CustomSwiper = ({
  cards,
  renderCard,
  onSwiped = () => {},
  onSwipedLeft = () => {},
  onSwipedRight = () => {},
  onSwipedAll = () => {},
  cardIndex: initialCardIndex = 0,
  backgroundColor = 'transparent',
  stackSize = 3,
  stackSeparation = 15,
  cardVerticalMargin = 10,
  animateCardOpacity = false,
  overlayLabels = {},
}: SwiperProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialCardIndex);
  const position = useRef(new Animated.ValueXY()).current;
  const rotation = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });
  const opacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [0, 1, 0],
    extrapolate: 'clamp',
  });

  // Overlay label opacity
  const leftLabelOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const rightLabelOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  useEffect(() => {
    setCurrentIndex(initialCardIndex);
  }, [initialCardIndex]);

  useEffect(() => {
    position.setValue({ x: 0, y: 0 });
  }, [currentIndex]);

  const forceSwipe = (direction: 'left' | 'right') => {
    const x = direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: true,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction: 'left' | 'right') => {
    const cardIdx = currentIndex;
    direction === 'right' ? onSwipedRight(cardIdx) : onSwipedLeft(cardIdx);
    onSwiped(cardIdx);
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= cards.length) {
        setTimeout(() => {
          onSwipedAll();
        }, 300);
      }
      return next;
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const getCardStyle = (index: number) => {
    const isActive = index === currentIndex;
    const isInStack = index > currentIndex && index < currentIndex + stackSize;

    if (isActive) {
      return [
        {
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { rotate: rotation },
          ],
          zIndex: cards.length,
        },
      ];
    } else if (isInStack) {
      const stackPosition = index - currentIndex;
      return [
        {
          transform: [
            { translateY: stackPosition * stackSeparation },
            { scale: 1 - stackPosition * 0.05 },
          ],
          opacity: animateCardOpacity ? 1 - stackPosition * 0.2 : 1,
          zIndex: cards.length - stackPosition,
        },
      ];
    }
    return { display: 'none' };
  };

  const renderCards = () => {
    if (currentIndex >= cards.length) {
      return null;
    }

    return cards
      .map((card, i) => {
        if (i < currentIndex) return null;
        if (i > currentIndex + stackSize - 1) return null;

        const isTopCard = i === currentIndex;
        const panHandlers = isTopCard ? panResponder.panHandlers : {};

        return (
          <Animated.View
            key={i}
            style={[styles.cardStyle, getCardStyle(i)]}
            {...panHandlers}
          >
            {renderCard(card)}
            
            {/* Overlay labels */}
            {isTopCard && overlayLabels && (
              <>
                {overlayLabels.left && (
                  <Animated.View
                    style={[
                      styles.overlayLabel,
                      overlayLabels.left.style?.wrapper,
                      { opacity: leftLabelOpacity, left: 20 },
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.overlayLabelInner,
                        overlayLabels.left.style?.label,
                      ]}
                    >
                      {overlayLabels.left.title && (
                        <Animated.Text style={styles.overlayText}>
                          {overlayLabels.left.title}
                        </Animated.Text>
                      )}
                    </Animated.View>
                  </Animated.View>
                )}

                {overlayLabels.right && (
                  <Animated.View
                    style={[
                      styles.overlayLabel,
                      overlayLabels.right.style?.wrapper,
                      { opacity: rightLabelOpacity, right: 20 },
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.overlayLabelInner,
                        overlayLabels.right.style?.label,
                      ]}
                    >
                      {overlayLabels.right.title && (
                        <Animated.Text style={styles.overlayText}>
                          {overlayLabels.right.title}
                        </Animated.Text>
                      )}
                    </Animated.View>
                  </Animated.View>
                )}
              </>
            )}
          </Animated.View>
        );
      })
      .reverse();
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {renderCards()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  cardStyle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  overlayLabel: {
    position: 'absolute',
    top: 30,
    zIndex: 100,
  },
  overlayLabelInner: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    borderRadius: 5,
  },
  overlayText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 24,
  },
});

export default CustomSwiper;