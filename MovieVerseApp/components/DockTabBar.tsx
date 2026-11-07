import { Feather } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/*
 * Floating frosted-glass dock that replaces the default tab bar.
 * Swipe (the "tinder" tab) is the raised round button in the middle, and
 * Profile sits at the end; it opens the profile page.
 * Screens scroll underneath, so each tab screen pads its content with useDockSpace().
 */

export const DOCK_HEIGHT = 64;
const DOCK_GAP = 10; // space between the dock and the bottom system bar
const CENTER_ROUTE = 'tinder';

const ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  index: 'home',
  watchlist: 'bookmark',
  tinder: 'layers',
  mood: 'smile',
};

/** Bottom padding a tab screen needs so its last item clears the dock. */
export function useDockSpace(extra = 16) {
  const insets = useSafeAreaInsets();
  return DOCK_HEIGHT + DOCK_GAP + insets.bottom + extra;
}

const haptic = () => {
  if (process.env.EXPO_OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

function DockItem({
  label,
  icon,
  focused,
  onPress,
  onLongPress,
}: {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  focused: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const on = useRef(new Animated.Value(focused ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(on, { toValue: focused ? 1 : 0, useNativeDriver: true, speed: 18, bounciness: 9 }).start();
  }, [focused, on]);

  const color = focused ? '#fff' : 'rgba(255,255,255,0.55)';
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={haptic}
      style={styles.item}
      hitSlop={4}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
    >
      <Animated.View
        style={{
          transform: [
            { translateY: on.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) },
            { scale: on.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) },
          ],
        }}
      >
        <Feather name={icon} size={21} color={color} />
      </Animated.View>
      <Text style={[styles.label, { color }, focused && styles.labelOn]} numberOfLines={1}>
        {label}
      </Text>
      <Animated.View style={[styles.dot, { opacity: on, transform: [{ scale: on }] }]} />
    </Pressable>
  );
}

function CenterButton({
  label,
  icon,
  focused,
  onPress,
  onLongPress,
}: {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  focused: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const press = useRef(new Animated.Value(1)).current;
  const spring = (to: number) => Animated.spring(press, { toValue: to, useNativeDriver: true, speed: 30, bounciness: 10 }).start();

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => {
        haptic();
        spring(0.9);
      }}
      onPressOut={() => spring(1)}
      style={styles.item}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
    >
      <Animated.View style={[styles.fab, focused && styles.fabOn, { transform: [{ scale: press }] }]}>
        <Feather name={icon} size={24} color="#000" />
      </Animated.View>
      <Text style={[styles.label, styles.fabLabel, { color: focused ? '#fff' : 'rgba(255,255,255,0.55)' }, focused && styles.labelOn]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function DockTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  // Keep the dock out of the way while typing.
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (keyboardOpen) return null;

  const items = state.routes.map((route, index) => {
    const { options } = descriptors[route.key];
    const focused = state.index === index;
    const label = typeof options.title === 'string' ? options.title : route.name;
    const icon = ICONS[route.name] ?? 'circle';

    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
    };
    const onLongPress = () => navigation.emit({ type: 'tabLongPress', target: route.key });

    return route.name === CENTER_ROUTE ? (
      <CenterButton key={route.key} label={label} icon={icon} focused={focused} onPress={onPress} onLongPress={onLongPress} />
    ) : (
      <DockItem key={route.key} label={label} icon={icon} focused={focused} onPress={onPress} onLongPress={onLongPress} />
    );
  });

  items.push(
    <DockItem key="profile" label="Profile" icon="user" focused={false} onPress={() => router.push('/pages/ProfilePage')} />,
  );

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: insets.bottom + DOCK_GAP }]}>
      {/* The glass: blur + dark tint + hairline edge, clipped to the rounded shape. */}
      <View pointerEvents="none" style={styles.glass}>
        {/* Real blur on iOS; Android gets expo-blur's translucent fallback. Android's
            native blur (experimentalBlurMethod="dimezisBlurView") is experimental: turn
            it on only after checking it on a real phone. */}
        <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.tint]} />
        <View style={styles.sheen} />
      </View>
      <View style={styles.row} accessibilityRole="tablist">
        {items}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    height: DOCK_HEIGHT,
  },
  glass: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  tint: {
    backgroundColor: 'rgba(22,22,22,0.55)',
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 18,
    right: 18,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  label: {
    marginTop: 3,
    fontSize: 10.5,
    fontWeight: '500',
  },
  labelOn: {
    fontWeight: '700',
  },
  dot: {
    position: 'absolute',
    bottom: 5,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  fab: {
    width: 56,
    height: 56,
    marginTop: -30,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: 'rgba(0,0,0,0.55)',
    elevation: 8,
  },
  fabOn: {
    borderColor: 'rgba(255,215,0,0.55)',
  },
  fabLabel: {
    marginTop: 2,
  },
});
