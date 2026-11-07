import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { usePosterColumnWidth } from './Poster';
import { shimmerLoop } from './motion';
import { color, font, gutter, radius, size, space } from './tokens';

type BlockProps = { width: DimensionValue; height: number; round?: boolean; style?: StyleProp<ViewStyle> };

/** A placeholder block. One soft sweep of light crosses it every 1.4s (static with reduce motion). */
export const Block = ({ width, height, round, style }: BlockProps) => {
  const reduceMotion = useReducedMotion();
  const [w, setW] = useState(0);
  const sweep = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion || !w) return;
    sweep.value = withRepeat(withTiming(1, { duration: shimmerLoop, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(sweep);
  }, [reduceMotion, w, sweep]);

  const band = useAnimatedStyle(() => ({ transform: [{ translateX: -w + sweep.value * w * 2 }] }));

  return (
    <View
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={[{ width, height, borderRadius: round ? radius.control : radius.container }, styles.block, style]}
    >
      {w && !reduceMotion ? (
        <Animated.View style={[StyleSheet.absoluteFill, band]}>
          <LinearGradient
            colors={['transparent', color.shimmer, 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ) : null}
    </View>
  );
};

/** A line of text that hasn't loaded. */
export const Line = ({ width, variant = 'body' }: { width: DimensionValue; variant?: keyof typeof font }) => (
  <Block width={width} height={font[variant].fontSize} round />
);

export const PosterRowSkeleton = () => (
  <View style={styles.posterRow}>
    {[0, 1, 2, 3].map((i) => (
      <View key={i} style={styles.posterItem}>
        <Block width={size.posterWidth} height={size.posterWidth * 1.5} />
        <Line width={size.posterWidth - space.xl} variant="label" />
      </View>
    ))}
  </View>
);

export const PosterGridSkeleton = ({ count = 9 }: { count?: number }) => {
  const width = usePosterColumnWidth();
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.posterItem}>
          <Block width={width} height={width * 1.5} />
          <Line width={width - space.xl} variant="label" />
        </View>
      ))}
    </View>
  );
};

/** Rows matching ListRow: a thumbnail (or avatar) and two lines. */
export const ListSkeleton = ({ count = 6, avatar }: { count?: number; avatar?: boolean }) => (
  <View>
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} style={styles.row}>
        {avatar ? <Block width={size.avatar} height={size.avatar} round /> : <Block width={size.thumbWidth} height={size.thumbHeight} />}
        <View style={styles.rowText}>
          <Line width="60%" />
          <Line width="40%" variant="label" />
        </View>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  block: { backgroundColor: color.surface, overflow: 'hidden' },
  posterRow: { flexDirection: 'row', gap: space.md, marginRight: -gutter, overflow: 'hidden' },
  posterItem: { gap: space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: space.md, rowGap: space.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
  rowText: { flex: 1, gap: space.sm },
});
