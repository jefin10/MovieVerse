import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Image from '@/app/components/CachedImage';
import { duration, easing, spring } from './motion';
import { Touchable } from './Touchable';
import { color, font, radius, size, space } from './tokens';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** A logo or poster to show before the label. */
  imageUri?: string;
  /** Selection chips are checkboxes to screen readers; action chips are buttons. */
  role?: 'checkbox' | 'button';
  style?: StyleProp<ViewStyle>;
};

/** One chip style: 44 tall, fully rounded. Selection crossfades in 150ms. */
export const Chip = ({ label, selected = false, onPress, imageUri, role = 'checkbox', style }: ChipProps) => {
  const on = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    on.value = withTiming(selected ? 1 : 0, { duration: duration.fast, easing: easing.enter });
  }, [selected, on]);

  const fill = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(on.value, [0, 1], [color.raised, color.text]) }));
  const ink = useAnimatedStyle(() => ({ color: interpolateColor(on.value, [0, 1], [color.text, color.inverse]) }));

  return (
    <Touchable
      onPress={() => {
        if (role === 'checkbox') Haptics.selectionAsync().catch(() => {});
        onPress?.();
      }}
      disabled={!onPress}
      accessibilityRole={role}
      accessibilityState={role === 'checkbox' ? { checked: selected } : undefined}
      accessibilityLabel={label}
      style={style}
    >
      <Animated.View style={[styles.chip, imageUri ? styles.withImage : null, fill]}>
        {imageUri ? <Image source={{ uri: imageUri }} style={styles.image} /> : null}
        <Animated.Text style={[font.label, ink]} numberOfLines={1}>
          {label}
        </Animated.Text>
      </Animated.View>
    </Touchable>
  );
};

type Option<T> = { value: T; label: string };

/** Single choice. The white indicator slides between options instead of jumping. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const segment = width / options.length;
  const x = useSharedValue(0);

  useEffect(() => {
    x.value = width ? withSpring(index * segment, spring) : index * segment;
  }, [index, segment, width, x]);

  const indicator = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View style={[styles.track, style]} onLayout={(e) => setWidth(e.nativeEvent.layout.width - space.xs * 2)} accessibilityRole="radiogroup">
      {width ? <Animated.View style={[styles.indicator, { width: segment }, indicator]} /> : null}
      {options.map((o, i) => (
        <Pressable
          key={o.value}
          style={styles.segment}
          hitSlop={{ top: space.xs, bottom: space.xs }}
          onPress={() => {
            if (i === index) return;
            Haptics.selectionAsync().catch(() => {});
            onChange(o.value);
          }}
          accessibilityRole="radio"
          accessibilityState={{ selected: i === index }}
        >
          <SegmentLabel label={o.label} active={i === index} />
        </Pressable>
      ))}
    </View>
  );
}

const SegmentLabel = ({ label, active }: { label: string; active: boolean }) => {
  const on = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    on.value = withTiming(active ? 1 : 0, { duration: duration.fast, easing: easing.enter });
  }, [active, on]);
  const ink = useAnimatedStyle(() => ({ color: interpolateColor(on.value, [0, 1], [color.text, color.inverse]) }));
  return (
    <Animated.Text style={[font.label, ink]} numberOfLines={1}>
      {label}
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  chip: {
    height: size.chip,
    borderRadius: radius.control,
    paddingHorizontal: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    maxWidth: '100%',
  },
  withImage: { paddingLeft: space.sm },
  image: { width: size.chipImage, height: size.chipImage, borderRadius: radius.control },
  track: {
    height: size.chip,
    borderRadius: radius.control,
    backgroundColor: color.raised,
    flexDirection: 'row',
    padding: space.xs,
  },
  indicator: {
    position: 'absolute',
    top: space.xs,
    bottom: space.xs,
    left: space.xs,
    borderRadius: radius.control,
    backgroundColor: color.text,
  },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
