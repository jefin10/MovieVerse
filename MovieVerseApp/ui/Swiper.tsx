import * as Haptics from 'expo-haptics';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { Text } from './Text';
import { easing, exitDuration, spring } from './motion';
import { color, radius, space } from './tokens';

type Direction = 'left' | 'right';
export type SwiperHandle = { swipe: (direction: Direction) => void };

type Props<T> = {
  cards: T[];
  renderCard: (card: T) => React.ReactNode;
  keyFor: (card: T, index: number) => string;
  onSwiped: (card: T, direction: Direction) => void;
  onSwipedAll?: () => void;
  leftLabel?: string;
  rightLabel?: string;
};

const STACK = 3;
const VELOCITY = 800;

/**
 * A deck of cards. The finger moves the top card directly; release far or fast
 * enough and it leaves (175ms, ease-in), otherwise it springs back without bouncing.
 * The next card grows into place as the top one moves away.
 */
function SwiperInner<T>({ cards, renderCard, keyFor, onSwiped, onSwipedAll, leftLabel, rightLabel }: Props<T>, ref: React.Ref<SwiperHandle>) {
  const { width } = useWindowDimensions();
  const threshold = width * 0.25;
  const [index, setIndex] = useState(0);
  const current = useSharedValue(0);
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  // A new deck starts from the top.
  useEffect(() => {
    setIndex(0);
    current.value = 0;
    x.value = 0;
    y.value = 0;
  }, [cards, current, x, y]);

  const settle = (i: number, direction: Direction) => {
    setIndex(i + 1);
    const card = cards[i];
    if (card) onSwiped(card, direction);
    if (direction === 'right') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (i + 1 >= cards.length) onSwipedAll?.();
  };

  const total = cards.length;
  const fling = (direction: Direction, velocity = 0) => {
    'worklet';
    const i = current.value;
    if (i >= total) return;
    x.value = withTiming(
      (direction === 'right' ? 1 : -1) * width * 1.5,
      { duration: exitDuration.base, easing: easing.exit },
      (done) => {
        if (!done) return;
        // Advance and reset in the same frame so nothing flickers.
        current.value = i + 1;
        x.value = 0;
        y.value = 0;
        runOnJS(settle)(i, direction);
      },
    );
    y.value = withTiming(y.value + velocity * 0.05, { duration: exitDuration.base, easing: easing.exit });
  };

  useImperativeHandle(ref, () => ({ swipe: (direction) => fling(direction) }));

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      x.value = e.translationX;
      y.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationX > threshold || e.velocityX > VELOCITY) fling('right', e.velocityY);
      else if (e.translationX < -threshold || e.velocityX < -VELOCITY) fling('left', e.velocityY);
      else {
        x.value = withSpring(0, { ...spring, velocity: e.velocityX });
        y.value = withSpring(0, { ...spring, velocity: e.velocityY });
      }
    });

  const visible = cards.slice(index, index + STACK + 1).map((card, offset) => ({ card, absolute: index + offset }));

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.deck}>
        {visible
          .slice()
          .reverse()
          .map(({ card, absolute }) => (
            <DeckCard
              key={keyFor(card, absolute)}
              position={absolute}
              current={current}
              x={x}
              y={y}
              threshold={threshold}
              width={width}
              leftLabel={leftLabel}
              rightLabel={rightLabel}
            >
              {renderCard(card)}
            </DeckCard>
          ))}
      </View>
    </GestureDetector>
  );
}

type CardProps = {
  children: React.ReactNode;
  position: number;
  current: SharedValue<number>;
  x: SharedValue<number>;
  y: SharedValue<number>;
  threshold: number;
  width: number;
  leftLabel?: string;
  rightLabel?: string;
};

const DeckCard = ({ children, position, current, x, y, threshold, width, leftLabel, rightLabel }: CardProps) => {
  const card = useAnimatedStyle(() => {
    const depth = position - current.value;
    let opacity = 1;
    let tx = 0;
    let ty = 0;
    let scale = 1;
    let rotate = 0;
    if (depth < 0) opacity = 0;
    else if (depth === 0) {
      tx = x.value;
      ty = y.value;
      rotate = interpolate(x.value, [-width / 2, 0, width / 2], [-8, 0, 8], 'clamp');
    } else {
      // Cards underneath sit a little lower and smaller; the next one grows as the top card leaves.
      const lift = depth === 1 ? Math.min(Math.abs(x.value) / threshold, 1) : 0;
      const level = depth - lift;
      opacity = depth < STACK ? 1 : 0;
      ty = level * space.md;
      scale = 1 - level * 0.04;
    }
    return { opacity, transform: [{ translateX: tx }, { translateY: ty }, { scale }, { rotate: `${rotate}deg` }] as const };
  });
  const left = useAnimatedStyle(() => ({
    opacity: position === current.value ? interpolate(x.value, [-threshold, 0], [1, 0], 'clamp') : 0,
  }));
  const right = useAnimatedStyle(() => ({
    opacity: position === current.value ? interpolate(x.value, [0, threshold], [0, 1], 'clamp') : 0,
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, card]}>
      {children}
      {leftLabel ? (
        <Animated.View style={[styles.label, styles.labelLeft, left]} pointerEvents="none">
          <Text variant="label" bold>
            {leftLabel}
          </Text>
        </Animated.View>
      ) : null}
      {rightLabel ? (
        <Animated.View style={[styles.label, styles.labelRight, right]} pointerEvents="none">
          <Text variant="label" bold tone="inverse">
            {rightLabel}
          </Text>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
};

export const Swiper = forwardRef(SwiperInner) as <T>(props: Props<T> & { ref?: React.Ref<SwiperHandle> }) => React.ReactElement;

const styles = StyleSheet.create({
  deck: { flex: 1 },
  label: {
    position: 'absolute',
    top: space.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.control,
  },
  labelLeft: { right: space.lg, backgroundColor: color.raised },
  labelRight: { left: space.lg, backgroundColor: color.text },
});
