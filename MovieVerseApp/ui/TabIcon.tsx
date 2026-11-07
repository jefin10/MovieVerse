import { Icon, type IconName } from './Icon';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { duration, easing } from './motion';
import { color, font, icon } from './tokens';

const useActive = (focused: boolean) => {
  const on = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    on.value = withTiming(focused ? 1 : 0, { duration: duration.fast, easing: focused ? easing.enter : easing.exit });
  }, [focused, on]);
  return on;
};

/** Active and inactive icons crossfade in 150ms (opacity only, no bounce). */
export const TabIcon = ({ name, focused }: { name: IconName; focused: boolean }) => {
  const on = useActive(focused);
  const active = useAnimatedStyle(() => ({ opacity: on.value }));
  const idle = useAnimatedStyle(() => ({ opacity: 1 - on.value }));
  return (
    <View style={styles.icon}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.center, idle]}>
        <Icon name={name} size={icon.nav} color={color.textTertiary} />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, styles.center, active]}>
        <Icon name={name} size={icon.nav} color={color.text} />
      </Animated.View>
    </View>
  );
};

/** The label crossfades with its icon. */
export const TabLabel = ({ label, focused }: { label: string; focused: boolean }) => {
  const on = useActive(focused);
  const active = useAnimatedStyle(() => ({ opacity: on.value }));
  const idle = useAnimatedStyle(() => ({ opacity: 1 - on.value }));
  return (
    <View>
      <Animated.Text style={[font.caption, { color: color.textTertiary }, idle]}>{label}</Animated.Text>
      <Animated.Text style={[font.caption, styles.overlay, { color: color.text }, active]}>{label}</Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  icon: { width: icon.nav, height: icon.nav },
  center: { alignItems: 'center', justifyContent: 'center' },
  overlay: { position: 'absolute', left: 0, right: 0, textAlign: 'center' },
});
