import React, { useEffect, useRef } from 'react';
import { Animated, View, type DimensionValue, type ViewStyle } from 'react-native';

interface SkeletonProps {
  width: DimensionValue;
  height: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

/** A single pulsing placeholder block. */
export const Skeleton = ({ width, height, borderRadius = 8, style }: SkeletonProps) => {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: '#2a2a2a', opacity }, style]}
    />
  );
};

/** A horizontal row of poster-card placeholders (matches the home movie rows). */
export const MovieRowSkeleton = ({ count = 5 }: { count?: number }) => (
  <View style={{ flexDirection: 'row', paddingLeft: 10, marginVertical: 10 }}>
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} style={{ marginRight: 12 }}>
        <Skeleton width={110} height={160} borderRadius={10} />
        <Skeleton width={90} height={12} borderRadius={6} style={{ marginTop: 8 }} />
      </View>
    ))}
  </View>
);

/** A vertical list of watchlist row placeholders. */
export const WatchlistSkeleton = ({ count = 6 }: { count?: number }) => (
  <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} style={{ flexDirection: 'row', marginBottom: 16 }}>
        <Skeleton width={80} height={110} borderRadius={8} />
        <View style={{ flex: 1, marginLeft: 12, justifyContent: 'center' }}>
          <Skeleton width="70%" height={16} borderRadius={6} />
          <Skeleton width="45%" height={12} borderRadius={6} style={{ marginTop: 10 }} />
          <Skeleton width="90%" height={12} borderRadius={6} style={{ marginTop: 8 }} />
        </View>
      </View>
    ))}
  </View>
);

/** A full-size swipe-card placeholder (Tinder screen). */
export const TinderCardSkeleton = () => (
  <View style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
    <Skeleton width="92%" height="88%" borderRadius={20} />
  </View>
);

/** A wrapped grid of poster placeholders (Mood results). */
export const MovieGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <View
    style={{
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 8,
    }}
  >
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} style={{ width: '31%', marginBottom: 16 }}>
        <Skeleton width="100%" height={150} borderRadius={10} />
        <Skeleton width="80%" height={10} borderRadius={5} style={{ marginTop: 6 }} />
      </View>
    ))}
  </View>
);

export default Skeleton;
