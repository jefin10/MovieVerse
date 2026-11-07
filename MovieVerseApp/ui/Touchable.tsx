import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { duration, easing, press } from './motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /** `scale` for buttons and cards; `opacity` for full-width rows. */
  feedback?: 'scale' | 'opacity';
  /** Light haptic on press: primary actions and toggles. */
  haptic?: boolean;
};

/**
 * Every tappable element. Press: scale to 0.97 and dim slightly in 100ms, then
 * return. Interruptible: a new touch picks up from wherever the animation is.
 */
export const Touchable = ({ style, feedback = 'scale', haptic, onPressIn, onPressOut, onPress, children, ...rest }: Props) => {
  const reduceMotion = useReducedMotion();
  const pressed = useSharedValue(0);

  const animated = useAnimatedStyle(() => ({
    opacity: interpolate(pressed.value, [0, 1], [1, press.opacity]),
    transform: feedback === 'scale' && !reduceMotion ? [{ scale: interpolate(pressed.value, [0, 1], [1, press.scale]) }] : [],
  }));

  return (
    <AnimatedPressable
      {...rest}
      style={[style, animated]}
      onPressIn={(e) => {
        pressed.value = withTiming(1, { duration: duration.instant, easing: easing.enter });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        pressed.value = withTiming(0, { duration: duration.instant, easing: easing.exit });
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress?.(e);
      }}
    >
      {children}
    </AnimatedPressable>
  );
};

export default Touchable;
