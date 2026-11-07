import { Icon, type IconName } from './Icon';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { CountUp } from './Motion';
import { duration, easing } from './motion';
import { Text } from './Text';
import { Touchable } from './Touchable';
import { color, icon, radius, size, space } from './tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'text';

const fill: Record<ButtonVariant, string> = { primary: color.text, secondary: color.raised, text: 'transparent' };
const ink: Record<ButtonVariant, string> = { primary: color.inverse, secondary: color.text, text: color.text };

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  /** A brand mark that isn't in the icon set (Google), at the inline icon size. */
  leading?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/**
 * Three variants, one shape: 52 tall, fully rounded, 24 side padding, 16 bold.
 * States: default, pressed (Touchable), disabled (40%), loading (label fades
 * to a spinner in 150ms, size unchanged).
 */
export const Button = ({ title, onPress, variant = 'primary', icon: iconName, leading, loading, disabled, style, accessibilityLabel }: ButtonProps) => {
  const busy = useSharedValue(loading ? 1 : 0);
  useEffect(() => {
    busy.value = withTiming(loading ? 1 : 0, { duration: duration.fast, easing: loading ? easing.enter : easing.exit });
  }, [loading, busy]);
  const labelStyle = useAnimatedStyle(() => ({ opacity: 1 - busy.value }));
  const spinnerStyle = useAnimatedStyle(() => ({ opacity: busy.value }));

  return (
    <Touchable
      onPress={onPress}
      disabled={disabled || loading}
      haptic={variant === 'primary'}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      style={[styles.base, { backgroundColor: fill[variant] }, disabled && styles.disabled, style]}
    >
      <Animated.View style={[styles.row, labelStyle]}>
        {leading}
        {iconName ? <Icon name={iconName} size={icon.inline} color={ink[variant]} /> : null}
        <Text bold numberOfLines={1} style={{ color: ink[variant] }}>
          {title}
        </Text>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, styles.center, spinnerStyle]} pointerEvents="none">
        {loading ? <ActivityIndicator size="small" color={ink[variant]} /> : null}
      </Animated.View>
    </Touchable>
  );
};

type IconButtonProps = {
  name: IconName;
  onPress?: () => void;
  label: string;
  /** `media` puts a scrim behind the icon so it reads over posters. */
  tone?: 'plain' | 'media';
  badge?: number;
  style?: StyleProp<ViewStyle>;
};

/** A 44px target holding one 24px icon. */
export const IconButton = ({ name, onPress, label, tone = 'plain', badge, style }: IconButtonProps) => (
  <Touchable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={badge ? `${label}, ${badge} unread` : label}
    hitSlop={space.xs}
    style={[styles.iconButton, tone === 'media' && styles.media, style]}
  >
    <Icon name={name} size={icon.action} color={color.text} />
    {badge ? (
      <View style={styles.badge}>
        <CountUp value={Math.min(badge, 9)} variant="caption" tone="inverse" bold suffix={badge > 9 ? '+' : ''} />
      </View>
    ) : null}
  </Touchable>
);

const styles = StyleSheet.create({
  base: {
    height: size.control,
    borderRadius: radius.control,
    paddingHorizontal: space.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  center: { alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.4 },
  iconButton: {
    width: size.iconButton,
    height: size.iconButton,
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  media: { backgroundColor: color.mediaScrim },
  badge: {
    position: 'absolute',
    top: space.xs,
    right: space.xs,
    minWidth: space.lg,
    height: space.lg,
    paddingHorizontal: space.xs,
    borderRadius: radius.control,
    backgroundColor: color.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
