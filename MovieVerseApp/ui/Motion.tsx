import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { distance, duration, easing, stagger } from './motion';
import { Text, type TextVariant, type Tone } from './Text';
import { color, radius } from './tokens';

type RevealProps = {
  children: React.ReactNode;
  /** Position in a list: the first six are staggered, the rest arrive together. */
  index?: number;
  /** Only on a screen's first load; pass false for later renders. */
  animate?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Content arrival: fade and rise 8px in 250ms, staggered 35ms per item. */
export const Reveal = ({ children, index = 0, animate = true, style }: RevealProps) => {
  const reduceMotion = useReducedMotion();
  const shown = useSharedValue(animate ? 0 : 1);

  useEffect(() => {
    if (!animate) return;
    const delay = reduceMotion ? 0 : Math.min(index, stagger.maxItems) * stagger.step;
    shown.value = withDelay(delay, withTiming(1, { duration: duration.base, easing: easing.enter }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animated = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: reduceMotion ? [] : [{ translateY: (1 - shown.value) * distance.rise }],
  }));

  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
};

type CountUpProps = {
  value: number;
  variant?: TextVariant;
  tone?: Tone;
  bold?: boolean;
  suffix?: string;
};

/** A number that moves to its new value over 400ms, easing out. */
export const CountUp = ({ value, variant = 'body', tone = 'primary', bold, suffix = '' }: CountUpProps) => {
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    if (reduceMotion || from.current === value) {
      from.current = value;
      setShown(value);
      return;
    }
    const start = from.current;
    const began = Date.now();
    let frame = 0;
    const tick = () => {
      const t = Math.min((Date.now() - began) / duration.count, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(start + (value - start) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
      else from.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, reduceMotion]);

  return (
    <Text variant={variant} tone={tone} bold={bold}>
      {shown}
      {suffix}
    </Text>
  );
};

/** A bar that grows from its previous value to the new one over 400ms (scaleX only). */
export const ProgressBar = ({ value, style }: { value: number; style?: StyleProp<ViewStyle> }) => {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(Math.max(0, Math.min(1, value)), { duration: duration.count, easing: easing.enter });
  }, [value, progress]);
  const fill = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.value }] }));
  return (
    <View style={[styles.track, style]}>
      <Animated.View style={[styles.fill, fill]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: { height: 4, borderRadius: radius.control, backgroundColor: color.divider, overflow: 'hidden' },
  fill: { ...StyleSheet.absoluteFillObject, backgroundColor: color.text, transformOrigin: 'left' },
});
